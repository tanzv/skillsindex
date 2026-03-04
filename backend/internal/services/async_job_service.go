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
	// ErrAsyncJobNotFound indicates async job does not exist.
	ErrAsyncJobNotFound = errors.New("async job not found")
	// ErrAsyncJobInvalidTransition indicates job status transition is invalid.
	ErrAsyncJobInvalidTransition = errors.New("async job status transition is invalid")
)

// AsyncJobService manages asynchronous orchestration jobs.
type AsyncJobService struct {
	db *gorm.DB
}

// CreateAsyncJobInput stores fields for creating a new async job.
type CreateAsyncJobInput struct {
	JobType       models.AsyncJobType
	OwnerUserID   *uint
	ActorUserID   *uint
	TargetSkillID *uint
	MaxAttempts   int
	PayloadDigest string
}

// ListAsyncJobsInput stores filters for listing async jobs.
type ListAsyncJobsInput struct {
	OwnerUserID *uint
	Status      models.AsyncJobStatus
	JobType     models.AsyncJobType
	Limit       int
}

// NewAsyncJobService creates a new async job service.
func NewAsyncJobService(db *gorm.DB) *AsyncJobService {
	return &AsyncJobService{db: db}
}

// CreateOrGetActive creates a new pending job or reuses active one with same payload digest.
func (s *AsyncJobService) CreateOrGetActive(
	ctx context.Context,
	input CreateAsyncJobInput,
	now time.Time,
) (models.AsyncJob, bool, error) {
	jobType := normalizeAsyncJobType(input.JobType)
	maxAttempts := normalizeAsyncJobMaxAttempts(input.MaxAttempts)
	payloadDigest := sanitizeAsyncJobPayloadDigest(input.PayloadDigest)
	createdAt := normalizeAsyncJobTime(now)

	if payloadDigest != "" {
		var existing models.AsyncJob
		err := s.db.WithContext(ctx).
			Preload("OwnerUser").
			Preload("ActorUser").
			Preload("CanceledByUser").
			Where("payload_digest = ?", payloadDigest).
			Where("status IN ?", []models.AsyncJobStatus{models.AsyncJobStatusPending, models.AsyncJobStatusRunning}).
			Order("id DESC").
			First(&existing).Error
		if err == nil {
			return existing, true, nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return models.AsyncJob{}, false, fmt.Errorf("failed to query active async job: %w", err)
		}
	}

	item := models.AsyncJob{
		JobType:       jobType,
		Status:        models.AsyncJobStatusPending,
		OwnerUserID:   input.OwnerUserID,
		ActorUserID:   input.ActorUserID,
		TargetSkillID: input.TargetSkillID,
		Attempt:       1,
		MaxAttempts:   maxAttempts,
		PayloadDigest: payloadDigest,
		CreatedAt:     createdAt,
		UpdatedAt:     createdAt,
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.AsyncJob{}, false, fmt.Errorf("failed to create async job: %w", err)
	}

	loaded, err := s.GetByID(ctx, item.ID)
	if err != nil {
		return models.AsyncJob{}, false, err
	}
	return loaded, false, nil
}

// List returns recent async jobs by filters.
func (s *AsyncJobService) List(ctx context.Context, input ListAsyncJobsInput) ([]models.AsyncJob, error) {
	limit := input.Limit
	if limit <= 0 || limit > 500 {
		limit = 120
	}

	query := s.db.WithContext(ctx).Model(&models.AsyncJob{})
	if input.OwnerUserID != nil && *input.OwnerUserID != 0 {
		query = query.Where("owner_user_id = ?", *input.OwnerUserID)
	}
	if input.Status != "" {
		query = query.Where("status = ?", normalizeAsyncJobStatus(input.Status))
	}
	if input.JobType != "" {
		query = query.Where("job_type = ?", normalizeAsyncJobType(input.JobType))
	}

	var items []models.AsyncJob
	if err := query.
		Preload("OwnerUser").
		Preload("ActorUser").
		Preload("CanceledByUser").
		Order("created_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list async jobs: %w", err)
	}
	return items, nil
}

