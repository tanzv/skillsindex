package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

const defaultSyncGovernanceMaxAttempts = 3

// SyncGovernanceService orchestrates async jobs, sync runs, versions, and audit entries.
type SyncGovernanceService struct {
	asyncJobs     *AsyncJobService
	syncRuns      *SyncJobService
	skillVersions *SkillVersionService
	audits        *AuditService
}

// SyncGovernanceExecution stores the linked job and run records of one execution.
type SyncGovernanceExecution struct {
	Job     models.AsyncJob
	Run     models.SyncJobRun
	Deduped bool
}

// StartSyncGovernanceInput stores orchestration parameters for starting one sync execution.
type StartSyncGovernanceInput struct {
	JobType       models.AsyncJobType
	PolicyID      *uint
	Trigger       string
	TriggerType   string
	Scope         string
	TargetSkillID *uint
	OwnerUserID   *uint
	ActorUserID   *uint
	MaxAttempts   int
	PayloadDigest string
	StartedAt     time.Time
}

// RetrySyncGovernanceInput stores orchestration parameters for retrying one failed execution.
type RetrySyncGovernanceInput struct {
	Trigger      string
	TriggerType  string
	Scope        string
	ActorUserID  uint
	StartedAt    time.Time
	AuditAction  string
	AuditSummary string
	AuditDetails string
}

// CompleteSyncGovernanceInput stores orchestration parameters for completing one execution.
type CompleteSyncGovernanceInput struct {
	RunID                 uint
	JobID                 uint
	Candidates            int
	Synced                int
	Failed                int
	FinishedAt            time.Time
	ErrorCode             string
	ErrorMessage          string
	ErrorSummary          string
	SourceRevision        string
	CaptureVersionSkillID *uint
	VersionTrigger        string
	ActorUserID           *uint
	AuditAction           string
	AuditTargetType       string
	AuditTargetID         uint
	AuditSummary          string
	AuditDetails          string
}

// CancelSyncGovernanceInput stores orchestration parameters for canceling one execution.
type CancelSyncGovernanceInput struct {
	RunID           uint
	JobID           uint
	ActorUserID     uint
	FinishedAt      time.Time
	AuditAction     string
	AuditTargetType string
	AuditTargetID   uint
	AuditSummary    string
	AuditDetails    string
}

// NewSyncGovernanceService creates one orchestration service.
func NewSyncGovernanceService(
	asyncJobs *AsyncJobService,
	syncRuns *SyncJobService,
	skillVersions *SkillVersionService,
	audits *AuditService,
) *SyncGovernanceService {
	return &SyncGovernanceService{
		asyncJobs:     asyncJobs,
		syncRuns:      syncRuns,
		skillVersions: skillVersions,
		audits:        audits,
	}
}

// Start creates and starts one governed sync execution.
func (s *SyncGovernanceService) Start(ctx context.Context, input StartSyncGovernanceInput) (SyncGovernanceExecution, error) {
	if s == nil || s.asyncJobs == nil || s.syncRuns == nil {
		return SyncGovernanceExecution{}, fmt.Errorf("sync governance service is not initialized")
	}
	startedAt := normalizeAsyncJobTime(input.StartedAt)
	created, deduped, err := s.asyncJobs.CreateOrGetActive(ctx, CreateAsyncJobInput{
		JobType:       input.JobType,
		OwnerUserID:   input.OwnerUserID,
		ActorUserID:   input.ActorUserID,
		TargetSkillID: input.TargetSkillID,
		MaxAttempts:   normalizeSyncGovernanceMaxAttempts(input.MaxAttempts),
		PayloadDigest: input.PayloadDigest,
	}, startedAt)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	if deduped {
		execution := SyncGovernanceExecution{Job: created, Deduped: true}
		if created.SyncRunID != nil && *created.SyncRunID != 0 {
			run, runErr := s.syncRuns.GetRunByID(ctx, *created.SyncRunID)
			if runErr == nil {
				execution.Run = run
			}
		}
		return execution, nil
	}

	startedJob, err := s.asyncJobs.Start(ctx, created.ID, startedAt)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	run, err := s.syncRuns.StartRun(ctx, StartSyncRunInput{
		PolicyID:      input.PolicyID,
		JobID:         &startedJob.ID,
		Trigger:       input.Trigger,
		TriggerType:   input.TriggerType,
		Scope:         input.Scope,
		TargetSkillID: input.TargetSkillID,
		OwnerUserID:   input.OwnerUserID,
		ActorUserID:   input.ActorUserID,
		Attempt:       startedJob.Attempt,
		StartedAt:     startedAt,
	})
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	attachedJob, err := s.asyncJobs.AttachSyncRun(ctx, startedJob.ID, run.ID)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	attachedRun, err := s.syncRuns.AttachJob(ctx, run.ID, attachedJob.ID)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	return SyncGovernanceExecution{Job: attachedJob, Run: attachedRun}, nil
}

