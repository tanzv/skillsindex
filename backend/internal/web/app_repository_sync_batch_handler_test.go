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

func TestHandleRepositorySyncBatchUsesGovernanceLifecycle(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.syncGovernanceSvc = services.NewSyncGovernanceService(app.asyncJobSvc, app.syncJobSvc, nil, app.auditService)
	app.repoSyncBatchRunner = func(context.Context, *uint, *time.Time, int) (services.RepositorySyncSummary, error) {
		return services.RepositorySyncSummary{Candidates: 2, Synced: 2, Failed: 0}, nil
	}

	req := httptest.NewRequest(http.MethodPost, "/admin/repository-sync", strings.NewReader("scope=owned&limit=2"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 7, Role: models.RoleMember})
	recorder := httptest.NewRecorder()

	app.handleRepositorySyncBatch(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	jobs, err := app.asyncJobSvc.List(context.Background(), services.ListAsyncJobsInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list async jobs: %v", err)
	}
	if len(jobs) != 1 {
		t.Fatalf("expected one async job, got=%d", len(jobs))
	}
	if jobs[0].Status != models.AsyncJobStatusSucceeded {
		t.Fatalf("unexpected async job status: %s", jobs[0].Status)
	}
	if jobs[0].SyncRunID == nil {
		t.Fatalf("expected async job to link sync run")
	}

	runs, err := app.syncJobSvc.ListRuns(context.Background(), services.ListSyncRunsInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list sync runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("expected one sync run, got=%d", len(runs))
	}
	if runs[0].Status != services.SyncRunStatusSucceeded {
		t.Fatalf("unexpected sync run status: %s", runs[0].Status)
	}
	if runs[0].JobID == nil || *runs[0].JobID != jobs[0].ID {
		t.Fatalf("expected sync run to link async job")
	}
}

func TestHandleRepositorySyncBatchDedupedGovernanceSkipsRunner(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.syncGovernanceSvc = services.NewSyncGovernanceService(app.asyncJobSvc, app.syncJobSvc, nil, app.auditService)
	callCount := 0
	app.repoSyncBatchRunner = func(context.Context, *uint, *time.Time, int) (services.RepositorySyncSummary, error) {
		callCount++
		return services.RepositorySyncSummary{Candidates: 1, Synced: 1, Failed: 0}, nil
	}

	actorID := uint(9)
	_, err := app.syncGovernanceSvc.Start(context.Background(), services.StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "owned",
		OwnerUserID:   &actorID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: "manual:sync_repository:owned:2",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to seed active execution: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/admin/repository-sync", strings.NewReader("scope=owned&limit=2"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleMember})
	recorder := httptest.NewRecorder()

	app.handleRepositorySyncBatch(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if callCount != 0 {
		t.Fatalf("expected deduped request not to call batch runner, got=%d", callCount)
	}
	if !strings.Contains(recorder.Header().Get("Location"), "err=A+matching+repository+sync+job+is+already+running") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}
}
