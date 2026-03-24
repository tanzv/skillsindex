package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminSyncJobsFiltersMatchUnifiedRunContract(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(41)
	policyID := uint(301)
	jobID := uint(501)
	targetSkillOne := uint(2001)
	targetSkillTwo := uint(2002)

	_, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		PolicyID:       &policyID,
		JobID:          &jobID,
		Trigger:        "manual",
		TriggerType:    services.SyncRunTriggerTypeManual,
		Scope:          "owned",
		Status:         services.SyncRunStatusFailed,
		OwnerUserID:    &ownerID,
		TargetSkillID:  &targetSkillOne,
		Candidates:     1,
		Failed:         1,
		ErrorCode:      "sync_failed",
		ErrorSummary:   "manual failed",
		SourceRevision: "rev-1",
		StartedAt:      time.Now().UTC().Add(-5 * time.Second),
		FinishedAt:     time.Now().UTC().Add(-4 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create failed run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		PolicyID:       &policyID,
		JobID:          &jobID,
		Trigger:        "tick",
		TriggerType:    services.SyncRunTriggerTypeScheduled,
		Scope:          "owned",
		Status:         services.SyncRunStatusSucceeded,
		OwnerUserID:    &ownerID,
		TargetSkillID:  &targetSkillTwo,
		Candidates:     1,
		Synced:         1,
		SourceRevision: "rev-2",
		StartedAt:      time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:     time.Now().UTC().Add(-2 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create succeeded run: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/admin/sync-jobs?policy_id=301&job_id=501&status=failed&trigger_type=manual&target_skill_id=2001&include_errored=true",
		nil,
	)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobs(recorder, req)
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
	if status, _ := item["status"].(string); status != services.SyncRunStatusFailed {
		t.Fatalf("unexpected status in item: %#v", item)
	}
	if targetID, _ := item["target_skill_id"].(float64); uint(targetID) != targetSkillOne {
		t.Fatalf("unexpected target skill in item: %#v", item)
	}
}

func TestAPIAdminSyncJobsRejectsInvalidTriggerType(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs?trigger_type=invalid", nil)
	req.Header.Set("X-Request-ID", "req-admin-sync-jobs-invalid-trigger")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobs(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_trigger_type" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid trigger type filter" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-sync-jobs-invalid-trigger" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSyncJobsUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs", nil)
	req.Header.Set("X-Request-ID", "req-admin-sync-jobs-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobs(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-sync-jobs-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSyncJobDetailInvalidRunIDStructuredError(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/invalid", nil)
	req.Header.Set("X-Request-ID", "req-admin-sync-job-detail-invalid-run")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "runID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_run_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid sync run id" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-sync-job-detail-invalid-run" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
