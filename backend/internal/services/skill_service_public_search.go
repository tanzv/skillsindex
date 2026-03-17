package services

import (
	"context"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"
	"unicode"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func applyMarketplacePublicScope(query *gorm.DB) *gorm.DB {
	return query.
		Where("visibility = ?", models.VisibilityPublic).
		Where("record_origin = ?", models.RecordOriginImported)
}

func (s *SkillService) SearchPublicSkills(ctx context.Context, input PublicSearchInput) (PublicSearchResult, error) {
	page := input.Page
	if page <= 0 {
		page = 1
	}
	limit := input.Limit
	if limit <= 0 {
		limit = 24
	}
	if limit > 100 {
		limit = 100
	}

	query := applyMarketplacePublicScope(
		s.db.WithContext(ctx).
			Model(&models.Skill{}),
	)

	if text := strings.TrimSpace(strings.ToLower(input.Query)); text != "" {
		like := "%" + text + "%"
		query = query.Where("(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(content) LIKE ?)", like, like, like)
	}
	if category := strings.TrimSpace(input.CategorySlug); category != "" {
		query = query.Where("category_slug = ?", category)
	}
	if subcategory := strings.TrimSpace(input.SubcategorySlug); subcategory != "" {
		query = query.Where("subcategory_slug = ?", subcategory)
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

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return PublicSearchResult{}, fmt.Errorf("failed to count public skills: %w", err)
	}

	sortBy := strings.TrimSpace(strings.ToLower(input.SortBy))
	switch sortBy {
	case "stars":
		query = query.Order("star_count DESC").Order("updated_at DESC")
	case "quality":
		query = query.Order("quality_score DESC").Order("updated_at DESC")
	default:
		query = query.Order("updated_at DESC")
	}

	var skills []models.Skill
	if err := query.
		Preload("Owner").
		Preload("Tags").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&skills).Error; err != nil {
		return PublicSearchResult{}, fmt.Errorf("failed to query public skills: %w", err)
	}

	return PublicSearchResult{
		Items: skills,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// CountPublicSkills returns total count of public skills.
func (s *SkillService) CountPublicSkills(ctx context.Context) (int64, error) {
	var total int64
	if err := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Where("visibility = ?", models.VisibilityPublic).
		Where("record_origin = ?", models.RecordOriginImported).
		Count(&total).Error; err != nil {
		return 0, fmt.Errorf("failed to count public skills: %w", err)
	}
	return total, nil
}

// CountPublicCategorySkills returns grouped counts for category slug.
func (s *SkillService) CountPublicCategorySkills(ctx context.Context) ([]CategorySkillCount, error) {
	type row struct {
		CategorySlug string
		Count        int64
	}
	var rows []row
	if err := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Select("category_slug, COUNT(*) as count").
		Where("visibility = ?", models.VisibilityPublic).
		Where("record_origin = ?", models.RecordOriginImported).
		Group("category_slug").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to count category skills: %w", err)
	}

	result := make([]CategorySkillCount, 0, len(rows))
	for _, item := range rows {
		slug := strings.TrimSpace(item.CategorySlug)
		if slug == "" {
			continue
		}
		result = append(result, CategorySkillCount{CategorySlug: slug, Count: item.Count})
	}
	return result, nil
}

// CountPublicSubcategorySkills returns grouped counts for subcategory slug.
func (s *SkillService) CountPublicSubcategorySkills(ctx context.Context, categorySlug string) (map[string]int64, error) {
	type row struct {
		SubcategorySlug string
		Count           int64
	}
	var rows []row
	query := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Select("subcategory_slug, COUNT(*) as count").
		Where("visibility = ?", models.VisibilityPublic).
		Where("record_origin = ?", models.RecordOriginImported)
	if strings.TrimSpace(categorySlug) != "" {
		query = query.Where("category_slug = ?", strings.TrimSpace(categorySlug))
	}
	if err := query.Group("subcategory_slug").Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to count subcategory skills: %w", err)
	}

	counts := make(map[string]int64, len(rows))
	for _, item := range rows {
		slug := strings.TrimSpace(item.SubcategorySlug)
		if slug == "" {
			continue
		}
		counts[slug] = item.Count
	}
	return counts, nil
}

