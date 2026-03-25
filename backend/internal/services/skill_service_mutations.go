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

// CreateSkill persists a new skill with tag relation updates.
func (s *SkillService) CreateSkill(ctx context.Context, input CreateSkillInput) (models.Skill, error) {
	name := strings.TrimSpace(input.Name)
	if input.OwnerID == 0 {
		return models.Skill{}, fmt.Errorf("owner id is required")
	}
	if name == "" {
		return models.Skill{}, fmt.Errorf("name is required")
	}
	sourceAnalysisJSON, err := SerializeSourceTopology(input.Analysis)
	if err != nil {
		return models.Skill{}, err
	}

	skill := models.Skill{
		OwnerID:            input.OwnerID,
		OrganizationID:     input.OrganizationID,
		Name:               name,
		Description:        strings.TrimSpace(input.Description),
		Content:            strings.TrimSpace(input.Content),
		CategorySlug:       strings.TrimSpace(input.CategorySlug),
		SubcategorySlug:    strings.TrimSpace(input.SubcategorySlug),
		Visibility:         normalizeVisibility(input.Visibility),
		SourceType:         normalizeSourceType(input.SourceType),
		RecordOrigin:       normalizeRecordOrigin(input.RecordOrigin),
		SourceURL:          strings.TrimSpace(input.SourceURL),
		SourceBranch:       strings.TrimSpace(input.SourceBranch),
		SourcePath:         strings.TrimSpace(input.SourcePath),
		RepoURL:            strings.TrimSpace(input.RepoURL),
		SourceAnalysisJSON: sourceAnalysisJSON,
		InstallCommand:     strings.TrimSpace(input.InstallCommand),
		StarCount:          input.StarCount,
		QualityScore:       input.QualityScore,
		LastSyncedAt:       input.LastSyncedAt,
	}

	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return models.Skill{}, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	if err := tx.Create(&skill).Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to create skill: %w", err)
	}
	if err := replaceSkillTags(ctx, tx, skill.ID, input.Tags); err != nil {
		return models.Skill{}, err
	}
	if s.versionService != nil {
		if err := s.versionService.CaptureWithTx(ctx, tx, skill.ID, "create", nil); err != nil {
			return models.Skill{}, err
		}
	}
	if err := tx.Commit().Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return s.GetSkillByID(ctx, skill.ID)
}

// ReplaceSkillTags replaces all tags of a skill with the provided list.
func (s *SkillService) ReplaceSkillTags(ctx context.Context, skillID uint, tags []string) error {
	return replaceSkillTags(ctx, s.db, skillID, tags)
}

func replaceSkillTags(ctx context.Context, db *gorm.DB, skillID uint, tags []string) error {
	normalized := normalizeTagSlice(tags)

	var skill models.Skill
	if err := db.WithContext(ctx).First(&skill, skillID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSkillNotFound
		}
		return fmt.Errorf("failed to load skill: %w", err)
	}

	tagModels := make([]models.Tag, 0, len(normalized))
	for _, name := range normalized {
		var tag models.Tag
		err := db.WithContext(ctx).Where("name = ?", name).First(&tag).Error
		if err == nil {
			tagModels = append(tagModels, tag)
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to query tag %q: %w", name, err)
		}
		tag = models.Tag{Name: name}
		if err := db.WithContext(ctx).Create(&tag).Error; err != nil {
			return fmt.Errorf("failed to create tag %q: %w", name, err)
		}
		tagModels = append(tagModels, tag)
	}

	if err := db.WithContext(ctx).Model(&skill).Association("Tags").Replace(tagModels); err != nil {
		return fmt.Errorf("failed to replace skill tags: %w", err)
	}
	return nil
}

// SetVisibility updates visibility of a skill owned by user.
func (s *SkillService) SetVisibility(ctx context.Context, skillID uint, ownerID uint, visibility models.SkillVisibility) error {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	var skill models.Skill
	if err := tx.Where("id = ? AND owner_id = ?", skillID, ownerID).First(&skill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSkillNotFound
		}
		return fmt.Errorf("failed to load skill: %w", err)
	}

	if err := tx.Model(&skill).Update("visibility", normalizeVisibility(visibility)).Error; err != nil {
		return fmt.Errorf("failed to update visibility: %w", err)
	}
	if s.versionService != nil {
		if err := s.versionService.CaptureWithTx(ctx, tx, skill.ID, "visibility", nil); err != nil {
			return err
		}
	}
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit visibility transaction: %w", err)
	}
	return nil
}

