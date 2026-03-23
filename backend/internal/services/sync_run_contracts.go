package services

import (
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

const (
	// SyncRunStatusPending indicates the run has been queued.
	SyncRunStatusPending = "pending"
	// SyncRunStatusRunning indicates the run is in progress.
	SyncRunStatusRunning = "running"
	// SyncRunStatusSucceeded indicates the run completed successfully.
	SyncRunStatusSucceeded = "succeeded"
	// SyncRunStatusFailed indicates the run completed with failure.
	SyncRunStatusFailed = "failed"
	// SyncRunStatusPartial indicates the run completed with partial failure.
	SyncRunStatusPartial = "partial"
	// SyncRunStatusCanceled indicates the run was canceled.
	SyncRunStatusCanceled = "canceled"
)

const (
	// SyncRunTriggerTypeManual indicates a manual trigger.
	SyncRunTriggerTypeManual = "manual"
	// SyncRunTriggerTypeScheduled indicates a scheduler trigger.
	SyncRunTriggerTypeScheduled = "scheduled"
	// SyncRunTriggerTypeRetry indicates a retry trigger.
	SyncRunTriggerTypeRetry = "retry"
)

// StartSyncRunInput stores the lifecycle input for one newly started run.
type StartSyncRunInput struct {
	PolicyID       *uint
	JobID          *uint
	Trigger        string
	TriggerType    string
	Scope          string
	TargetSkillID  *uint
	OwnerUserID    *uint
	ActorUserID    *uint
	Attempt        int
	StartedAt      time.Time
	SourceRevision string
}

// FinishSyncRunInput stores the lifecycle input for completing one run.
type FinishSyncRunInput struct {
	Status         string
	Candidates     int
	Synced         int
	Failed         int
	FinishedAt     time.Time
	ErrorCode      string
	ErrorMessage   string
	ErrorSummary   string
	SourceRevision string
}

func buildSyncRunModel(input RecordSyncRunInput) (models.SyncJobRun, error) {
	trigger := normalizeSyncRunTrigger(input.Trigger)
	triggerType := normalizeSyncRunTriggerType(input.TriggerType, trigger)
	scope := normalizeSyncRunScope(input.Scope)
	started := normalizeSyncRunTime(input.StartedAt)
	finished := normalizeSyncRunFinishedAt(started, input.FinishedAt)
	status := normalizeSyncRunStatus(
		input.Status,
		input.Candidates,
		input.Synced,
		input.Failed,
		input.ErrorCode,
		input.ErrorMessage,
		input.ErrorSummary,
	)
	attempt := normalizeSyncRunAttempt(input.Attempt)
	errorSummary := sanitizeSyncErrorSummary(input.ErrorSummary)
	errorMessage := sanitizeSyncErrorSummary(input.ErrorMessage)
	errorCode := sanitizeSyncErrorCode(input.ErrorCode)
	if errorSummary == "" && errorMessage != "" {
		errorSummary = errorMessage
	}

	item := models.SyncJobRun{
		PolicyID:       input.PolicyID,
		JobID:          input.JobID,
		Trigger:        trigger,
		TriggerType:    triggerType,
		Scope:          scope,
		Status:         status,
		TargetSkillID:  normalizeOptionalUint(input.TargetSkillID),
		OwnerUserID:    normalizeOptionalUint(input.OwnerUserID),
		ActorUserID:    normalizeOptionalUint(input.ActorUserID),
		Candidates:     maxInt(input.Candidates, 0),
		Synced:         maxInt(input.Synced, 0),
		Failed:         maxInt(input.Failed, 0),
		Attempt:        attempt,
		ErrorCode:      errorCode,
		ErrorMessage:   errorMessage,
		ErrorSummary:   errorSummary,
		SourceRevision: strings.TrimSpace(input.SourceRevision),
		StartedAt:      started,
		FinishedAt:     finished,
		DurationMs:     syncRunDurationMs(started, finished),
	}
	if item.Attempt <= 0 {
		return models.SyncJobRun{}, fmt.Errorf("sync run attempt is required")
	}
	return item, nil
}

func normalizeSyncRunTrigger(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return SyncRunTriggerTypeManual
	}
	return value
}

func normalizeSyncRunTriggerType(raw string, fallback string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		value = strings.ToLower(strings.TrimSpace(fallback))
	}
	switch value {
	case "scheduled", "scheduler", "startup", "tick", "cron":
		return SyncRunTriggerTypeScheduled
	case "retry", "replay":
		return SyncRunTriggerTypeRetry
	default:
		return SyncRunTriggerTypeManual
	}
}

func normalizeSyncRunScope(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return "all"
	}
	return value
}

func normalizeSyncRunStatus(
	raw string,
	candidates int,
	synced int,
	failed int,
	errorCode string,
	errorMessage string,
	errorSummary string,
) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	switch value {
	case SyncRunStatusPending,
		SyncRunStatusRunning,
		SyncRunStatusSucceeded,
		SyncRunStatusFailed,
		SyncRunStatusPartial,
		SyncRunStatusCanceled:
		return value
	}
	if maxInt(failed, 0) > 0 {
		if maxInt(synced, 0) > 0 || maxInt(candidates, 0) > maxInt(failed, 0) {
			return SyncRunStatusPartial
		}
		return SyncRunStatusFailed
	}
	if sanitizeSyncErrorCode(errorCode) != "" ||
		sanitizeSyncErrorSummary(errorMessage) != "" ||
		sanitizeSyncErrorSummary(errorSummary) != "" {
		return SyncRunStatusFailed
	}
	return SyncRunStatusSucceeded
}

func normalizeSyncRunTime(value time.Time) time.Time {
	if value.IsZero() {
		return time.Now().UTC()
	}
	return value.UTC()
}

func normalizeSyncRunFinishedAt(startedAt time.Time, value time.Time) time.Time {
	if value.IsZero() {
		return startedAt
	}
	finishedAt := value.UTC()
	if finishedAt.Before(startedAt) {
		return startedAt
	}
	return finishedAt
}

func normalizeSyncRunAttempt(value int) int {
	if value <= 0 {
		return 1
	}
	return value
}

func syncRunDurationMs(startedAt time.Time, finishedAt time.Time) int {
	duration := finishedAt.Sub(startedAt)
	if duration < 0 {
		return 0
	}
	return int(duration / time.Millisecond)
}

func normalizeOptionalUint(value *uint) *uint {
	if value == nil || *value == 0 {
		return nil
	}
	normalized := *value
	return &normalized
}