// GetByID returns one async job by id.
func (s *AsyncJobService) GetByID(ctx context.Context, jobID uint) (models.AsyncJob, error) {
	if jobID == 0 {
		return models.AsyncJob{}, ErrAsyncJobNotFound
	}
	var item models.AsyncJob
	err := s.db.WithContext(ctx).
		Preload("OwnerUser").
		Preload("ActorUser").
		Preload("CanceledByUser").
		First(&item, jobID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.AsyncJob{}, ErrAsyncJobNotFound
	}
	if err != nil {
		return models.AsyncJob{}, fmt.Errorf("failed to load async job: %w", err)
	}
	return item, nil
}

// Start transitions one job from pending to running.
func (s *AsyncJobService) Start(ctx context.Context, jobID uint, now time.Time) (models.AsyncJob, error) {
	item, err := s.GetByID(ctx, jobID)
	if err != nil {
		return models.AsyncJob{}, err
	}
	if item.Status != models.AsyncJobStatusPending {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}

	startedAt := normalizeAsyncJobTime(now)
	item.Status = models.AsyncJobStatusRunning
	item.StartedAt = &startedAt
	item.FinishedAt = nil
	item.CanceledByUserID = nil
	item.ErrorCode = ""
	item.ErrorMessage = ""

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.AsyncJob{}, fmt.Errorf("failed to update async job status: %w", err)
	}
	return s.GetByID(ctx, jobID)
}

// MarkSucceeded transitions one job to succeeded.
func (s *AsyncJobService) MarkSucceeded(ctx context.Context, jobID uint, now time.Time) (models.AsyncJob, error) {
	item, err := s.GetByID(ctx, jobID)
	if err != nil {
		return models.AsyncJob{}, err
	}
	if item.Status != models.AsyncJobStatusRunning && item.Status != models.AsyncJobStatusPending {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}

	succeededAt := normalizeAsyncJobTime(now)
	if item.StartedAt == nil {
		item.StartedAt = &succeededAt
	}
	item.Status = models.AsyncJobStatusSucceeded
	item.FinishedAt = &succeededAt
	item.CanceledByUserID = nil
	item.ErrorCode = ""
	item.ErrorMessage = ""

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.AsyncJob{}, fmt.Errorf("failed to update async job status: %w", err)
	}
	return s.GetByID(ctx, jobID)
}

// MarkFailed transitions one job to failed with error metadata.
func (s *AsyncJobService) MarkFailed(
	ctx context.Context,
	jobID uint,
	errorCode string,
	errorMessage string,
	now time.Time,
) (models.AsyncJob, error) {
	item, err := s.GetByID(ctx, jobID)
	if err != nil {
		return models.AsyncJob{}, err
	}
	if item.Status != models.AsyncJobStatusRunning && item.Status != models.AsyncJobStatusPending {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}

	failedAt := normalizeAsyncJobTime(now)
	if item.StartedAt == nil {
		item.StartedAt = &failedAt
	}
	item.Status = models.AsyncJobStatusFailed
	item.FinishedAt = &failedAt
	item.CanceledByUserID = nil
	item.ErrorCode = sanitizeAsyncJobErrorCode(errorCode)
	item.ErrorMessage = sanitizeAsyncJobErrorMessage(errorMessage)

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.AsyncJob{}, fmt.Errorf("failed to update async job status: %w", err)
	}
	return s.GetByID(ctx, jobID)
}

