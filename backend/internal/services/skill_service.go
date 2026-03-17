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
	// ErrSkillNotFound indicates that the requested skill does not exist for current scope.
	ErrSkillNotFound = errors.New("skill not found")
)

// SkillService handles skill search and management operations.
type SkillService struct {
	db             *gorm.DB
	versionService *SkillVersionService
}

// SearchInput is the filter input for searching skill items.
type SearchInput struct {
	ViewerUserID uint
	Query        string
	Tags         []string
	Limit        int
}

// CreateSkillInput defines fields for creating a skill.
type CreateSkillInput struct {
	OwnerID         uint
	OrganizationID  *uint
	Name            string
	Description     string
	Content         string
	Tags            []string
	CategorySlug    string
	SubcategorySlug string
	Visibility      models.SkillVisibility
	SourceType      models.SkillSourceType
	RecordOrigin    models.SkillRecordOrigin
	SourceURL       string
	SourceBranch    string
	SourcePath      string
	RepoURL         string
	InstallCommand  string
	StarCount       int
	QualityScore    float64
	LastSyncedAt    *time.Time
}

// RepositoryUpdateInput contains repository sync update payload.
type RepositoryUpdateInput struct {
	SkillID uint
	OwnerID uint
	Source  RepoSource
	Meta    ExtractedSkill
}

// SyncUpdateInput contains sync update payload for remote sources.
type SyncUpdateInput struct {
	SkillID      uint
	OwnerID      uint
	SourceType   models.SkillSourceType
	SourceURL    string
	SourceBranch string
	SourcePath   string
	Meta         ExtractedSkill
}

// PublicSearchInput is the filter input for marketplace public skills.
type PublicSearchInput struct {
	Query           string
	Tags            []string
	CategorySlug    string
	SubcategorySlug string
	SortBy          string
	Page            int
	Limit           int
}

// PublicSearchResult is a paginated result of public skills.
type PublicSearchResult struct {
	Items []models.Skill
	Total int64
	Page  int
	Limit int
}

// CategorySkillCount stores public skill counts per category slug.
type CategorySkillCount struct {
	CategorySlug string
	Count        int64
}

// TimelinePoint stores cumulative counts for a date bucket.
type TimelinePoint struct {
	BucketDate time.Time
	Count      int64
	Cumulative int64
}

// DashboardSkillCounts contains skill aggregates for dashboard widgets.
type DashboardSkillCounts struct {
	Total    int64
	Public   int64
	Private  int64
	Syncable int64
}

// NewSkillService creates a new skill service instance.
func NewSkillService(db *gorm.DB) *SkillService {
	return &SkillService{
		db:             db,
		versionService: NewSkillVersionService(db),
	}
}

// CreateSkill persists a new skill with tag relation updates.
func (s *SkillService) CreateSkill(ctx context.Context, input CreateSkillInput) (models.Skill, error) {
	name := strings.TrimSpace(input.Name)
	if input.OwnerID == 0 {
		return models.Skill{}, fmt.Errorf("owner id is required")
	}
	if name == "" {
		return models.Skill{}, fmt.Errorf("name is required")
	}

	skill := models.Skill{
		OwnerID:         input.OwnerID,
		OrganizationID:  input.OrganizationID,
		Name:            name,
		Description:     strings.TrimSpace(input.Description),
		Content:         strings.TrimSpace(input.Content),
		CategorySlug:    strings.TrimSpace(input.CategorySlug),
		SubcategorySlug: strings.TrimSpace(input.SubcategorySlug),
		Visibility:      normalizeVisibility(input.Visibility),
		SourceType:      normalizeSourceType(input.SourceType),
		RecordOrigin:    normalizeRecordOrigin(input.RecordOrigin),
		SourceURL:       strings.TrimSpace(input.SourceURL),
		SourceBranch:    strings.TrimSpace(input.SourceBranch),
		SourcePath:      strings.TrimSpace(input.SourcePath),
		RepoURL:         strings.TrimSpace(input.RepoURL),
		InstallCommand:  strings.TrimSpace(input.InstallCommand),
		StarCount:       input.StarCount,
		QualityScore:    input.QualityScore,
		LastSyncedAt:    input.LastSyncedAt,
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

// SearchSkills returns skills visible to the viewer with optional text and tag filters.
func (s *SkillService) SearchSkills(ctx context.Context, input SearchInput) ([]models.Skill, error) {
	query := s.db.WithContext(ctx).Model(&models.Skill{})

	if input.ViewerUserID == 0 {
		query = query.Where("skills.visibility = ?", models.VisibilityPublic)
	} else {
		query = query.Where("(skills.visibility = ? OR skills.owner_id = ?)", models.VisibilityPublic, input.ViewerUserID)
	}

	if text := strings.TrimSpace(strings.ToLower(input.Query)); text != "" {
		like := "%" + text + "%"
		query = query.Where("(LOWER(skills.name) LIKE ? OR LOWER(skills.description) LIKE ?)", like, like)
	}

	normalizedTags := normalizeTagSlice(input.Tags)
	if len(normalizedTags) > 0 {
		subQuery := s.db.WithContext(ctx).
			Model(&models.Skill{}).
			Joins("JOIN skill_tags st ON st.skill_id = skills.id").
			Joins("JOIN tags t ON t.id = st.tag_id").
			Where("t.name IN ?", normalizedTags).
			Group("skills.id").
			Having("COUNT(DISTINCT t.name) = ?", len(normalizedTags)).
			Select("skills.id")
		query = query.Where("skills.id IN (?)", subQuery)
	}

	limit := input.Limit
	if limit <= 0 || limit > 200 {
		limit = 100
	}

	var skills []models.Skill
	if err := query.
		Preload("Owner").
		Preload("Tags").
		Order("skills.updated_at DESC").
		Limit(limit).
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to search skills: %w", err)
	}
	return skills, nil
}

// ListSkillsForUserScope returns skills owned by user or shared through organization IDs.
func (s *SkillService) ListSkillsForUserScope(ctx context.Context, userID uint, organizationIDs []uint) ([]models.Skill, error) {
	query := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Preload("Owner").
		Preload("Organization").
		Preload("Tags")

	if userID == 0 && len(organizationIDs) == 0 {
		return []models.Skill{}, nil
	}
	if len(organizationIDs) == 0 {
		query = query.Where("owner_id = ?", userID)
	} else {
		query = query.Where("owner_id = ? OR organization_id IN ?", userID, organizationIDs)
	}

	var skills []models.Skill
	if err := query.
		Order("updated_at DESC").
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to list scoped skills: %w", err)
	}
	return skills, nil
}