// DeleteSkill deletes a skill owned by user.
func (s *SkillService) DeleteSkill(ctx context.Context, skillID uint, ownerID uint) error {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	var skill models.Skill
	if err := tx.Where("id = ? AND owner_id = ?", skillID, ownerID).First(&skill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSkillNotFound
		}
		return fmt.Errorf("failed to load skill for deletion: %w", err)
	}

	if s.versionService != nil {
		if err := s.versionService.CaptureWithTx(ctx, tx, skill.ID, "delete", nil); err != nil {
			return err
		}
	}
	if err := tx.Delete(&skill).Error; err != nil {
		return fmt.Errorf("failed to delete skill: %w", err)
	}
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit delete transaction: %w", err)
	}
	return nil
}

// UpdateRepositorySkill updates an existing repository skill from a sync result.
func (s *SkillService) UpdateRepositorySkill(ctx context.Context, input RepositoryUpdateInput) (models.Skill, error) {
	return s.UpdateSyncedSkill(ctx, SyncUpdateInput{
		SkillID:      input.SkillID,
		OwnerID:      input.OwnerID,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    input.Source.URL,
		SourceBranch: input.Source.Branch,
		SourcePath:   input.Source.Path,
		Meta:         input.Meta,
	})
}

// UpdateRepositorySkillWithRunContext updates one repository skill and links the captured version to one sync run.
func (s *SkillService) UpdateRepositorySkillWithRunContext(
	ctx context.Context,
	input RepositoryUpdateInput,
	actorUserID *uint,
	runID *uint,
) (models.Skill, error) {
	return s.UpdateSyncedSkillWithRunContext(ctx, SyncUpdateInput{
		SkillID:      input.SkillID,
		OwnerID:      input.OwnerID,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    input.Source.URL,
		SourceBranch: input.Source.Branch,
		SourcePath:   input.Source.Path,
		Meta:         input.Meta,
	}, actorUserID, runID)
}

// UpdateSyncedSkill updates an existing remote skill from a sync result.
func (s *SkillService) UpdateSyncedSkill(ctx context.Context, input SyncUpdateInput) (models.Skill, error) {
	return s.updateSyncedSkillWithVersionContext(ctx, input, nil, nil)
}

// UpdateSyncedSkillWithRunContext updates one remote skill and links the captured version to one sync run.
func (s *SkillService) UpdateSyncedSkillWithRunContext(
	ctx context.Context,
	input SyncUpdateInput,
	actorUserID *uint,
	runID *uint,
) (models.Skill, error) {
	return s.updateSyncedSkillWithVersionContext(ctx, input, actorUserID, runID)
}

func (s *SkillService) updateSyncedSkillWithVersionContext(
	ctx context.Context,
	input SyncUpdateInput,
	actorUserID *uint,
	runID *uint,
) (models.Skill, error) {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return models.Skill{}, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()
	sourceAnalysisJSON, err := SerializeSourceTopology(input.Meta.Analysis)
	if err != nil {
		return models.Skill{}, err
	}

	var skill models.Skill
	if err := tx.Where("id = ? AND owner_id = ?", input.SkillID, input.OwnerID).First(&skill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Skill{}, ErrSkillNotFound
		}
		return models.Skill{}, fmt.Errorf("failed to load skill: %w", err)
	}

	now := time.Now().UTC()
	updates := map[string]any{
		"name":                 strings.TrimSpace(input.Meta.Name),
		"description":          strings.TrimSpace(input.Meta.Description),
		"content":              strings.TrimSpace(input.Meta.Content),
		"source_type":          normalizeSourceType(input.SourceType),
		"record_origin":        models.RecordOriginImported,
		"source_url":           strings.TrimSpace(input.SourceURL),
		"source_branch":        strings.TrimSpace(input.SourceBranch),
		"source_path":          strings.TrimSpace(input.SourcePath),
		"repo_url":             strings.TrimSpace(input.SourceURL),
		"source_analysis_json": sourceAnalysisJSON,
		"last_synced_at":       &now,
	}
	if err := tx.Model(&skill).Updates(updates).Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to update synced skill: %w", err)
	}
	if err := replaceSkillTags(ctx, tx, skill.ID, input.Meta.Tags); err != nil {
		return models.Skill{}, err
	}
	if s.versionService != nil {
		if err := s.versionService.CaptureWithTxAndRunContext(ctx, tx, skill.ID, "sync", actorUserID, runID); err != nil {
			return models.Skill{}, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return s.GetSkillByID(ctx, skill.ID)
}