// Cancel transitions one job from pending/running to canceled.
func (s *AsyncJobService) Cancel(ctx context.Context, jobID uint, actorUserID uint, now time.Time) (models.AsyncJob, error) {
	item, err := s.GetByID(ctx, jobID)
	if err != nil {
		return models.AsyncJob{}, err
	}
	if item.Status != models.AsyncJobStatusPending && item.Status != models.AsyncJobStatusRunning {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}
	if actorUserID == 0 {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}

	canceledAt := normalizeAsyncJobTime(now)
	if item.StartedAt == nil && item.Status == models.AsyncJobStatusRunning {
		item.StartedAt = &canceledAt
	}
	item.Status = models.AsyncJobStatusCanceled
	item.FinishedAt = &canceledAt
	item.CanceledByUserID = &actorUserID
	item.ErrorCode = ""
	item.ErrorMessage = ""

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.AsyncJob{}, fmt.Errorf("failed to update async job status: %w", err)
	}
	return s.GetByID(ctx, jobID)
}

// Retry transitions failed/canceled job back to pending and increments attempt.
func (s *AsyncJobService) Retry(ctx context.Context, jobID uint, actorUserID uint, now time.Time) (models.AsyncJob, error) {
	item, err := s.GetByID(ctx, jobID)
	if err != nil {
		return models.AsyncJob{}, err
	}
	if item.Status != models.AsyncJobStatusFailed && item.Status != models.AsyncJobStatusCanceled {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}
	if actorUserID == 0 || item.Attempt >= item.MaxAttempts {
		return models.AsyncJob{}, ErrAsyncJobInvalidTransition
	}
	_ = normalizeAsyncJobTime(now)

	item.Status = models.AsyncJobStatusPending
	item.Attempt++
	item.ActorUserID = &actorUserID
	item.CanceledByUserID = nil
	item.StartedAt = nil
	item.FinishedAt = nil
	item.ErrorCode = ""
	item.ErrorMessage = ""

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.AsyncJob{}, fmt.Errorf("failed to update async job status: %w", err)
	}
	return s.GetByID(ctx, jobID)
}

func normalizeAsyncJobTime(value time.Time) time.Time {
	if value.IsZero() {
		return time.Now().UTC()
	}
	return value.UTC()
}

func normalizeAsyncJobType(value models.AsyncJobType) models.AsyncJobType {
	switch models.AsyncJobType(strings.ToLower(strings.TrimSpace(string(value)))) {
	case models.AsyncJobTypeImportManual:
		return models.AsyncJobTypeImportManual
	case models.AsyncJobTypeImportUpload:
		return models.AsyncJobTypeImportUpload
	case models.AsyncJobTypeImportRepository:
		return models.AsyncJobTypeImportRepository
	case models.AsyncJobTypeImportSkillMP:
		return models.AsyncJobTypeImportSkillMP
	case models.AsyncJobTypeSyncSkillMP:
		return models.AsyncJobTypeSyncSkillMP
	default:
		return models.AsyncJobTypeSyncRepository
	}
}

func normalizeAsyncJobStatus(value models.AsyncJobStatus) models.AsyncJobStatus {
	switch models.AsyncJobStatus(strings.ToLower(strings.TrimSpace(string(value)))) {
	case models.AsyncJobStatusPending:
		return models.AsyncJobStatusPending
	case models.AsyncJobStatusRunning:
		return models.AsyncJobStatusRunning
	case models.AsyncJobStatusSucceeded:
		return models.AsyncJobStatusSucceeded
	case models.AsyncJobStatusFailed:
		return models.AsyncJobStatusFailed
	case models.AsyncJobStatusCanceled:
		return models.AsyncJobStatusCanceled
	default:
		return models.AsyncJobStatusPending
	}
}

func normalizeAsyncJobMaxAttempts(value int) int {
	if value < 1 {
		return 3
	}
	if value > 10 {
		return 10
	}
	return value
}

func sanitizeAsyncJobPayloadDigest(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	value = strings.Join(strings.Fields(value), "")
	if len(value) > 120 {
		return value[:120]
	}
	return value
}

func sanitizeAsyncJobErrorCode(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return "unknown"
	}
	if len(value) > 64 {
		return value[:64]
	}
	return value
}

func sanitizeAsyncJobErrorMessage(raw string) string {
	value := strings.Join(strings.Fields(strings.TrimSpace(raw)), " ")
	if len(value) > 1900 {
		return value[:1897] + "..."
	}
	return value
}
