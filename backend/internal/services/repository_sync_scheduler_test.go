package services

import (
	"context"
	"io"
	"log"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func TestRepositorySyncSchedulerCurrentPolicyUsesProvider(t *testing.T) {
	scheduler := NewRepositorySyncScheduler(
		nil,
		nil,
		30*time.Minute,
		10*time.Minute,
		20,
		log.New(io.Discard, "", 0),
		func(context.Context) (RepositorySyncPolicy, error) {
			return RepositorySyncPolicy{
				Enabled:   true,
				Interval:  5 * time.Minute,
				Timeout:   2 * time.Minute,
				BatchSize: 99,
			}, nil
		},
	)

	policy := scheduler.currentPolicy(context.Background())
	if policy.Interval != 5*time.Minute {
		t.Fatalf("unexpected interval: got=%s want=5m", policy.Interval)
	}
	if policy.Timeout != 2*time.Minute {
		t.Fatalf("unexpected timeout: got=%s want=2m", policy.Timeout)
	}
	if policy.BatchSize != 99 {
		t.Fatalf("unexpected batch size: got=%d want=99", policy.BatchSize)
	}
}

func TestRepositorySyncSchedulerRunOnceSkipsWhenDisabled(t *testing.T) {
	scheduler := NewRepositorySyncScheduler(
		nil,
		nil,
		30*time.Minute,
		10*time.Minute,
		20,
		log.New(io.Discard, "", 0),
		func(context.Context) (RepositorySyncPolicy, error) {
			return RepositorySyncPolicy{
				Enabled:   false,
				Interval:  15 * time.Minute,
				Timeout:   5 * time.Minute,
				BatchSize: 10,
			}, nil
		},
	)

	scheduler.runOnce(context.Background(), "test")
}

func TestRepositorySyncSchedulerRunOnceGovernedSuccessCreatesJobAndRun(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	asyncSvc := NewAsyncJobService(db)
	runSvc := NewSyncJobService(db)
	auditSvc := NewAuditService(db)
	governanceSvc := NewSyncGovernanceService(asyncSvc, runSvc, nil, auditSvc)

	scheduler := NewRepositorySyncScheduler(
		nil,
		governanceSvc,
		30*time.Minute,
		10*time.Minute,
		20,
		log.New(io.Discard, "", 0),
		func(context.Context) (RepositorySyncPolicy, error) {
			return RepositorySyncPolicy{
				Enabled:   true,
				Interval:  15 * time.Minute,
				Timeout:   5 * time.Minute,
				BatchSize: 8,
			}, nil
		},
	)
	scheduler.batchRunner = func(context.Context, *uint, *time.Time, int) (RepositorySyncSummary, error) {
		return RepositorySyncSummary{Candidates: 3, Synced: 3, Failed: 0}, nil
	}

	scheduler.runOnce(context.Background(), "tick")

	jobs, err := asyncSvc.List(context.Background(), ListAsyncJobsInput{Limit: 10})
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

	runs, err := runSvc.ListRuns(context.Background(), ListSyncRunsInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list sync runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("expected one sync run, got=%d", len(runs))
	}
	if runs[0].Status != SyncRunStatusSucceeded {
		t.Fatalf("unexpected sync run status: %s", runs[0].Status)
	}
	if runs[0].JobID == nil || *runs[0].JobID != jobs[0].ID {
		t.Fatalf("expected sync run to link async job")
	}
}
