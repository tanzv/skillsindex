package services

import (
	"context"
	"fmt"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

// PublishAPISpecInput defines one publish request.
type PublishAPISpecInput struct {
	SpecID      uint
	ActorUserID uint
}

// APIPublishService manages publish lifecycle for imported API specs.
type APIPublishService struct {
	db *gorm.DB
}

// NewAPIPublishService constructs an API publish service.
func NewAPIPublishService(db *gorm.DB) *APIPublishService {
	return &APIPublishService{db: db}
}

// Publish marks one imported draft or validated spec as the current published version.
func (s *APIPublishService) Publish(ctx context.Context, input PublishAPISpecInput) (models.APISpec, error) {
	if s == nil || s.db == nil {
		return models.APISpec{}, fmt.Errorf("api publish service is not configured")
	}
	if input.SpecID == 0 {
		return models.APISpec{}, ErrAPISpecNotFound
	}
	if input.ActorUserID == 0 {
		return models.APISpec{}, fmt.Errorf("actor user id is required")
	}

	var published models.APISpec
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var target models.APISpec
		if err := tx.First(&target, input.SpecID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return ErrAPISpecNotFound
			}
			return fmt.Errorf("failed to load api spec for publish: %w", err)
		}
		if target.Status != models.APISpecStatusDraft && target.Status != models.APISpecStatusValidated {
			return fmt.Errorf("api spec status %s cannot be published", target.Status)
		}

		var previous models.APISpec
		previousErr := tx.Where("is_current = ? AND status = ?", true, models.APISpecStatusPublished).First(&previous).Error
		if previousErr != nil && previousErr != gorm.ErrRecordNotFound {
			return fmt.Errorf("failed to load current published api spec: %w", previousErr)
		}

		if err := tx.Model(&models.APISpec{}).Where("is_current = ?", true).Update("is_current", false).Error; err != nil {
			return fmt.Errorf("failed to clear current api specs: %w", err)
		}

		now := time.Now().UTC()
		target.Status = models.APISpecStatusPublished
		target.IsCurrent = true
		target.PublishedBy = &input.ActorUserID
		target.PublishedAt = &now
		if err := tx.Save(&target).Error; err != nil {
			return fmt.Errorf("failed to persist published api spec: %w", err)
		}

		event := models.APIPublishEvent{
			SpecID:      target.ID,
			EventType:   "publish",
			FromVersion: previous.SemanticVersion,
			ToVersion:   target.SemanticVersion,
			DiffSummary: "",
			CreatedBy:   input.ActorUserID,
			CreatedAt:   now,
		}
		if err := tx.Create(&event).Error; err != nil {
			return fmt.Errorf("failed to persist api publish event: %w", err)
		}

		published = target
		return nil
	})
	if err != nil {
		return models.APISpec{}, err
	}
	return published, nil
}