// GetSkillByID returns a skill with owner and tags by id.
func (s *SkillService) GetSkillByID(ctx context.Context, skillID uint) (models.Skill, error) {
	var skill models.Skill
	err := s.db.WithContext(ctx).
		Preload("Owner").
		Preload("Tags").
		First(&skill, skillID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Skill{}, ErrSkillNotFound
	}
	if err != nil {
		return models.Skill{}, fmt.Errorf("failed to load skill: %w", err)
	}
	return skill, nil
}

// GetVisibleSkillByID returns a skill only when viewer has visibility permission.
func (s *SkillService) GetVisibleSkillByID(ctx context.Context, skillID uint, viewerUserID uint) (models.Skill, error) {
	query := s.db.WithContext(ctx).
		Preload("Owner").
		Preload("Tags").
		Where("skills.id = ?", skillID)

	if viewerUserID == 0 {
		query = query.Where("skills.visibility = ?", models.VisibilityPublic)
	} else {
		query = query.Where("(skills.visibility = ? OR skills.owner_id = ?)", models.VisibilityPublic, viewerUserID)
	}

	var skill models.Skill
	err := query.First(&skill).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Skill{}, ErrSkillNotFound
	}
	if err != nil {
		return models.Skill{}, fmt.Errorf("failed to load visible skill: %w", err)
	}
	return skill, nil
}

// GetMarketplaceVisibleSkillByID returns a marketplace-visible skill while excluding local seed records.
func (s *SkillService) GetMarketplaceVisibleSkillByID(ctx context.Context, skillID uint, viewerUserID uint) (models.Skill, error) {
	query := s.db.WithContext(ctx).
		Preload("Owner").
		Preload("Tags").
		Where("skills.id = ?", skillID).
		Where("skills.record_origin = ?", models.RecordOriginImported)

	if viewerUserID == 0 {
		query = query.Where("skills.visibility = ?", models.VisibilityPublic)
	} else {
		query = query.Where("(skills.visibility = ? OR skills.owner_id = ?)", models.VisibilityPublic, viewerUserID)
	}

	var skill models.Skill
	err := query.First(&skill).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Skill{}, ErrSkillNotFound
	}
	if err != nil {
		return models.Skill{}, fmt.Errorf("failed to load marketplace-visible skill: %w", err)
	}
	return skill, nil
}

// ListSkillsByOwner returns all skills owned by a specific user.
func (s *SkillService) ListSkillsByOwner(ctx context.Context, ownerID uint) ([]models.Skill, error) {
	var skills []models.Skill
	if err := s.db.WithContext(ctx).
		Preload("Owner").
		Preload("Tags").
		Where("owner_id = ?", ownerID).
		Order("updated_at DESC").
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to list user skills: %w", err)
	}
	return skills, nil
}