// Retry creates one new run attempt on top of an existing async job lineage.
func (s *SyncGovernanceService) Retry(ctx context.Context, jobID uint, input RetrySyncGovernanceInput) (SyncGovernanceExecution, error) {
	if s == nil || s.asyncJobs == nil || s.syncRuns == nil {
		return SyncGovernanceExecution{}, fmt.Errorf("sync governance service is not initialized")
	}
	if input.ActorUserID == 0 {
		return SyncGovernanceExecution{}, ErrAsyncJobInvalidTransition
	}
	startedAt := normalizeAsyncJobTime(input.StartedAt)
	retriedJob, err := s.asyncJobs.Retry(ctx, jobID, input.ActorUserID, startedAt)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	runningJob, err := s.asyncJobs.Start(ctx, retriedJob.ID, startedAt)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}

	var previousRun models.SyncJobRun
	if runningJob.SyncRunID != nil && *runningJob.SyncRunID != 0 {
		previousRun, _ = s.syncRuns.GetRunByID(ctx, *runningJob.SyncRunID)
	}
	actorUserID := input.ActorUserID
	run, err := s.syncRuns.StartRun(ctx, StartSyncRunInput{
		PolicyID:       previousRun.PolicyID,
		JobID:          &runningJob.ID,
		Trigger:        chooseNonEmpty(input.Trigger, SyncRunTriggerTypeRetry),
		TriggerType:    chooseNonEmpty(input.TriggerType, SyncRunTriggerTypeRetry),
		Scope:          chooseNonEmpty(input.Scope, previousRun.Scope),
		TargetSkillID:  runningJob.TargetSkillID,
		OwnerUserID:    runningJob.OwnerUserID,
		ActorUserID:    &actorUserID,
		Attempt:        runningJob.Attempt,
		StartedAt:      startedAt,
		SourceRevision: previousRun.SourceRevision,
	})
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	attachedJob, err := s.asyncJobs.AttachSyncRun(ctx, runningJob.ID, run.ID)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	attachedRun, err := s.syncRuns.AttachJob(ctx, run.ID, attachedJob.ID)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	s.recordAudit(ctx, auditRecordInput{
		ActorUserID: input.ActorUserID,
		Action:      input.AuditAction,
		TargetType:  "async_job",
		TargetID:    attachedJob.ID,
		Summary:     input.AuditSummary,
		Details:     input.AuditDetails,
	})
	return SyncGovernanceExecution{Job: attachedJob, Run: attachedRun}, nil
}

