package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrSyncRunNotFound indicates sync run record is missing.
	ErrSyncRunNotFound = errors.New("sync run not found")
	// ErrSyncRunInvalidTransition indicates the lifecycle transition is invalid.
	ErrSyncRunInvalidTransition = errors.New("sync run status transition is invalid")
)

// SyncJobService manages synchronization run records.
type SyncJobService struct {
	db *gorm.DB
}

// RecordSyncRunInput stores data for one sync run record.
type RecordSyncRunInput struct {
	PolicyID       *uint
	JobID          *uint
	Trigger        string
	TriggerType    string
	Scope          string
	Status         string
	TargetSkillID  *uint
	OwnerUserID    *uint
	ActorUserID    *uint
	Candidates     int
	Synced         int
	Failed         int
	Attempt        int
	StartedAt      time.Time
	FinishedAt     time.Time
	ErrorCode      string
	ErrorMessage   string
	ErrorSummary   string
	SourceRevision string
}

// ListSyncRunsInput stores optional filters for sync runs.
type ListSyncRunsInput struct {
	PolicyID       *uint
	JobID          *uint
	OwnerUserID    *uint
	TargetSkillID  *uint
	Status         string
	TriggerType    string
	IncludeErrored bool
	Limit          int
}

// NewSyncJobService creates a new sync job service.
func NewSyncJobService(db *gorm.DB) *SyncJobService {
	return &SyncJobService{db: db}
}

// RecordRun inserts a sync run record.
func (s *SyncJobService) RecordRun(ctx context.Context, input RecordSyncRunInput) (models.SyncJobRun, error) {
	if s == nil || s.db == nil {
		return models.SyncJobRun{}, fmt.Errorf("sync job service is not initialized")
	}
	item, err := buildSyncRunModel(input)
	if err != nil {
		return models.SyncJobRun{}, err
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.SyncJobRun{}, fmt.Errorf("failed to record sync run: %w", err)
	}
	return s.GetRunByID(ctx, item.ID)
}

// StartRun creates one running sync run for orchestration usage.
func (s *SyncJobService) StartRun(ctx context.Context, input StartSyncRunInput) (models.SyncJobRun, error) {
	return s.RecordRun(ctx, RecordSyncRunInput{
		PolicyID:       input.PolicyID,
		JobID:          input.JobID,
		Trigger:        input.Trigger,
		TriggerType:    input.TriggerType,
		Scope:          input.Scope,
		Status:         SyncRunStatusRunning,
		TargetSkillID:  input.TargetSkillID,
		OwnerUserID:    input.OwnerUserID,
		ActorUserID:    input.ActorUserID,
		Attempt:        input.Attempt,
		StartedAt:      input.StartedAt,
		FinishedAt:     input.StartedAt,
		SourceRevision: input.SourceRevision,
	})
}

// FinalizeRun completes one pending or running sync run.
func (s *SyncJobService) FinalizeRun(ctx context.Context, runID uint, input FinishSyncRunInput) (models.SyncJobRun, error) {
	if s == nil || s.db == nil {
		return models.SyncJobRun{}, fmt.Errorf("sync job service is not initialized")
	}
	run, err := s.GetRunByID(ctx, runID)
	if err != nil {
		return models.SyncJobRun{}, err
	}
	if run.Status != SyncRunStatusPending && run.Status != SyncRunStatusRunning {
		return models.SyncJobRun{}, ErrSyncRunInvalidTransition
	}

	finishedAt := normalizeSyncRunFinishedAt(run.StartedAt, input.FinishedAt)
	status := normalizeSyncRunStatus(
		input.Status,
		input.Candidates,
		input.Synced,
		input.Failed,
		input.ErrorCode,
		input.ErrorMessage,
		input.ErrorSummary,
	)
	errorSummary := sanitizeSyncErrorSummary(input.ErrorSummary)
	errorMessage := sanitizeSyncErrorSummary(input.ErrorMessage)
	errorCode := sanitizeSyncErrorCode(input.ErrorCode)
	if errorSummary == "" && errorMessage != "" {
		errorSummary = errorMessage
	}

	updates := map[string]any{
		"status":          status,
		"candidates":      maxInt(input.Candidates, 0),
		"synced":          maxInt(input.Synced, 0),
		"failed":          maxInt(input.Failed, 0),
		"finished_at":     finishedAt,
		"duration_ms":     syncRunDurationMs(run.StartedAt, finishedAt),
		"error_code":      errorCode,
		"error_message":   errorMessage,
		"error_summary":   errorSummary,
		"source_revision": strings.TrimSpace(input.SourceRevision),
	}
	if err := s.db.WithContext(ctx).Model(&models.SyncJobRun{}).Where("id = ?", runID).Updates(updates).Error; err != nil {
		return models.SyncJobRun{}, fmt.Errorf("failed to finalize sync run: %w", err)
	}
	return s.GetRunByID(ctx, runID)
}

