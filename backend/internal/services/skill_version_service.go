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

// SkillVersionService manages immutable skill snapshots and restore actions.
type SkillVersionService struct {
	db             *gorm.DB
	retentionLimit int
}

// ListSkillVersionsInput stores filters for skill version listing.
type ListSkillVersionsInput struct {
	SkillID         uint
	Limit           int
	Trigger         string
	CapturedAfter   *time.Time
	CapturedBefore  *time.Time
	IncludeArchived bool
}

const defaultSkillVersionRetentionLimit = 50

// CompareSkillVersionsInput stores compare parameters for two version snapshots.
type CompareSkillVersionsInput struct {
	SkillID       uint
	FromVersionID uint
	ToVersionID   uint
}

// SkillVersionMetadataChange stores one metadata change row for compare output.
type SkillVersionMetadataChange struct {
	Field  string
	Before string
	After  string
}

// SkillVersionCompareResult stores structured compare details between two snapshots.
type SkillVersionCompareResult struct {
	SkillID         uint
	FromVersion     models.SkillVersion
	ToVersion       models.SkillVersion
	ChangedFields   []string
	MetadataChanges []SkillVersionMetadataChange
	TagsAdded       []string
	TagsRemoved     []string
	ContentChanged  bool
	ContentBefore   string
	ContentAfter    string
	BeforeDigest    string
	AfterDigest     string
	ChangeSummary   string
	RiskLevel       string
}

// NewSkillVersionService creates a new skill version service.
func NewSkillVersionService(db *gorm.DB) *SkillVersionService {
	return &SkillVersionService{
		db:             db,
		retentionLimit: defaultSkillVersionRetentionLimit,
	}
}

// Capture creates a new version snapshot for the given skill.
func (s *SkillVersionService) Capture(
	ctx context.Context,
	skillID uint,
	trigger string,
	actorUserID *uint,
) error {
	return s.captureWithDB(ctx, s.db.WithContext(ctx), skillID, trigger, actorUserID, nil)
}

// CaptureWithRunContext creates a new version snapshot linked to one sync run.
func (s *SkillVersionService) CaptureWithRunContext(
	ctx context.Context,
	skillID uint,
	trigger string,
	actorUserID *uint,
	runID *uint,
) error {
	return s.captureWithDB(ctx, s.db.WithContext(ctx), skillID, trigger, actorUserID, runID)
}

// CaptureWithTx creates a new version snapshot with provided transaction.
func (s *SkillVersionService) CaptureWithTx(
	ctx context.Context,
	tx *gorm.DB,
	skillID uint,
	trigger string,
	actorUserID *uint,
) error {
	if tx == nil {
		tx = s.db.WithContext(ctx)
	}
	return s.captureWithDB(ctx, tx.WithContext(ctx), skillID, trigger, actorUserID, nil)
}

// CaptureWithTxAndRunContext creates a version snapshot with transaction and run linkage.
func (s *SkillVersionService) CaptureWithTxAndRunContext(
	ctx context.Context,
	tx *gorm.DB,
	skillID uint,
	trigger string,
	actorUserID *uint,
	runID *uint,
) error {
	if tx == nil {
		tx = s.db.WithContext(ctx)
	}
	return s.captureWithDB(ctx, tx.WithContext(ctx), skillID, trigger, actorUserID, runID)
}

// ListBySkill returns latest versions for one skill.
func (s *SkillVersionService) ListBySkill(ctx context.Context, input ListSkillVersionsInput) ([]models.SkillVersion, error) {
	if input.SkillID == 0 {
		return nil, fmt.Errorf("skill id is required")
	}
	limit := input.Limit
	if limit <= 0 || limit > 400 {
		limit = 80
	}

	query := s.db.WithContext(ctx).
		Where("skill_id = ?", input.SkillID)
	if !input.IncludeArchived {
		query = query.Where("archived_at IS NULL")
	}

	if trigger := strings.ToLower(strings.TrimSpace(input.Trigger)); trigger != "" {
		query = query.Where("LOWER(trigger) = ?", trigger)
	}
	if input.CapturedAfter != nil {
		query = query.Where("captured_at >= ?", input.CapturedAfter.UTC())
	}
	if input.CapturedBefore != nil {
		query = query.Where("captured_at <= ?", input.CapturedBefore.UTC())
	}

	var items []models.SkillVersion
	if err := query.
		Preload("ActorUser").
		Preload("Run").
		Order("version_number DESC").
		Order("id DESC").
		Limit(limit).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list skill versions: %w", err)
	}
	return items, nil
}

// GetByID returns one version by skill and version id.
func (s *SkillVersionService) GetByID(ctx context.Context, skillID uint, versionID uint) (models.SkillVersion, error) {
	if skillID == 0 {
		return models.SkillVersion{}, fmt.Errorf("skill id is required")
	}
	if versionID == 0 {
		return models.SkillVersion{}, fmt.Errorf("version id is required")
	}

	var item models.SkillVersion
	if err := s.db.WithContext(ctx).
		Preload("ActorUser").
		Preload("Run").
		Where("skill_id = ? AND id = ?", skillID, versionID).
		First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.SkillVersion{}, ErrSkillNotFound
		}
		return models.SkillVersion{}, fmt.Errorf("failed to load skill version: %w", err)
	}
	return item, nil
}

