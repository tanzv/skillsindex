package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// RepositorySyncScheduler runs periodic repository synchronization jobs.
type RepositorySyncScheduler struct {
	coordinator    *RepositorySyncCoordinator
	asyncJobs      *AsyncJobService
	syncRuns       *SyncJobService
	interval       time.Duration
	timeout        time.Duration
	batchSize      int
	logger         *log.Logger
	policyProvider func(context.Context) (RepositorySyncPolicy, error)
}

// NewRepositorySyncScheduler constructs a periodic scheduler for repository sync jobs.
func NewRepositorySyncScheduler(
	coordinator *RepositorySyncCoordinator,
	asyncJobs *AsyncJobService,
	syncRuns *SyncJobService,
	interval time.Duration,
	timeout time.Duration,
	batchSize int,
	logger *log.Logger,
	policyProvider func(context.Context) (RepositorySyncPolicy, error),
) *RepositorySyncScheduler {
	if interval <= 0 {
		interval = 30 * time.Minute
	}
	if timeout <= 0 {
		timeout = 10 * time.Minute
	}
	if batchSize <= 0 {
		batchSize = 20
	}
	if logger == nil {
		logger = log.Default()
	}
	return &RepositorySyncScheduler{
		coordinator:    coordinator,
		asyncJobs:      asyncJobs,
		syncRuns:       syncRuns,
		interval:       interval,
		timeout:        timeout,
		batchSize:      batchSize,
		logger:         logger,
		policyProvider: policyProvider,
	}
}

// Start launches the periodic scheduler loop.
func (s *RepositorySyncScheduler) Start(ctx context.Context) {
	if s == nil || s.coordinator == nil {
		return
	}

	go func() {
		s.runOnce(ctx, "startup")
		for {
			policy := s.currentPolicy(ctx)
			wait := policy.Interval
			if wait <= 0 {
				wait = s.interval
			}
			timer := time.NewTimer(wait)
			select {
			case <-ctx.Done():
				if !timer.Stop() {
					select {
					case <-timer.C:
					default:
					}
				}
				return
			case <-timer.C:
				s.runOnce(ctx, "tick")
			}
		}
	}()
}

func (s *RepositorySyncScheduler) runOnce(parent context.Context, trigger string) {
	policy := s.currentPolicy(parent)
	if !policy.Enabled {
		s.logger.Printf("repository scheduler [%s] skipped: policy disabled", trigger)
		return
	}
	if s.coordinator == nil {
		s.logger.Printf("repository scheduler [%s] skipped: coordinator unavailable", trigger)
		return
	}

	startedAt := time.Now().UTC()
	dueBefore := time.Now().UTC().Add(-policy.Interval)
	runCtx, cancel := context.WithTimeout(parent, policy.Timeout)
	defer cancel()

	jobID := uint(0)
	if s.asyncJobs != nil {
		payloadDigest := fmt.Sprintf("scheduler:%s:%d:%s", trigger, policy.BatchSize, dueBefore.Format("200601021504"))
		created, _, createErr := s.asyncJobs.CreateOrGetActive(parent, CreateAsyncJobInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			MaxAttempts:   3,
			PayloadDigest: payloadDigest,
		}, startedAt)
		if createErr != nil {
			s.logger.Printf("repository scheduler [%s] failed to create async job: %v", trigger, createErr)
		} else {
			jobID = created.ID
			if _, startErr := s.asyncJobs.Start(parent, created.ID, startedAt); startErr != nil && !errors.Is(startErr, ErrAsyncJobInvalidTransition) {
				s.logger.Printf("repository scheduler [%s] failed to start async job: %v", trigger, startErr)
			}
		}
	}

	summary, err := s.coordinator.SyncBatch(runCtx, nil, &dueBefore, policy.BatchSize)
	if err != nil {
		if s.asyncJobs != nil && jobID != 0 {
			_, _ = s.asyncJobs.MarkFailed(parent, jobID, "sync_batch_failed", err.Error(), time.Now().UTC())
		}
		s.recordRun(parent, RecordSyncRunInput{
			Trigger:      trigger,
			Scope:        "all",
			Candidates:   0,
			Synced:       0,
			Failed:       1,
			StartedAt:    startedAt,
			FinishedAt:   time.Now().UTC(),
			ErrorSummary: err.Error(),
		})
		s.logger.Printf("repository scheduler [%s] failed: %v", trigger, err)
		return
	}
	errorSummary := strings.Join(summary.Errors, " | ")
	if s.asyncJobs != nil && jobID != 0 {
		if summary.Failed > 0 {
			_, _ = s.asyncJobs.MarkFailed(parent, jobID, "sync_partial_failed", errorSummary, time.Now().UTC())
		} else {
			_, _ = s.asyncJobs.MarkSucceeded(parent, jobID, time.Now().UTC())
		}
	}
	s.recordRun(parent, RecordSyncRunInput{
		Trigger:      trigger,
		Scope:        "all",
		Candidates:   summary.Candidates,
		Synced:       summary.Synced,
		Failed:       summary.Failed,
		StartedAt:    startedAt,
		FinishedAt:   time.Now().UTC(),
		ErrorSummary: errorSummary,
	})

	if summary.Candidates == 0 {
		return
	}
	if summary.Failed > 0 {
		s.logger.Printf(
			"repository scheduler [%s] completed with failures: candidates=%d synced=%d failed=%d errors=%s",
			trigger,
			summary.Candidates,
			summary.Synced,
			summary.Failed,
			strings.Join(summary.Errors, " | "),
		)
		return
	}

	s.logger.Printf(
		"repository scheduler [%s] completed: candidates=%d synced=%d failed=%d",
		trigger,
		summary.Candidates,
		summary.Synced,
		summary.Failed,
	)
}

func (s *RepositorySyncScheduler) recordRun(ctx context.Context, input RecordSyncRunInput) {
	if s.syncRuns == nil {
		return
	}
	if _, err := s.syncRuns.RecordRun(ctx, input); err != nil {
		s.logger.Printf("repository scheduler failed to store sync run: %v", err)
	}
}

func (s *RepositorySyncScheduler) currentPolicy(ctx context.Context) RepositorySyncPolicy {
	policy := normalizeRepositorySyncPolicy(RepositorySyncPolicy{
		Enabled:   true,
		Interval:  s.interval,
		Timeout:   s.timeout,
		BatchSize: s.batchSize,
	})
	if s.policyProvider == nil {
		return policy
	}

	loaded, err := s.policyProvider(ctx)
	if err != nil {
		s.logger.Printf("repository scheduler failed to load policy, using bootstrap values: %v", err)
		return policy
	}
	if loaded.Interval <= 0 {
		loaded.Interval = policy.Interval
	}
	if loaded.Timeout <= 0 {
		loaded.Timeout = policy.Timeout
	}
	if loaded.BatchSize <= 0 {
		loaded.BatchSize = policy.BatchSize
	}
	return loaded
}
