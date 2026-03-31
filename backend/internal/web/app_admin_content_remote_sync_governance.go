package web

import (
	"context"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) startRemoteSyncGovernance(
	ctx context.Context,
	skill models.Skill,
	actorUserID uint,
) (services.SyncGovernanceExecution, error) {
	if a == nil || a.syncGovernanceSvc == nil || skill.ID == 0 || skill.OwnerID == 0 || actorUserID == 0 {
		return services.SyncGovernanceExecution{}, nil
	}
	targetSkillID := skill.ID
	ownerUserID := skill.OwnerID
	actorID := actorUserID
	return a.syncGovernanceSvc.Start(ctx, services.StartSyncGovernanceInput{
		JobType:       remoteSyncAsyncJobType(skill.SourceType),
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerUserID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: remoteSyncPayloadDigest(skill),
		StartedAt:     timeNowUTC(),
	})
}

func (a *App) completeRemoteSyncGovernance(
	ctx context.Context,
	execution services.SyncGovernanceExecution,
	skill models.Skill,
	actorUserID uint,
	synced int,
	failed int,
	err error,
) {
	if a == nil {
		return
	}
	errorSummary := ""
	errorCode := ""
	if err != nil {
		errorSummary = strings.TrimSpace(err.Error())
		errorCode = "sync_single_failed"
	}
	if a.syncGovernanceSvc != nil && execution.Job.ID != 0 && execution.Run.ID != 0 {
		actorID := actorUserID
		_, _ = a.syncGovernanceSvc.Complete(ctx, services.CompleteSyncGovernanceInput{
			RunID:        execution.Run.ID,
			JobID:        execution.Job.ID,
			Candidates:   1,
			Synced:       synced,
			Failed:       failed,
			FinishedAt:   timeNowUTC(),
			ErrorCode:    errorCode,
			ErrorMessage: errorSummary,
			ErrorSummary: errorSummary,
			ActorUserID:  &actorID,
		})
		return
	}
	a.recordLegacySingleRemoteSyncRun(ctx, skill, actorUserID, synced, failed, errorSummary)
}

func (a *App) recordLegacySingleRemoteSyncRun(
	ctx context.Context,
	skill models.Skill,
	actorUserID uint,
	synced int,
	failed int,
	errorSummary string,
) {
	if a == nil || a.syncJobSvc == nil || skill.ID == 0 || skill.OwnerID == 0 || actorUserID == 0 {
		return
	}
	targetSkillID := skill.ID
	ownerUserID := skill.OwnerID
	actorID := actorUserID
	_, _ = a.syncJobSvc.RecordRun(ctx, services.RecordSyncRunInput{
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerUserID,
		ActorUserID:   &actorID,
		Candidates:    1,
		Synced:        synced,
		Failed:        failed,
		ErrorSummary:  errorSummary,
	})
}

func remoteSyncAsyncJobType(sourceType models.SkillSourceType) models.AsyncJobType {
	if sourceType == models.SourceTypeSkillMP {
		return models.AsyncJobTypeSyncSkillMP
	}
	return models.AsyncJobTypeSyncRepository
}

func remoteSyncPayloadDigest(skill models.Skill) string {
	return fmt.Sprintf(
		"remote-sync:%s:%d:%s:%s:%s",
		string(skill.SourceType),
		skill.ID,
		strings.TrimSpace(skill.SourceURL),
		strings.TrimSpace(skill.SourceBranch),
		strings.TrimSpace(skill.SourcePath),
	)
}

func timeNowUTC() time.Time {
	return time.Now().UTC()
}
