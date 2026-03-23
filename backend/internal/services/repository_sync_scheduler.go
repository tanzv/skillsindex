package services

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// RepositorySyncScheduler runs periodic repository synchronization jobs.
type RepositorySyncScheduler struct {
	coordinator    *RepositorySyncCoordinator
	batchRunner    func(context.Context, *uint, *time.Time, int) (RepositorySyncSummary, error)
	governance     *SyncGovernanceService
	interval       time.Duration
	timeout        time.Duration
	batchSize      int
	logger         *log.Logger
	policyProvider func(context.Context) (RepositorySyncPolicy, error)
}

// NewRepositorySyncScheduler constructs a periodic scheduler for repository sync jobs.
func NewRepositorySyncScheduler(
	coordinator *RepositorySyncCoordinator,
	governance *SyncGovernanceService,
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
		batchRunner:    buildRepositorySyncBatchRunner(coordinator),
		governance:     governance,
		interval:       interval,
		timeout:        timeout,
		batchSize:      batchSize,
		logger:         logger,
		policyProvider: policyProvider,
	}
}

// Start launches the periodic scheduler loop.
func (s *RepositorySyncScheduler) Start(ctx context.Context) {
	if s == nil || s.batchRunner == nil {
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
	if s.batchRunner == nil {
		s.logger.Printf("repository scheduler [%s] skipped: coordinator unavailable", trigger)
		return
	}

	startedAt := time.Now().UTC()
	dueBefore := time.Now().UTC().Add(-policy.Interval)
	runCtx, cancel := context.WithTimeout(parent, policy.Timeout)
	defer cancel()

	var execution SyncGovernanceExecution
	payloadDigest := fmt.Sprintf("scheduler:%s:%d:%s", trigger, policy.BatchSize, dueBefore.Format("200601021504"))
	if s.governance != nil {
		startedExecution, startErr := s.governance.Start(parent, StartSyncGovernanceInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			Trigger:       trigger,
			TriggerType:   normalizeSyncRunTriggerType(trigger, trigger),
			Scope:         "all",
			MaxAttempts:   3,
			PayloadDigest: payloadDigest,
			StartedAt:     startedAt,
		})
		if startErr != nil {
			s.logger.Printf("repository scheduler [%s] failed to start governed execution: %v", trigger, startErr)
		} else if startedExecution.Deduped {
			s.logger.Printf("repository scheduler [%s] skipped: active execution already exists", trigger)
			return
		} else {
			execution = startedExecution
		}
	}

	summary, err := s.batchRunner(runCtx, nil, &dueBefore, policy.BatchSize)
	if err != nil {
		s.completeGovernedExecution(parent, execution, summary, time.Now().UTC(), err, "")
		s.logger.Printf("repository scheduler [%s] failed: %v", trigger, err)
		return
	}
	errorSummary := strings.Join(summary.Errors, " | ")
	s.completeGovernedExecution(parent, execution, summary, time.Now().UTC(), nil, errorSummary)

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

func (s *RepositorySyncScheduler) completeGovernedExecution(
	ctx context.Context,
	execution SyncGovernanceExecution,
	summary RepositorySyncSummary,
	finishedAt time.Time,
	syncErr error,
	errorSummary string,
) {
	if s.governance == nil || execution.Job.ID == 0 || execution.Run.ID == 0 {
		return
	}
	errorCode := ""
	errorMessage := errorSummary
	failedCount := summary.Failed
	if syncErr != nil {
		errorCode = "sync_batch_failed"
		errorMessage = syncErr.Error()
		errorSummary = syncErr.Error()
		failedCount = maxInt(failedCount, 1)
	} else if summary.Failed > 0 {
		errorCode = "sync_partial_failed"
	}
	if _, err := s.governance.Complete(ctx, CompleteSyncGovernanceInput{
		RunID:        execution.Run.ID,
		JobID:        execution.Job.ID,
		Candidates:   summary.Candidates,
		Synced:       summary.Synced,
		Failed:       failedCount,
		FinishedAt:   finishedAt,
		ErrorCode:    errorCode,
		ErrorMessage: errorMessage,
		ErrorSummary: errorSummary,
	}); err != nil {
		s.logger.Printf("repository scheduler failed to finalize governed execution: %v", err)
	}
}

func buildRepositorySyncBatchRunner(
	coordinator *RepositorySyncCoordinator,
) func(context.Context, *uint, *time.Time, int) (RepositorySyncSummary, error) {
	if coordinator == nil {
		return nil
	}
	return coordinator.SyncBatch
}
