package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminOpsMetricsSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	now := time.Now().UTC()
	_, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:    "manual",
		Scope:      "all",
		Candidates: 3,
		Synced:     3,
		Failed:     0,
		StartedAt:  now.Add(-2 * time.Minute),
		FinishedAt: now.Add(-1 * time.Minute),
	})
	if err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/metrics", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOpsMetrics(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing metrics item: %#v", payload)
	}
	if _, exists := item["sync_success_rate"]; !exists {
		t.Fatalf("missing sync_success_rate: %#v", item)
	}
}

func TestAPIAdminOpsAlertsPermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/alerts", nil)
	req = withCurrentUser(req, &models.User{ID: 10, Role: models.RoleMember})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOpsAlerts(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminOpsAuditExportJSON(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	adminUser, err := app.authService.Register(context.Background(), "ops-export-admin", "Export123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), adminUser.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	adminUser, err = app.authService.GetUserByID(context.Background(), adminUser.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}
	if err := app.auditService.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: adminUser.ID,
		Action:      "ops_export_test",
		TargetType:  "audit",
		Summary:     "test record",
	}); err != nil {
		t.Fatalf("failed to record audit log: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/audit-export?format=json&from=2000-01-01&to=2100-01-01", nil)
	req = withCurrentUser(req, &adminUser)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOpsAuditExport(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "application/json") {
		t.Fatalf("unexpected content type: %s", contentType)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "ops_export_test") {
		t.Fatalf("expected exported action in json body, got=%s", body)
	}
}

func TestAPIAdminOpsReleaseGatesRunSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	adminUser, err := app.authService.Register(context.Background(), "ops-gate-admin", "Export123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), adminUser.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	adminUser, err = app.authService.GetUserByID(context.Background(), adminUser.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/ops/release-gates/run", nil)
	req = withCurrentUser(req, &adminUser)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOpsReleaseGatesRun(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing release gate item in response: %#v", payload)
	}
	if _, exists := item["checks"]; !exists {
		t.Fatalf("missing checks in release gate response: %#v", item)
	}

	auditLogs, err := app.auditService.ListRecent(context.Background(), services.ListAuditInput{Limit: 20})
	if err != nil {
		t.Fatalf("failed to list audit logs: %v", err)
	}
	found := false
	for _, logItem := range auditLogs {
		if logItem.Action == "ops_release_gate_run" {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("expected ops_release_gate_run audit log")
	}
}

func TestAPIAdminOpsRecoveryDrillRunAndListSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	adminUser, err := app.authService.Register(context.Background(), "ops-drill-admin", "Export123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), adminUser.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	adminUser, err = app.authService.GetUserByID(context.Background(), adminUser.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}

	runReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ops/recovery-drills/run",
		strings.NewReader(`{"rpo_hours":0.7,"rto_hours":2.2,"note":"monthly drill"}`),
	)
	runReq.Header.Set("Content-Type", "application/json")
	runReq = withCurrentUser(runReq, &adminUser)
	runRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsRecoveryDrillRun(runRecorder, runReq)
	if runRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", runRecorder.Code, http.StatusCreated)
	}
	runPayload := decodeBodyMap(t, runRecorder)
	item, ok := runPayload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing recovery drill item in response: %#v", runPayload)
	}
	if passed, _ := item["passed"].(bool); !passed {
		t.Fatalf("expected recovery drill to pass SLA, got=%#v", item)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/recovery-drills", nil)
	listReq = withCurrentUser(listReq, &adminUser)
	listRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsRecoveryDrills(listRecorder, listReq)
	if listRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected list status code: got=%d want=%d", listRecorder.Code, http.StatusOK)
	}
	listPayload := decodeBodyMap(t, listRecorder)
	total, _ := listPayload["total"].(float64)
	if total < 1 {
		t.Fatalf("expected at least one recovery drill record, got=%v", total)
	}
}

