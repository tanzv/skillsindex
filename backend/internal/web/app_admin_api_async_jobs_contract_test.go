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

func TestAPIAdminJobsListIncludesSyncRunID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(101)
	actorID := uint(102)

	started, err := app.syncGovernanceSvc.Start(context.Background(), services.StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		OwnerUserID:   &ownerID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: "digest-admin-jobs-list-sync-run-id",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to start governed async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/jobs?limit=10", nil)
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminJobs(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	items, ok := payload["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("missing items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	if got, ok := item["sync_run_id"].(float64); !ok || uint(got) != started.Run.ID {
		t.Fatalf("unexpected sync_run_id: got=%#v want=%d item=%#v", item["sync_run_id"], started.Run.ID, item)
	}
}

func TestAPIAdminJobDetailIncludesSyncRunID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(111)
	actorID := uint(112)

	started, err := app.syncGovernanceSvc.Start(context.Background(), services.StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		OwnerUserID:   &ownerID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: "digest-admin-job-detail-sync-run-id",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to start governed async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/jobs/%d", started.Job.ID), nil)
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleAdmin})
	req = withURLParam(req, "jobID", fmt.Sprintf("%d", started.Job.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminJobDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, ok := item["sync_run_id"].(float64); !ok || uint(got) != started.Run.ID {
		t.Fatalf("unexpected sync_run_id: got=%#v want=%d item=%#v", item["sync_run_id"], started.Run.ID, item)
	}
}

func TestAPIAdminJobRetryReturnsUpdatedGovernedJobSnapshot(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(121)
	actorID := uint(122)

	started, err := app.syncGovernanceSvc.Start(context.Background(), services.StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		OwnerUserID:   &ownerID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: "digest-admin-job-retry-response-sync-run-id",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to start governed async job: %v", err)
	}
	if _, err := app.syncGovernanceSvc.Complete(context.Background(), services.CompleteSyncGovernanceInput{
		RunID:        started.Run.ID,
		JobID:        started.Job.ID,
		Candidates:   1,
		Failed:       1,
		FinishedAt:   time.Now().UTC().Add(2 * time.Second),
		ErrorCode:    "sync_failed",
		ErrorMessage: "temporary timeout",
		ErrorSummary: "temporary timeout",
	}); err != nil {
		t.Fatalf("failed to complete governed async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/jobs/%d/retry", started.Job.ID), nil)
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleAdmin})
	req = withURLParam(req, "jobID", fmt.Sprintf("%d", started.Job.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminJobRetry(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["status"].(string); got != string(models.AsyncJobStatusRunning) {
		t.Fatalf("unexpected status: got=%q item=%#v", got, item)
	}
	if got, ok := item["attempt"].(float64); !ok || int(got) != 2 {
		t.Fatalf("unexpected attempt: got=%#v item=%#v", item["attempt"], item)
	}
	if got, ok := item["sync_run_id"].(float64); !ok || uint(got) == started.Run.ID {
		t.Fatalf("expected retry response to expose new sync_run_id: got=%#v old=%d item=%#v", item["sync_run_id"], started.Run.ID, item)
	}
}

func TestAPIAdminJobCancelReturnsUpdatedGovernedJobSnapshot(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(131)
	actorID := uint(132)

	started, err := app.syncGovernanceSvc.Start(context.Background(), services.StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		OwnerUserID:   &ownerID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: "digest-admin-job-cancel-response-sync-run-id",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to start governed async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/jobs/%d/cancel", started.Job.ID), nil)
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleAdmin})
	req = withURLParam(req, "jobID", fmt.Sprintf("%d", started.Job.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminJobCancel(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["status"].(string); got != string(models.AsyncJobStatusCanceled) {
		t.Fatalf("unexpected status: got=%q item=%#v", got, item)
	}
	if got, ok := item["attempt"].(float64); !ok || int(got) != 1 {
		t.Fatalf("unexpected attempt: got=%#v item=%#v", item["attempt"], item)
	}
	if got, ok := item["sync_run_id"].(float64); !ok || uint(got) != started.Run.ID {
		t.Fatalf("unexpected sync_run_id: got=%#v want=%d item=%#v", item["sync_run_id"], started.Run.ID, item)
	}
}