// BuildTimeline returns cumulative counts for day/week/month intervals.
func (s *SkillService) BuildTimeline(ctx context.Context, interval string) ([]TimelinePoint, error) {
	var skills []models.Skill
	if err := s.db.WithContext(ctx).
		Model(&models.Skill{}).
		Where("visibility = ?", models.VisibilityPublic).
		Where("record_origin = ?", models.RecordOriginImported).
		Select("created_at").
		Order("created_at ASC").
		Find(&skills).Error; err != nil {
		return nil, fmt.Errorf("failed to build timeline: %w", err)
	}

	buckets := make(map[time.Time]int64)
	for _, skill := range skills {
		date := normalizeBucketDate(skill.CreatedAt.UTC(), interval)
		buckets[date]++
	}
	points := make([]TimelinePoint, 0, len(buckets))
	for date, count := range buckets {
		points = append(points, TimelinePoint{BucketDate: date, Count: count})
	}
	sort.Slice(points, func(i, j int) bool {
		return points[i].BucketDate.Before(points[j].BucketDate)
	})

	var cumulative int64
	for i := range points {
		cumulative += points[i].Count
		points[i].Cumulative = cumulative
	}
	return points, nil
}

func normalizeBucketDate(ts time.Time, interval string) time.Time {
	switch strings.ToLower(strings.TrimSpace(interval)) {
	case "month":
		return time.Date(ts.Year(), ts.Month(), 1, 0, 0, 0, 0, time.UTC)
	case "week":
		weekday := int(ts.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start := ts.AddDate(0, 0, -(weekday - 1))
		return time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, time.UTC)
	default:
		return time.Date(ts.Year(), ts.Month(), ts.Day(), 0, 0, 0, 0, time.UTC)
	}
}

// AISemanticSearchPublicSkills runs a simple semantic ranking over public skills.
func (s *SkillService) AISemanticSearchPublicSkills(ctx context.Context, query string, limit int) ([]models.Skill, error) {
	normalizedQuery := strings.TrimSpace(query)
	if normalizedQuery == "" {
		return []models.Skill{}, nil
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	result, err := s.SearchPublicSkills(ctx, PublicSearchInput{Limit: 500, SortBy: "stars"})
	if err != nil {
		return nil, err
	}

	queryTokens := tokenizeForSemantic(normalizedQuery)
	if len(queryTokens) == 0 {
		return result.Items[:minInt(limit, len(result.Items))], nil
	}

	type scored struct {
		Skill models.Skill
		Score float64
	}
	scoredItems := make([]scored, 0, len(result.Items))
	for _, skill := range result.Items {
		score := semanticScore(queryTokens, skill)
		if score <= 0 {
			continue
		}
		scoredItems = append(scoredItems, scored{Skill: skill, Score: score})
	}
	sort.Slice(scoredItems, func(i, j int) bool {
		if scoredItems[i].Score == scoredItems[j].Score {
			if scoredItems[i].Skill.StarCount == scoredItems[j].Skill.StarCount {
				return scoredItems[i].Skill.UpdatedAt.After(scoredItems[j].Skill.UpdatedAt)
			}
			return scoredItems[i].Skill.StarCount > scoredItems[j].Skill.StarCount
		}
		return scoredItems[i].Score > scoredItems[j].Score
	})

	if len(scoredItems) == 0 {
		return []models.Skill{}, nil
	}
	if len(scoredItems) > limit {
		scoredItems = scoredItems[:limit]
	}
	out := make([]models.Skill, 0, len(scoredItems))
	for _, item := range scoredItems {
		out = append(out, item.Skill)
	}
	return out, nil
}

func semanticScore(queryTokens map[string]float64, skill models.Skill) float64 {
	text := strings.ToLower(strings.Join([]string{
		skill.Name,
		skill.Description,
		skill.Content,
		skill.CategorySlug,
		skill.SubcategorySlug,
	}, " "))
	for _, tag := range skill.Tags {
		text += " " + strings.ToLower(tag.Name)
	}
	targetTokens := tokenizeForSemantic(text)
	if len(targetTokens) == 0 {
		return 0
	}

	var intersection float64
	var queryNorm float64
	var targetNorm float64
	for token, qWeight := range queryTokens {
		queryNorm += qWeight * qWeight
		tWeight := targetTokens[token]
		intersection += qWeight * tWeight
	}
	for _, tWeight := range targetTokens {
		targetNorm += tWeight * tWeight
	}
	if queryNorm == 0 || targetNorm == 0 {
		return 0
	}
	score := intersection / (math.Sqrt(queryNorm) * math.Sqrt(targetNorm))
	if strings.Contains(strings.ToLower(skill.Name), firstQueryToken(queryTokens)) {
		score += 0.12
	}
	return score
}

func tokenizeForSemantic(text string) map[string]float64 {
	tokens := strings.FieldsFunc(strings.ToLower(text), func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})
	weights := make(map[string]float64)
	for _, token := range tokens {
		token = strings.TrimSpace(token)
		if len(token) < 2 {
			continue
		}
		weights[token] += 1
	}
	return weights
}

func firstQueryToken(weights map[string]float64) string {
	var (
		bestToken string
		bestScore float64
	)
	for token, score := range weights {
		if score > bestScore {
			bestToken = token
			bestScore = score
		}
	}
	return bestToken
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
