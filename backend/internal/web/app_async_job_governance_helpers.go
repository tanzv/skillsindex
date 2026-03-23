package web

import (
	"context"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) retryAsyncJob(
	ctx context.Context,
	job models.AsyncJob,
	actorUserID uint,
	now time.Time,
) (models.AsyncJob, error) {
	if a != nil && a.syncGovernanceSvc != nil && asyncJobUsesGovernanceLifecycle(job) && job.SyncRunID != nil && *job.SyncRunID != 0 {
		execution, err := a.syncGovernanceSvc.Retry(ctx, job.ID, services.RetrySyncGovernanceInput{
			ActorUserID: actorUserID,
			StartedAt:   now,
		})
		if err != nil {
			return models.AsyncJob{}, err
		}
		return execution.Job, nil
	}
	return a.asyncJobSvc.Retry(ctx, job.ID, actorUserID, now)
}

func (a *App) cancelAsyncJob(
	ctx context.Context,
	job models.AsyncJob,
	actorUserID uint,
	now time.Time,
) (models.AsyncJob, error) {
	if a != nil && a.syncGovernanceSvc != nil && asyncJobUsesGovernanceLifecycle(job) && job.SyncRunID != nil && *job.SyncRunID != 0 {
		execution, err := a.syncGovernanceSvc.Cancel(ctx, services.CancelSyncGovernanceInput{
			RunID:       *job.SyncRunID,
			JobID:       job.ID,
			ActorUserID: actorUserID,
			FinishedAt:  now,
		})
		if err != nil {
			return models.AsyncJob{}, err
		}
		return execution.Job, nil
	}
	return a.asyncJobSvc.Cancel(ctx, job.ID, actorUserID, now)
}

func asyncJobUsesGovernanceLifecycle(job models.AsyncJob) bool {
	switch job.JobType {
	case models.AsyncJobTypeSyncRepository, models.AsyncJobTypeSyncSkillMP:
		return true
	default:
		return false
	}
}