// ListAllSkills returns all skills across owners.
func (s *SkillService) ListAllSkills(ctx context.Context) ([]models.Skill, error) {
	var skills []models.Skill
	if err := s.db.WithContext(ctx).
		Preload("Owner").
		Preload("Tags").
		Order("updated_at DESC").
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to list all skills: %w", err)
	}
	return skills, nil
}

// ListRepositorySkillsForSync lists repository skills for periodic/manual synchronization.
func (s *SkillService) ListRepositorySkillsForSync(
	ctx context.Context,
	ownerID *uint,
	dueBefore *time.Time,
	limit int,
) ([]models.Skill, error) {
	if limit <= 0 {
		limit = 100
	}
	if limit > 500 {
		limit = 500
	}

	query := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Where("source_type = ?", models.SourceTypeRepository).
		Where("TRIM(COALESCE(source_url, '')) <> ''")

	if ownerID != nil && *ownerID != 0 {
		query = query.Where("owner_id = ?", *ownerID)
	}
	if dueBefore != nil {
		query = query.Where("last_synced_at IS NULL OR last_synced_at <= ?", dueBefore.UTC())
	}

	var skills []models.Skill
	if err := query.
		Preload("Owner").
		Preload("Tags").
		Order("last_synced_at ASC").
		Order("id ASC").
		Limit(limit).
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to list repository skills for sync: %w", err)
	}
	return skills, nil
}

// CountDashboardSkills returns aggregate counts for dashboard pages.
func (s *SkillService) CountDashboardSkills(ctx context.Context, ownerID uint, includeAll bool) (DashboardSkillCounts, error) {
	query := s.db.WithContext(ctx).Model(&models.Skill{})
	if !includeAll {
		query = query.Where("owner_id = ?", ownerID)
	}

	type dashboardCountRow struct {
		Total         int64
		PublicCount   int64
		PrivateCount  int64
		SyncableCount int64
	}
	row := dashboardCountRow{}

	if err := query.Select(
		`COUNT(*) AS total,
		COALESCE(SUM(CASE WHEN visibility = ? THEN 1 ELSE 0 END), 0) AS public_count,
		COALESCE(SUM(CASE WHEN visibility = ? THEN 1 ELSE 0 END), 0) AS private_count,
		COALESCE(SUM(CASE WHEN source_type IN ? THEN 1 ELSE 0 END), 0) AS syncable_count`,
		models.VisibilityPublic,
		models.VisibilityPrivate,
		[]models.SkillSourceType{models.SourceTypeRepository, models.SourceTypeSkillMP},
	).Scan(&row).Error; err != nil {
		return DashboardSkillCounts{}, fmt.Errorf("failed to count dashboard skills: %w", err)
	}

	return DashboardSkillCounts{
		Total:    row.Total,
		Public:   row.PublicCount,
		Private:  row.PrivateCount,
		Syncable: row.SyncableCount,
	}, nil
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

// UpdateSyncedSkill updates an existing remote skill from a sync result.
func (s *SkillService) UpdateSyncedSkill(ctx context.Context, input SyncUpdateInput) (models.Skill, error) {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return models.Skill{}, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	var skill models.Skill
	if err := tx.Where("id = ? AND owner_id = ?", input.SkillID, input.OwnerID).First(&skill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Skill{}, ErrSkillNotFound
		}
		return models.Skill{}, fmt.Errorf("failed to load skill: %w", err)
	}

	now := time.Now().UTC()
	updates := map[string]any{
		"name":           strings.TrimSpace(input.Meta.Name),
		"description":    strings.TrimSpace(input.Meta.Description),
		"content":        strings.TrimSpace(input.Meta.Content),
		"source_type":    normalizeSourceType(input.SourceType),
		"record_origin":  models.RecordOriginImported,
		"source_url":     strings.TrimSpace(input.SourceURL),
		"source_branch":  strings.TrimSpace(input.SourceBranch),
		"source_path":    strings.TrimSpace(input.SourcePath),
		"repo_url":       strings.TrimSpace(input.SourceURL),
		"last_synced_at": &now,
	}
	if err := tx.Model(&skill).Updates(updates).Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to update synced skill: %w", err)
	}
	if err := replaceSkillTags(ctx, tx, skill.ID, input.Meta.Tags); err != nil {
		return models.Skill{}, err
	}
	if s.versionService != nil {
		if err := s.versionService.CaptureWithTx(ctx, tx, skill.ID, "sync", nil); err != nil {
			return models.Skill{}, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return s.GetSkillByID(ctx, skill.ID)
}

// SearchPublicSkills returns paginated public skills for marketplace pages.
