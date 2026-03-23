package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

const (
	// RepositorySyncPolicyMirrorName is the stable display name for the repository default mirror.
	RepositorySyncPolicyMirrorName = "Repository Sync Default Policy"
	// RepositorySyncPolicyMirrorTargetScope identifies the default repository policy mirror.
	RepositorySyncPolicyMirrorTargetScope = "system:repository-default"
)

// UpsertRepositoryMirror creates or updates the default first-class policy that mirrors repository settings.
func (s *SyncPolicyService) UpsertRepositoryMirror(
	ctx context.Context,
	policy RepositorySyncPolicy,
	actorUserID *uint,
) (models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return models.SyncPolicy{}, fmt.Errorf("sync policy service is not initialized")
	}

	existing, err := s.GetRepositoryMirror(ctx, false)
	if err == nil {
		updates := UpdateSyncPolicyInput{
			Enabled:         boolPtr(policy.Enabled),
			IntervalMinutes: intPtr(durationToWholeMinutes(policy.Interval)),
			TimeoutMinutes:  intPtr(durationToWholeMinutes(policy.Timeout)),
			BatchSize:       intPtr(policy.BatchSize),
			UpdatedByUserID: actorUserID,
		}
		return s.Update(ctx, existing.ID, updates)
	}
	if !errors.Is(err, ErrSyncPolicyNotFound) {
		return models.SyncPolicy{}, fmt.Errorf("failed to load repository mirror policy: %w", err)
	}

	return s.Create(ctx, CreateSyncPolicyInput{
		PolicyName:      RepositorySyncPolicyMirrorName,
		TargetScope:     RepositorySyncPolicyMirrorTargetScope,
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: durationToWholeMinutes(policy.Interval),
		TimeoutMinutes:  durationToWholeMinutes(policy.Timeout),
		BatchSize:       policy.BatchSize,
		Timezone:        "UTC",
		Enabled:         policy.Enabled,
		MaxRetry:        3,
		CreatedByUserID: actorUserID,
	})
}

// GetRepositoryMirror loads the default first-class repository mirror policy.
func (s *SyncPolicyService) GetRepositoryMirror(ctx context.Context, includeDeleted bool) (models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return models.SyncPolicy{}, fmt.Errorf("sync policy service is not initialized")
	}

	query := s.db.WithContext(ctx).
		Model(&models.SyncPolicy{}).
		Where("source_type = ?", models.SyncPolicySourceRepository).
		Where("target_scope = ?", RepositorySyncPolicyMirrorTargetScope).
		Order("id DESC")
	if !includeDeleted {
		query = query.Where("deleted_at IS NULL")
	}

	var item models.SyncPolicy
	if err := query.First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.SyncPolicy{}, ErrSyncPolicyNotFound
		}
		return models.SyncPolicy{}, fmt.Errorf("failed to load repository mirror policy: %w", err)
	}
	return item, nil
}

func durationToWholeMinutes(value time.Duration) int {
	if value <= 0 {
		return 0
	}
	minutes := int(value / time.Minute)
	if value%time.Minute != 0 {
		minutes++
	}
	if minutes < 1 {
		return 1
	}
	return minutes
}

func boolPtr(value bool) *bool {
	return &value
}

func intPtr(value int) *int {
	return &value
}