// GetLatestByRunID returns the latest version linked to one sync run.
func (s *SkillVersionService) GetLatestByRunID(ctx context.Context, runID uint) (models.SkillVersion, error) {
	if runID == 0 {
		return models.SkillVersion{}, fmt.Errorf("run id is required")
	}

	var item models.SkillVersion
	if err := s.db.WithContext(ctx).
		Preload("ActorUser").
		Preload("Run").
		Where("run_id = ?", runID).
		Order("version_number DESC").
		Order("id DESC").
		First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.SkillVersion{}, ErrSkillNotFound
		}
		return models.SkillVersion{}, fmt.Errorf("failed to load skill version by run id: %w", err)
	}
	return item, nil
}

// CompareVersions returns structured differences between two snapshots.
func (s *SkillVersionService) CompareVersions(
	ctx context.Context,
	input CompareSkillVersionsInput,
) (SkillVersionCompareResult, error) {
	if input.SkillID == 0 {
		return SkillVersionCompareResult{}, fmt.Errorf("skill id is required")
	}
	if input.FromVersionID == 0 || input.ToVersionID == 0 {
		return SkillVersionCompareResult{}, fmt.Errorf("from and to version ids are required")
	}

	fromVersion, err := s.GetByID(ctx, input.SkillID, input.FromVersionID)
	if err != nil {
		return SkillVersionCompareResult{}, err
	}
	toVersion, err := s.GetByID(ctx, input.SkillID, input.ToVersionID)
	if err != nil {
		return SkillVersionCompareResult{}, err
	}
	result, err := compareSkillVersionSnapshots(fromVersion, toVersion)
	if err != nil {
		return SkillVersionCompareResult{}, err
	}
	result.SkillID = input.SkillID
	return result, nil
}

// RestoreVersion restores one version snapshot to current skill state and records a new version.
func (s *SkillVersionService) RestoreVersion(
	ctx context.Context,
	skillID uint,
	versionID uint,
	ownerID uint,
	actorUserID *uint,
) (models.Skill, error) {
	return s.restoreVersion(ctx, skillID, versionID, ownerID, actorUserID, "restore")
}

// RollbackVersion rolls back to one historical version and creates a rollback snapshot.
func (s *SkillVersionService) RollbackVersion(
	ctx context.Context,
	skillID uint,
	versionID uint,
	ownerID uint,
	actorUserID *uint,
) (models.Skill, error) {
	return s.restoreVersion(ctx, skillID, versionID, ownerID, actorUserID, "rollback")
}

func (s *SkillVersionService) restoreVersion(
	ctx context.Context,
	skillID uint,
	versionID uint,
	ownerID uint,
	actorUserID *uint,
	trigger string,
) (models.Skill, error) {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return models.Skill{}, fmt.Errorf("failed to start version restore transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	var version models.SkillVersion
	if err := tx.Where("id = ? AND skill_id = ?", versionID, skillID).First(&version).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Skill{}, ErrSkillNotFound
		}
		return models.Skill{}, fmt.Errorf("failed to load skill version: %w", err)
	}

	var skill models.Skill
	if err := tx.Where("id = ? AND owner_id = ?", skillID, ownerID).First(&skill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Skill{}, ErrSkillNotFound
		}
		return models.Skill{}, fmt.Errorf("failed to load skill for restore: %w", err)
	}

	updates := map[string]any{
		"name":             version.Name,
		"description":      version.Description,
		"content":          version.Content,
		"category_slug":    version.CategorySlug,
		"subcategory_slug": version.SubcategorySlug,
		"visibility":       version.Visibility,
		"source_type":      version.SourceType,
		"source_url":       version.SourceURL,
		"source_branch":    version.SourceBranch,
		"source_path":      version.SourcePath,
		"repo_url":         version.RepoURL,
		"install_command":  version.InstallCommand,
		"star_count":       version.StarCount,
		"quality_score":    version.QualityScore,
	}
	if err := tx.Model(&skill).Updates(updates).Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to apply skill version: %w", err)
	}

	tags, err := parseVersionTags(version.TagsJSON)
	if err != nil {
		return models.Skill{}, err
	}
	if err := replaceSkillTags(ctx, tx, skill.ID, tags); err != nil {
		return models.Skill{}, err
	}

	if err := s.CaptureWithTx(ctx, tx, skill.ID, trigger, actorUserID); err != nil {
		return models.Skill{}, err
	}

	if err := tx.Commit().Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to commit version restore: %w", err)
	}

	var updated models.Skill
	if err := s.db.WithContext(ctx).
		Preload("Owner").
		Preload("Tags").
		First(&updated, skill.ID).Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to load restored skill: %w", err)
	}
	return updated, nil
}
