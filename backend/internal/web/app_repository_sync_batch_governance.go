package web

import (
	"net/http"
	"strings"
	"time"

	"skillsindex/internal/services"
)

func (a *App) completeRepositorySyncBatchGovernance(
	r *http.Request,
	execution services.SyncGovernanceExecution,
	legacyAsyncJobID uint,
	ownerID *uint,
	actorUserID uint,
	scope string,
	summary services.RepositorySyncSummary,
	startedAt time.Time,
	finishedAt time.Time,
	syncErr error,
) {
	if a == nil || r == nil {
		return
	}
	errorSummary := ""
	if syncErr != nil {
		errorSummary = syncErr.Error()
	} else if len(summary.Errors) > 0 {
		errorSummary = strings.Join(summary.Errors, " | ")
	}
	if a.syncGovernanceSvc != nil && execution.Job.ID != 0 && execution.Run.ID != 0 {
		actorID := actorUserID
		errorCode := ""
		errorMessage := errorSummary
		failedCount := summary.Failed
		if syncErr != nil {
			errorCode = "sync_batch_failed"
			if failedCount < 1 {
				failedCount = 1
			}
		} else if summary.Failed > 0 {
			errorCode = "sync_partial_failed"
		}
		_, _ = a.syncGovernanceSvc.Complete(r.Context(), services.CompleteSyncGovernanceInput{
			RunID:        execution.Run.ID,
			JobID:        execution.Job.ID,
			Candidates:   summary.Candidates,
			Synced:       summary.Synced,
			Failed:       failedCount,
			FinishedAt:   finishedAt,
			ErrorCode:    errorCode,
			ErrorMessage: errorMessage,
			ErrorSummary: errorSummary,
			ActorUserID:  &actorID,
			AuditAction:  "",
		})
		return
	}
	if a.asyncJobSvc != nil && legacyAsyncJobID != 0 {
		if syncErr != nil || summary.Failed > 0 {
			errorCode := "sync_batch_failed"
			if syncErr == nil {
				errorCode = "sync_partial_failed"
			}
			_, _ = a.asyncJobSvc.MarkFailed(r.Context(), legacyAsyncJobID, errorCode, errorSummary, finishedAt)
		} else {
			_, _ = a.asyncJobSvc.MarkSucceeded(r.Context(), legacyAsyncJobID, finishedAt)
		}
	}
	if a.syncJobSvc != nil {
		actorID := actorUserID
		_, _ = a.syncJobSvc.RecordRun(r.Context(), services.RecordSyncRunInput{
			Trigger:      "manual",
			Scope:        scope,
			OwnerUserID:  ownerID,
			ActorUserID:  &actorID,
			Candidates:   summary.Candidates,
			Synced:       summary.Synced,
			Failed:       summary.Failed,
			StartedAt:    startedAt,
			FinishedAt:   finishedAt,
			ErrorSummary: errorSummary,
		})
	}
}