func TestAPIAdminOpsReleasesCreateAndListSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	adminUser, err := app.authService.Register(context.Background(), "ops-release-admin", "Export123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), adminUser.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	adminUser, err = app.authService.GetUserByID(context.Background(), adminUser.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}

	createReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ops/releases",
		strings.NewReader(`{"version":"v2026.02.25","environment":"production","change_ticket":"CHG-20260225","status":"released"}`),
	)
	createReq.Header.Set("Content-Type", "application/json")
	createReq = withCurrentUser(createReq, &adminUser)
	createRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsReleasesCreate(createRecorder, createReq)
	if createRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected create status code: got=%d want=%d", createRecorder.Code, http.StatusCreated)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/releases", nil)
	listReq = withCurrentUser(listReq, &adminUser)
	listRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsReleases(listRecorder, listReq)
	if listRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected list status code: got=%d want=%d", listRecorder.Code, http.StatusOK)
	}
	listPayload := decodeBodyMap(t, listRecorder)
	total, _ := listPayload["total"].(float64)
	if total < 1 {
		t.Fatalf("expected at least one release record, got=%v", total)
	}
}

func TestAPIAdminOpsChangeApprovalsCreateAndListSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	adminUser, err := app.authService.Register(context.Background(), "ops-approval-admin", "Export123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), adminUser.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	adminUser, err = app.authService.GetUserByID(context.Background(), adminUser.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}

	createReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ops/change-approvals",
		strings.NewReader(`{"ticket_id":"CHG-20260225","reviewer":"sec-reviewer","status":"approved"}`),
	)
	createReq.Header.Set("Content-Type", "application/json")
	createReq = withCurrentUser(createReq, &adminUser)
	createRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsChangeApprovalsCreate(createRecorder, createReq)
	if createRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected create status code: got=%d want=%d", createRecorder.Code, http.StatusCreated)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/change-approvals", nil)
	listReq = withCurrentUser(listReq, &adminUser)
	listRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsChangeApprovals(listRecorder, listReq)
	if listRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected list status code: got=%d want=%d", listRecorder.Code, http.StatusOK)
	}
	listPayload := decodeBodyMap(t, listRecorder)
	total, _ := listPayload["total"].(float64)
	if total < 1 {
		t.Fatalf("expected at least one change approval record, got=%v", total)
	}
}

func TestAPIAdminOpsBackupPlanAndRunCreateAndListSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	adminUser, err := app.authService.Register(context.Background(), "ops-backup-admin", "Export123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), adminUser.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	adminUser, err = app.authService.GetUserByID(context.Background(), adminUser.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}

	planReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ops/backup/plans",
		strings.NewReader(`{"plan_key":"daily-full","backup_type":"full","schedule":"0 2 * * *","retention_days":30,"enabled":true}`),
	)
	planReq.Header.Set("Content-Type", "application/json")
	planReq = withCurrentUser(planReq, &adminUser)
	planRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsBackupPlansUpsert(planRecorder, planReq)
	if planRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected plan create status code: got=%d want=%d", planRecorder.Code, http.StatusCreated)
	}

	runReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ops/backup/runs",
		strings.NewReader(`{"plan_key":"daily-full","status":"succeeded","size_mb":2048.5,"duration_minutes":42.3}`),
	)
	runReq.Header.Set("Content-Type", "application/json")
	runReq = withCurrentUser(runReq, &adminUser)
	runRecorder := httptest.NewRecorder()

	app.handleAPIAdminOpsBackupRunsCreate(runRecorder, runReq)
	if runRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected run create status code: got=%d want=%d", runRecorder.Code, http.StatusCreated)
	}

	planListReq := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/backup/plans", nil)
	planListReq = withCurrentUser(planListReq, &adminUser)
	planListRecorder := httptest.NewRecorder()
	app.handleAPIAdminOpsBackupPlans(planListRecorder, planListReq)
	if planListRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected plan list status code: got=%d want=%d", planListRecorder.Code, http.StatusOK)
	}

	runListReq := httptest.NewRequest(http.MethodGet, "/api/v1/admin/ops/backup/runs", nil)
	runListReq = withCurrentUser(runListReq, &adminUser)
	runListRecorder := httptest.NewRecorder()
	app.handleAPIAdminOpsBackupRuns(runListRecorder, runListReq)
	if runListRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected run list status code: got=%d want=%d", runListRecorder.Code, http.StatusOK)
	}
}
