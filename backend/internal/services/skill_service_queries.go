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

func (s *SkillService) listOrganizationIDsByUser(ctx context.Context, userID uint) ([]uint, error) {
	if userID == 0 {
		return nil, nil
	}

	organizationIDs := make([]uint, 0)
	if err := s.db.WithContext(ctx).
		Model(&models.OrganizationMember{}).
		Where("user_id = ?", userID).
		Pluck("organization_id", &organizationIDs).Error; err != nil {
		return nil, fmt.Errorf("failed to list organization memberships: %w", err)
	}

	return organizationIDs, nil
}

func applyViewerSkillVisibilityScope(
	query *gorm.DB,
	viewerUserID uint,
	organizationIDs []uint,
) *gorm.DB {
	if viewerUserID == 0 {
		return query.Where("skills.visibility = ?", models.VisibilityPublic)
	}

	if len(organizationIDs) == 0 {
		return query.Where("(skills.visibility = ? OR skills.owner_id = ?)", models.VisibilityPublic, viewerUserID)
	}

	return query.Where(
		"(skills.visibility = ? OR skills.owner_id = ? OR skills.organization_id IN ?)",
		models.VisibilityPublic,
		viewerUserID,
		organizationIDs,
	)
}

// SearchSkills returns skills visible to the viewer with optional text and tag filters.
func (s *SkillService) SearchSkills(ctx context.Context, input SearchInput) ([]models.Skill, error) {
	query := s.db.WithContext(ctx).Model(&models.Skill{})

	organizationIDs, err := s.listOrganizationIDsByUser(ctx, input.ViewerUserID)
	if err != nil {
		return nil, err
	}
	query = applyViewerSkillVisibilityScope(query, input.ViewerUserID, organizationIDs)

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

	organizationIDs, err := s.listOrganizationIDsByUser(ctx, viewerUserID)
	if err != nil {
		return models.Skill{}, err
	}
	query = applyViewerSkillVisibilityScope(query, viewerUserID, organizationIDs)

	var skill models.Skill
	err = query.First(&skill).Error
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

	organizationIDs, err := s.listOrganizationIDsByUser(ctx, viewerUserID)
	if err != nil {
		return models.Skill{}, err
	}
	query = applyViewerSkillVisibilityScope(query, viewerUserID, organizationIDs)

	var skill models.Skill
	err = query.First(&skill).Error
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
