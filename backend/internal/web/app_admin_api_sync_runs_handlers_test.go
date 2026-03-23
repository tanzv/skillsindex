package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminSyncRunsFiltersByStatusTriggerAndTargetSkill(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(21)
	targetSkillOne := uint(1001)
	targetSkillTwo := uint(1002)

	_, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		TriggerType:   "manual",
		Scope:         "owned",
		Status:        services.SyncRunStatusFailed,
		OwnerUserID:   &ownerID,
		TargetSkillID: &targetSkillOne,
		Candidates:    1,
		Failed:        1,
		ErrorSummary:  "manual failed",
		StartedAt:     time.Now().UTC().Add(-5 * time.Second),
		FinishedAt:    time.Now().UTC().Add(-4 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create failed run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "tick",
		TriggerType:   "scheduled",
		Scope:         "owned",
		Status:        services.SyncRunStatusSucceeded,
		OwnerUserID:   &ownerID,
		TargetSkillID: &targetSkillTwo,
		Candidates:    1,
		Synced:        1,
		StartedAt:     time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:    time.Now().UTC().Add(-2 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create succeeded run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-runs?status=failed&trigger_type=manual&target_skill_id=1001&include_errored=true", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRuns(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if int(total) != 1 {
		t.Fatalf("unexpected total: got=%v payload=%#v", total, payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	if status, _ := item["Status"].(string); status == "" {
		status, _ = item["status"].(string)
		if status != services.SyncRunStatusFailed {
			t.Fatalf("unexpected status in item: %#v", item)
		}
	}
}

func TestAPIAdminSyncRunsMemberScopeForcesCurrentOwner(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(31)
	otherOwnerID := uint(32)

	_, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "manual",
		Scope:       "owned",
		OwnerUserID: &ownerID,
		Candidates:  1,
		Synced:      1,
		StartedAt:   time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:  time.Now().UTC().Add(-1 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create owner run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "manual",
		Scope:       "owned",
		OwnerUserID: &otherOwnerID,
		Candidates:  1,
		Synced:      1,
		StartedAt:   time.Now().UTC().Add(-1 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create other owner run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-runs?owner_id=%d", otherOwnerID), nil)
	req = withCurrentUser(req, &models.User{ID: ownerID, Role: models.RoleMember})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRuns(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if int(total) != 1 {
		t.Fatalf("unexpected total for member scope: got=%v payload=%#v", total, payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	ownerValue, _ := item["owner_user_id"].(float64)
	if ownerValue == 0 {
		ownerValue, _ = item["OwnerUserID"].(float64)
	}
	if uint(ownerValue) != ownerID {
		t.Fatalf("unexpected owner scope: got=%v want=%d item=%#v", ownerValue, ownerID, item)
	}
}

func TestAPIAdminSyncRunsRejectsInvalidTriggerType(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-runs?trigger_type=invalid", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRuns(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_trigger_type" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPIAdminSyncRunDetailIncludesVersionAndAuditSummary(t *testing.T) {
	app, db := setupSyncRunAuditWindowTestApp(t)
	owner, err := app.authService.Register(context.Background(), "sync-run-detail-owner", "password123")
	if err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	skill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Sync Run Detail Skill",
		Description:  "detail",
		Content:      "detail-content",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	startedAt := time.Now().UTC().Add(-3 * time.Second)
	run, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		Status:        services.SyncRunStatusSucceeded,
		TargetSkillID: &skill.ID,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &owner.ID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     startedAt,
		FinishedAt:    startedAt.Add(2 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}
	if err := app.skillVersionSvc.CaptureWithRunContext(context.Background(), skill.ID, "sync", &owner.ID, &run.ID); err != nil {
		t.Fatalf("failed to capture version with run context: %v", err)
	}
	if err := app.auditService.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: owner.ID,
		Action:      "api_admin_async_job_retry",
		TargetType:  "skill",
		TargetID:    skill.ID,
		Summary:     "Linked audit",
	}); err != nil {
		t.Fatalf("failed to record audit: %v", err)
	}
	var latestAudit models.AuditLog
	if err := db.Order("id DESC").First(&latestAudit).Error; err != nil {
		t.Fatalf("failed to load latest audit log: %v", err)
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", latestAudit.ID).Update("created_at", run.FinishedAt.Add(30*time.Second)).Error; err != nil {
		t.Fatalf("failed to update audit timestamp: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-runs/%d", run.ID), nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "runID", fmt.Sprintf("%d", run.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRunDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	version, ok := item["version"].(map[string]any)
	if !ok {
		t.Fatalf("expected version summary in payload: %#v", item)
	}
	if versionID, _ := version["version_id"].(float64); uint(versionID) == 0 {
		t.Fatalf("expected non-zero version id: %#v", version)
	}
	audit, ok := item["audit"].(map[string]any)
	if !ok {
		t.Fatalf("expected audit summary in payload: %#v", item)
	}
	if total, _ := audit["total"].(float64); int(total) < 1 {
		t.Fatalf("expected audit total >= 1: %#v", audit)
	}
}

func TestAPIAdminSyncRunDetailAuditSummaryExcludesLaterAuditLogs(t *testing.T) {
	app, db := setupSyncRunAuditWindowTestApp(t)
	owner, err := app.authService.Register(context.Background(), "sync-run-window-owner", "password123")
	if err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	skill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Sync Run Window Skill",
		Description:  "detail",
		Content:      "detail-content",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	startedAt := time.Now().UTC().Add(-3 * time.Minute)
	finishedAt := startedAt.Add(30 * time.Second)
	run, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		Status:        services.SyncRunStatusSucceeded,
		TargetSkillID: &skill.ID,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &owner.ID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     startedAt,
		FinishedAt:    finishedAt,
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}
	if err := app.auditService.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: owner.ID,
		Action:      "skill_sync_in_window",
		TargetType:  "skill",
		TargetID:    skill.ID,
		Summary:     "In-window audit",
	}); err != nil {
		t.Fatalf("failed to record in-window audit: %v", err)
	}
	if err := app.auditService.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: owner.ID,
		Action:      "skill_sync_late",
		TargetType:  "skill",
		TargetID:    skill.ID,
		Summary:     "Late audit",
	}); err != nil {
		t.Fatalf("failed to record late audit: %v", err)
	}

	var logs []models.AuditLog
	if err := db.Order("id ASC").Find(&logs).Error; err != nil {
		t.Fatalf("failed to load audit logs: %v", err)
	}
	if len(logs) < 2 {
		t.Fatalf("expected at least two audit logs, got=%d", len(logs))
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", logs[len(logs)-2].ID).Update("created_at", finishedAt.Add(30*time.Second)).Error; err != nil {
		t.Fatalf("failed to update in-window audit time: %v", err)
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", logs[len(logs)-1].ID).Update("created_at", finishedAt.Add(5*time.Minute)).Error; err != nil {
		t.Fatalf("failed to update late audit time: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-runs/%d", run.ID), nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "runID", fmt.Sprintf("%d", run.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRunDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	audit, ok := item["audit"].(map[string]any)
	if !ok {
		t.Fatalf("expected audit summary in payload: %#v", item)
	}
	if total, _ := audit["total"].(float64); int(total) != 1 {
		t.Fatalf("expected one in-window audit log, got=%#v", audit)
	}
	if latestAction, _ := audit["latest_action"].(string); latestAction != "skill_sync_in_window" {
		t.Fatalf("unexpected latest audit action: %#v", audit)
	}
}
