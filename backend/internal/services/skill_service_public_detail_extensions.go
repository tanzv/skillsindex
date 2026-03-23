package services

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// ListMarketplaceVisibleSkillVersions returns visible version history for one marketplace skill.
func (s *SkillService) ListMarketplaceVisibleSkillVersions(
	ctx context.Context,
	skillID uint,
	viewerUserID uint,
	limit int,
) ([]models.SkillVersion, error) {
	skill, err := s.GetMarketplaceVisibleSkillByID(ctx, skillID, viewerUserID)
	if err != nil {
		return nil, err
	}
	if s.versionService == nil {
		return nil, fmt.Errorf("skill version service unavailable")
	}
	items, err := s.versionService.ListBySkill(ctx, ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list marketplace skill versions: %w", err)
	}
	return items, nil
}

type relatedMarketplaceSkillCandidate struct {
	skill          models.Skill
	score          int
	sharedTagCount int
}

// ListMarketplaceRelatedSkills returns deterministic related skill recommendations for one marketplace skill.
func (s *SkillService) ListMarketplaceRelatedSkills(
	ctx context.Context,
	skillID uint,
	viewerUserID uint,
	limit int,
) ([]models.Skill, error) {
	skill, err := s.GetMarketplaceVisibleSkillByID(ctx, skillID, viewerUserID)
	if err != nil {
		return nil, err
	}

	if limit <= 0 {
		limit = 6
	}
	if limit > 12 {
		limit = 12
	}

	query := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Preload("Owner").
		Preload("Tags").
		Where("skills.id <> ?", skill.ID).
		Where("skills.record_origin = ?", models.RecordOriginImported)

	if viewerUserID == 0 {
		query = query.Where("skills.visibility = ?", models.VisibilityPublic)
	} else {
		query = query.Where("(skills.visibility = ? OR skills.owner_id = ?)", models.VisibilityPublic, viewerUserID)
	}

	tagNames := make([]string, 0, len(skill.Tags))
	for _, tag := range skill.Tags {
		name := strings.TrimSpace(strings.ToLower(tag.Name))
		if name == "" {
			continue
		}
		tagNames = append(tagNames, name)
	}

	if len(tagNames) > 0 {
		tagMatchSubQuery := s.db.WithContext(ctx).
			Model(&models.Skill{}).
			Joins("JOIN skill_tags st ON st.skill_id = skills.id").
			Joins("JOIN tags t ON t.id = st.tag_id").
			Where("LOWER(t.name) IN ?", tagNames).
			Select("skills.id")
		query = query.Where(
			"(skills.category_slug = ? OR skills.subcategory_slug = ? OR skills.id IN (?))",
			skill.CategorySlug,
			skill.SubcategorySlug,
			tagMatchSubQuery,
		)
	} else {
		query = query.Where("(skills.category_slug = ? OR skills.subcategory_slug = ?)", skill.CategorySlug, skill.SubcategorySlug)
	}

	candidateLimit := limit * 6
	if candidateLimit < 18 {
		candidateLimit = 18
	}
	if candidateLimit > 72 {
		candidateLimit = 72
	}

	var skills []models.Skill
	if err := query.
		Order("skills.updated_at DESC").
		Order("skills.star_count DESC").
		Limit(candidateLimit).
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to list marketplace related skills: %w", err)
	}

	candidates := make([]relatedMarketplaceSkillCandidate, 0, len(skills))
	for _, item := range skills {
		sharedTagCount := countSharedMarketplaceTags(skill.Tags, item.Tags)
		score := scoreMarketplaceRelatedSkill(skill, item, sharedTagCount)
		if score <= 0 {
			continue
		}
		candidates = append(candidates, relatedMarketplaceSkillCandidate{
			skill:          item,
			score:          score,
			sharedTagCount: sharedTagCount,
		})
	}

	sort.Slice(candidates, func(i, j int) bool {
		if candidates[i].score != candidates[j].score {
			return candidates[i].score > candidates[j].score
		}
		if candidates[i].sharedTagCount != candidates[j].sharedTagCount {
			return candidates[i].sharedTagCount > candidates[j].sharedTagCount
		}
		if candidates[i].skill.QualityScore != candidates[j].skill.QualityScore {
			return candidates[i].skill.QualityScore > candidates[j].skill.QualityScore
		}
		if candidates[i].skill.StarCount != candidates[j].skill.StarCount {
			return candidates[i].skill.StarCount > candidates[j].skill.StarCount
		}
		if !candidates[i].skill.UpdatedAt.Equal(candidates[j].skill.UpdatedAt) {
			return candidates[i].skill.UpdatedAt.After(candidates[j].skill.UpdatedAt)
		}
		return candidates[i].skill.ID > candidates[j].skill.ID
	})

	if len(candidates) > limit {
		candidates = candidates[:limit]
	}

	result := make([]models.Skill, 0, len(candidates))
	for _, candidate := range candidates {
		result = append(result, candidate.skill)
	}
	return result, nil
}

func countSharedMarketplaceTags(left []models.Tag, right []models.Tag) int {
	if len(left) == 0 || len(right) == 0 {
		return 0
	}

	lookup := make(map[string]struct{}, len(left))
	for _, tag := range left {
		name := strings.TrimSpace(strings.ToLower(tag.Name))
		if name == "" {
			continue
		}
		lookup[name] = struct{}{}
	}

	total := 0
	for _, tag := range right {
		name := strings.TrimSpace(strings.ToLower(tag.Name))
		if name == "" {
			continue
		}
		if _, ok := lookup[name]; ok {
			total++
		}
	}
	return total
}

func scoreMarketplaceRelatedSkill(base models.Skill, candidate models.Skill, sharedTagCount int) int {
	score := 0

	if strings.EqualFold(strings.TrimSpace(base.SubcategorySlug), strings.TrimSpace(candidate.SubcategorySlug)) &&
		strings.TrimSpace(base.SubcategorySlug) != "" {
		score += 120
	}
	if strings.EqualFold(strings.TrimSpace(base.CategorySlug), strings.TrimSpace(candidate.CategorySlug)) &&
		strings.TrimSpace(base.CategorySlug) != "" {
		score += 80
	}
	score += sharedTagCount * 25
	score += int(candidate.QualityScore * 10)
	score += minInt(candidate.StarCount/10, 40)
	score += recencyMarketplaceRelatedSkillBonus(candidate.UpdatedAt)

	return score
}

func recencyMarketplaceRelatedSkillBonus(updatedAt time.Time) int {
	if updatedAt.IsZero() {
		return 0
	}

	age := time.Since(updatedAt)
	switch {
	case age <= 7*24*time.Hour:
		return 12
	case age <= 30*24*time.Hour:
		return 8
	case age <= 90*24*time.Hour:
		return 4
	default:
		return 0
	}
}