// AttachJob associates one existing run with one async job.
func (s *SyncJobService) AttachJob(ctx context.Context, runID uint, jobID uint) (models.SyncJobRun, error) {
	if s == nil || s.db == nil {
		return models.SyncJobRun{}, fmt.Errorf("sync job service is not initialized")
	}
	if runID == 0 || jobID == 0 {
		return models.SyncJobRun{}, ErrSyncRunNotFound
	}
	if _, err := s.GetRunByID(ctx, runID); err != nil {
		return models.SyncJobRun{}, err
	}
	if err := s.db.WithContext(ctx).Model(&models.SyncJobRun{}).Where("id = ?", runID).Update("job_id", jobID).Error; err != nil {
		return models.SyncJobRun{}, fmt.Errorf("failed to attach async job to sync run: %w", err)
	}
	return s.GetRunByID(ctx, runID)
}

// ListRuns returns recent synchronization runs.
func (s *SyncJobService) ListRuns(ctx context.Context, input ListSyncRunsInput) ([]models.SyncJobRun, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("sync job service is not initialized")
	}
	limit := input.Limit
	if limit <= 0 || limit > 500 {
		limit = 120
	}

	query := s.db.WithContext(ctx).Model(&models.SyncJobRun{})
	if input.PolicyID != nil && *input.PolicyID != 0 {
		query = query.Where("policy_id = ?", *input.PolicyID)
	}
	if input.JobID != nil && *input.JobID != 0 {
		query = query.Where("job_id = ?", *input.JobID)
	}
	if input.OwnerUserID != nil && *input.OwnerUserID != 0 {
		query = query.Where("owner_user_id = ?", *input.OwnerUserID)
	}
	if input.TargetSkillID != nil && *input.TargetSkillID > 0 {
		query = query.Where("target_skill_id = ?", *input.TargetSkillID)
	}
	if status := strings.ToLower(strings.TrimSpace(input.Status)); status != "" {
		query = query.Where("LOWER(status) = ?", status)
	}
	if triggerType := strings.ToLower(strings.TrimSpace(input.TriggerType)); triggerType != "" {
		query = query.Where("LOWER(trigger_type) = ?", triggerType)
	}
	if input.IncludeErrored {
		query = query.Where("error_code <> '' OR error_message <> '' OR failed > 0")
	}

	var items []models.SyncJobRun
	if err := query.
		Preload("Policy").
		Preload("Job").
		Preload("TargetSkill").
		Preload("ActorUser").
		Preload("OwnerUser").
		Order("started_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list sync runs: %w", err)
	}
	return items, nil
}

// GetRunByID returns one synchronization run by id.
func (s *SyncJobService) GetRunByID(ctx context.Context, runID uint) (models.SyncJobRun, error) {
	if s == nil || s.db == nil {
		return models.SyncJobRun{}, fmt.Errorf("sync job service is not initialized")
	}
	if runID == 0 {
		return models.SyncJobRun{}, ErrSyncRunNotFound
	}
	var item models.SyncJobRun
	err := s.db.WithContext(ctx).
		Preload("Policy").
		Preload("Job").
		Preload("TargetSkill").
		Preload("ActorUser").
		Preload("OwnerUser").
		First(&item, runID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.SyncJobRun{}, ErrSyncRunNotFound
	}
	if err != nil {
		return models.SyncJobRun{}, fmt.Errorf("failed to load sync run: %w", err)
	}
	return item, nil
}

func sanitizeSyncErrorSummary(raw string) string {
	value := strings.Join(strings.Fields(strings.TrimSpace(raw)), " ")
	if len(value) > 1900 {
		return value[:1897] + "..."
	}
	return value
}

func sanitizeSyncErrorCode(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if len(value) > 64 {
		return value[:64]
	}
	return value
}

func maxInt(value int, floor int) int {
	if value < floor {
		return floor
	}
	return value
}