// Complete finalizes one governed sync execution.
func (s *SyncGovernanceService) Complete(ctx context.Context, input CompleteSyncGovernanceInput) (SyncGovernanceExecution, error) {
	if s == nil || s.asyncJobs == nil || s.syncRuns == nil {
		return SyncGovernanceExecution{}, fmt.Errorf("sync governance service is not initialized")
	}
	if input.RunID == 0 || input.JobID == 0 {
		return SyncGovernanceExecution{}, ErrSyncRunNotFound
	}
	finishedAt := normalizeAsyncJobTime(input.FinishedAt)
	status := normalizeSyncRunStatus(
		"",
		input.Candidates,
		input.Synced,
		input.Failed,
		input.ErrorCode,
		input.ErrorMessage,
		input.ErrorSummary,
	)
	errorCode := sanitizeSyncErrorCode(input.ErrorCode)
	errorMessage := sanitizeSyncErrorSummary(input.ErrorMessage)
	errorSummary := sanitizeSyncErrorSummary(input.ErrorSummary)
	if errorSummary == "" && errorMessage != "" {
		errorSummary = errorMessage
	}

	if status == SyncRunStatusSucceeded && input.CaptureVersionSkillID != nil && *input.CaptureVersionSkillID != 0 && s.skillVersions != nil {
		trigger := chooseNonEmpty(strings.TrimSpace(input.VersionTrigger), normalizeVersionTrigger(input.VersionTrigger))
		if trigger == "" {
			trigger = "sync"
		}
		if err := s.skillVersions.CaptureWithRunContext(ctx, *input.CaptureVersionSkillID, trigger, input.ActorUserID, &input.RunID); err != nil {
			status = SyncRunStatusFailed
			errorCode = "version_capture_failed"
			errorMessage = sanitizeSyncErrorSummary(err.Error())
			errorSummary = errorMessage
			input.Failed = maxInt(input.Failed, 1)
		}
	}

	run, err := s.syncRuns.FinalizeRun(ctx, input.RunID, FinishSyncRunInput{
		Status:         status,
		Candidates:     input.Candidates,
		Synced:         input.Synced,
		Failed:         input.Failed,
		FinishedAt:     finishedAt,
		ErrorCode:      errorCode,
		ErrorMessage:   errorMessage,
		ErrorSummary:   errorSummary,
		SourceRevision: input.SourceRevision,
	})
	if err != nil {
		return SyncGovernanceExecution{}, err
	}

	var job models.AsyncJob
	if run.Status == SyncRunStatusSucceeded {
		job, err = s.asyncJobs.MarkSucceeded(ctx, input.JobID, finishedAt)
	} else {
		job, err = s.asyncJobs.MarkFailed(ctx, input.JobID, chooseNonEmpty(errorCode, "sync_failed"), chooseNonEmpty(errorMessage, errorSummary), finishedAt)
	}
	if err != nil {
		return SyncGovernanceExecution{}, err
	}

	s.recordAudit(ctx, auditRecordInput{
		ActorUserID: auditActorValue(input.ActorUserID),
		Action:      input.AuditAction,
		TargetType:  input.AuditTargetType,
		TargetID:    input.AuditTargetID,
		Summary:     input.AuditSummary,
		Details:     input.AuditDetails,
	})
	return SyncGovernanceExecution{Job: job, Run: run}, nil
}

// Cancel cancels one governed sync execution.
func (s *SyncGovernanceService) Cancel(ctx context.Context, input CancelSyncGovernanceInput) (SyncGovernanceExecution, error) {
	if s == nil || s.asyncJobs == nil || s.syncRuns == nil {
		return SyncGovernanceExecution{}, fmt.Errorf("sync governance service is not initialized")
	}
	if input.RunID == 0 || input.JobID == 0 || input.ActorUserID == 0 {
		return SyncGovernanceExecution{}, ErrAsyncJobInvalidTransition
	}
	finishedAt := normalizeAsyncJobTime(input.FinishedAt)
	run, err := s.syncRuns.FinalizeRun(ctx, input.RunID, FinishSyncRunInput{
		Status:     SyncRunStatusCanceled,
		FinishedAt: finishedAt,
	})
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	job, err := s.asyncJobs.Cancel(ctx, input.JobID, input.ActorUserID, finishedAt)
	if err != nil {
		return SyncGovernanceExecution{}, err
	}
	s.recordAudit(ctx, auditRecordInput{
		ActorUserID: input.ActorUserID,
		Action:      input.AuditAction,
		TargetType:  input.AuditTargetType,
		TargetID:    input.AuditTargetID,
		Summary:     input.AuditSummary,
		Details:     input.AuditDetails,
	})
	return SyncGovernanceExecution{Job: job, Run: run}, nil
}
