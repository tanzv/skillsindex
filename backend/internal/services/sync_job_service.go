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
)

// SyncJobService manages synchronization run records.
type SyncJobService struct {
	db *gorm.DB
}

// RecordSyncRunInput stores data for one sync run record.
type RecordSyncRunInput struct {
	Trigger       string
	Scope         string
	TargetSkillID *uint
	OwnerUserID   *uint
	ActorUserID   *uint
	Candidates    int
	Synced        int
	Failed        int
	StartedAt     time.Time
	FinishedAt    time.Time
	ErrorSummary  string
}

// ListSyncRunsInput stores optional filters for sync runs.
type ListSyncRunsInput struct {
	OwnerUserID   *uint
	TargetSkillID *uint
	Limit         int
}

// NewSyncJobService creates a new sync job service.
func NewSyncJobService(db *gorm.DB) *SyncJobService {
	return &SyncJobService{db: db}
}

// RecordRun inserts a sync run record.
func (s *SyncJobService) RecordRun(ctx context.Context, input RecordSyncRunInput) (models.SyncJobRun, error) {
	trigger := strings.ToLower(strings.TrimSpace(input.Trigger))
	if trigger == "" {
		trigger = "manual"
	}
	scope := strings.ToLower(strings.TrimSpace(input.Scope))
	if scope == "" {
		scope = "all"
	}

	started := input.StartedAt.UTC()
	if started.IsZero() {
		started = time.Now().UTC()
	}
	finished := input.FinishedAt.UTC()
	if finished.IsZero() {
		finished = time.Now().UTC()
	}
	duration := finished.Sub(started)
	if duration < 0 {
		duration = 0
	}

	status := "succeeded"
	if input.Candidates == 0 && input.Failed > 0 {
		status = "failed"
	} else if input.Failed > 0 {
		status = "partial"
	}

	errorSummary := sanitizeSyncErrorSummary(input.ErrorSummary)
	item := models.SyncJobRun{
		Trigger:       trigger,
		Scope:         scope,
		Status:        status,
		TargetSkillID: input.TargetSkillID,
		OwnerUserID:   input.OwnerUserID,
		ActorUserID:   input.ActorUserID,
		Candidates:    maxInt(input.Candidates, 0),
		Synced:        maxInt(input.Synced, 0),
		Failed:        maxInt(input.Failed, 0),
		ErrorSummary:  errorSummary,
		StartedAt:     started,
		FinishedAt:    finished,
		DurationMs:    int(duration / time.Millisecond),
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.SyncJobRun{}, fmt.Errorf("failed to record sync run: %w", err)
	}
	return item, nil
}

// ListRuns returns recent synchronization runs.
func (s *SyncJobService) ListRuns(ctx context.Context, input ListSyncRunsInput) ([]models.SyncJobRun, error) {
	limit := input.Limit
	if limit <= 0 || limit > 500 {
		limit = 120
	}

	query := s.db.WithContext(ctx).Model(&models.SyncJobRun{})
	if input.OwnerUserID != nil && *input.OwnerUserID != 0 {
		query = query.Where("owner_user_id = ?", *input.OwnerUserID)
	}
	if input.TargetSkillID != nil && *input.TargetSkillID > 0 {
		query = query.Where("target_skill_id = ?", *input.TargetSkillID)
	}

	var items []models.SyncJobRun
	if err := query.
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
	if runID == 0 {
		return models.SyncJobRun{}, ErrSyncRunNotFound
	}
	var item models.SyncJobRun
	err := s.db.WithContext(ctx).
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

func maxInt(value int, floor int) int {
	if value < floor {
		return floor
	}
	return value
}
