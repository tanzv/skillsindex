package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func (s *SkillVersionService) captureWithDB(
	ctx context.Context,
	queryDB *gorm.DB,
	skillID uint,
	trigger string,
	actorUserID *uint,
	runID *uint,
) error {
	if skillID == 0 {
		return fmt.Errorf("skill id is required")
	}
	if queryDB == nil {
		return fmt.Errorf("version query db is required")
	}

	skill, err := loadSkillForVersionCapture(queryDB, skillID)
	if err != nil {
		return err
	}

	currentMax, err := latestSkillVersionNumber(queryDB, skill.ID)
	if err != nil {
		return err
	}

	previousVersion, hasPreviousVersion, err := latestActiveSkillVersion(queryDB, skill.ID)
	if err != nil {
		return err
	}

	version, err := buildSkillVersionSnapshot(skill, currentMax+1, trigger, actorUserID, runID)
	if err != nil {
		return err
	}

	if hasPreviousVersion {
		if err := applyPreviousVersionDiff(&version, previousVersion); err != nil {
			return err
		}
	} else {
		version.BeforeDigest = ""
		version.ChangedFieldsJSON = "[]"
	}

	if err := queryDB.Create(&version).Error; err != nil {
		return fmt.Errorf("failed to store skill version: %w", err)
	}
	if err := s.applyRetentionPolicy(ctx, queryDB, skill.ID); err != nil {
		return err
	}
	return nil
}

func loadSkillForVersionCapture(queryDB *gorm.DB, skillID uint) (models.Skill, error) {
	var skill models.Skill
	if err := queryDB.
		Preload("Tags").
		First(&skill, skillID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Skill{}, ErrSkillNotFound
		}
		return models.Skill{}, fmt.Errorf("failed to load skill for version capture: %w", err)
	}
	return skill, nil
}

func latestSkillVersionNumber(queryDB *gorm.DB, skillID uint) (int, error) {
	var currentMax int
	if err := queryDB.
		Model(&models.SkillVersion{}).
		Where("skill_id = ?", skillID).
		Select("COALESCE(MAX(version_number), 0)").
		Scan(&currentMax).Error; err != nil {
		return 0, fmt.Errorf("failed to query version sequence: %w", err)
	}
	return currentMax, nil
}

func latestActiveSkillVersion(queryDB *gorm.DB, skillID uint) (models.SkillVersion, bool, error) {
	var previousVersion models.SkillVersion
	if err := queryDB.
		Where("skill_id = ? AND archived_at IS NULL", skillID).
		Order("version_number DESC").
		Order("id DESC").
		First(&previousVersion).Error; err == nil {
		return previousVersion, true, nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.SkillVersion{}, false, fmt.Errorf("failed to load previous skill version: %w", err)
	}
	return models.SkillVersion{}, false, nil
}

func buildSkillVersionSnapshot(
	skill models.Skill,
	versionNumber int,
	trigger string,
	actorUserID *uint,
	runID *uint,
) (models.SkillVersion, error) {
	tagNames := make([]string, 0, len(skill.Tags))
	for _, tag := range skill.Tags {
		tagNames = append(tagNames, tag.Name)
	}
	sort.Strings(tagNames)
	tagsJSON, err := json.Marshal(tagNames)
	if err != nil {
		return models.SkillVersion{}, fmt.Errorf("failed to serialize tags: %w", err)
	}

	version := models.SkillVersion{
		SkillID:         skill.ID,
		OwnerID:         skill.OwnerID,
		VersionNumber:   versionNumber,
		Trigger:         normalizeVersionTrigger(trigger),
		RunID:           runID,
		ActorUserID:     actorUserID,
		Name:            skill.Name,
		Description:     skill.Description,
		Content:         skill.Content,
		CategorySlug:    skill.CategorySlug,
		SubcategorySlug: skill.SubcategorySlug,
		Visibility:      skill.Visibility,
		SourceType:      skill.SourceType,
		SourceURL:       skill.SourceURL,
		SourceBranch:    skill.SourceBranch,
		SourcePath:      skill.SourcePath,
		RepoURL:         skill.RepoURL,
		InstallCommand:  skill.InstallCommand,
		StarCount:       skill.StarCount,
		QualityScore:    skill.QualityScore,
		TagsJSON:        string(tagsJSON),
		CapturedAt:      time.Now().UTC(),
	}
	version.AfterDigest = buildSkillVersionDigest(version)
	version.RiskLevel = "low"
	version.ChangeSummary = "Initial snapshot captured."
	return version, nil
}

func applyPreviousVersionDiff(version *models.SkillVersion, previousVersion models.SkillVersion) error {
	compareResult, err := compareSkillVersionSnapshots(previousVersion, *version)
	if err != nil {
		return err
	}
	version.BeforeDigest = compareResult.BeforeDigest
	version.AfterDigest = compareResult.AfterDigest
	version.ChangeSummary = compareResult.ChangeSummary
	version.RiskLevel = compareResult.RiskLevel

	changedFieldsJSON, marshalErr := json.Marshal(compareResult.ChangedFields)
	if marshalErr != nil {
		return fmt.Errorf("failed to serialize changed fields: %w", marshalErr)
	}
	version.ChangedFieldsJSON = string(changedFieldsJSON)
	return nil
}
