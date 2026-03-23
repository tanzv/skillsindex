package services

import (
	"context"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// BuildPublicRanking returns backend-owned ranking data for the public rankings route.
func (s *SkillService) BuildPublicRanking(ctx context.Context, input PublicRankingInput) (PublicRankingResult, error) {
	limit := input.Limit
	if limit <= 0 {
		limit = DefaultMarketplaceRankingLimit
	}
	if limit > MaxMarketplaceRankingLimit {
		limit = MaxMarketplaceRankingLimit
	}

	highlightLimit := input.HighlightLimit
	if highlightLimit <= 0 {
		highlightLimit = DefaultMarketplaceRankingHighlightLimit
	}
	if highlightLimit > limit {
		highlightLimit = limit
	}
	if highlightLimit > MaxMarketplaceRankingHighlightLimit {
		highlightLimit = MaxMarketplaceRankingHighlightLimit
	}

	categoryLeaderLimit := input.CategoryLeaderLimit
	if categoryLeaderLimit <= 0 {
		categoryLeaderLimit = DefaultMarketplaceCategoryLeaderLimit
	}
	if categoryLeaderLimit > MaxMarketplaceCategoryLeaderLimit {
		categoryLeaderLimit = MaxMarketplaceCategoryLeaderLimit
	}

	sortBy := strings.TrimSpace(strings.ToLower(input.SortBy))
	switch sortBy {
	case "quality":
		sortBy = "quality"
	default:
		sortBy = DefaultMarketplaceRankingSort
	}

	query := applyMarketplacePublicScope(
		s.db.WithContext(ctx).Model(&models.Skill{}),
	).Preload("Owner").Preload("Tags")

	switch sortBy {
	case "quality":
		query = query.Order("quality_score DESC").Order("star_count DESC")
	default:
		query = query.Order("star_count DESC").Order("quality_score DESC")
	}
	query = query.Order("updated_at DESC").Order("id DESC")

	var rankedItems []models.Skill
	if err := query.Limit(limit).Find(&rankedItems).Error; err != nil {
		return PublicRankingResult{}, fmt.Errorf("failed to query public ranking skills: %w", err)
	}

	highlights := sliceSkills(rankedItems, 0, highlightLimit)
	listItems := sliceSkills(rankedItems, highlightLimit, limit)

	return PublicRankingResult{
		SortBy:          sortBy,
		RankedItems:     rankedItems,
		Highlights:      highlights,
		ListItems:       listItems,
		Summary:         buildPublicRankingSummary(rankedItems),
		CategoryLeaders: buildPublicRankingCategoryLeaders(rankedItems, categoryLeaderLimit),
	}, nil
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

func sliceSkills(items []models.Skill, start int, end int) []models.Skill {
	if start < 0 {
		start = 0
	}
	if start >= len(items) {
		return []models.Skill{}
	}
	if end < start {
		end = start
	}
	if end > len(items) {
		end = len(items)
	}
	return items[start:end]
}

func buildPublicRankingSummary(items []models.Skill) PublicRankingSummary {
	if len(items) == 0 {
		return PublicRankingSummary{}
	}

	totalQuality := 0.0
	topStars := 0
	topQuality := 0.0
	for _, item := range items {
		totalQuality += item.QualityScore
		if item.StarCount > topStars {
			topStars = item.StarCount
		}
		if item.QualityScore > topQuality {
			topQuality = item.QualityScore
		}
	}

	return PublicRankingSummary{
		TotalCompared:  int64(len(items)),
		TopStars:       topStars,
		TopQuality:     roundToOneDecimal(topQuality),
		AverageQuality: roundToOneDecimal(totalQuality / float64(len(items))),
	}
}

func buildPublicRankingCategoryLeaders(items []models.Skill, limit int) []PublicRankingCategoryLeader {
	type bucket struct {
		items []models.Skill
	}

	if limit <= 0 {
		limit = DefaultMarketplaceCategoryLeaderLimit
	}

	buckets := make(map[string]bucket)
	for _, item := range items {
		categorySlug := strings.TrimSpace(item.CategorySlug)
		if categorySlug == "" {
			continue
		}
		current := buckets[categorySlug]
		current.items = append(current.items, item)
		buckets[categorySlug] = current
	}

	leaders := make([]PublicRankingCategoryLeader, 0, len(buckets))
	for categorySlug, current := range buckets {
		if len(current.items) == 0 {
			continue
		}
		totalQuality := 0.0
		for _, item := range current.items {
			totalQuality += item.QualityScore
		}
		leaders = append(leaders, PublicRankingCategoryLeader{
			CategorySlug:   categorySlug,
			Count:          int64(len(current.items)),
			AverageQuality: roundToOneDecimal(totalQuality / float64(len(current.items))),
			LeadingSkill:   current.items[0],
		})
	}

	sort.Slice(leaders, func(i, j int) bool {
		if leaders[i].Count != leaders[j].Count {
			return leaders[i].Count > leaders[j].Count
		}
		if leaders[i].AverageQuality != leaders[j].AverageQuality {
			return leaders[i].AverageQuality > leaders[j].AverageQuality
		}
		if leaders[i].LeadingSkill.StarCount != leaders[j].LeadingSkill.StarCount {
			return leaders[i].LeadingSkill.StarCount > leaders[j].LeadingSkill.StarCount
		}
		return leaders[i].CategorySlug < leaders[j].CategorySlug
	})

	if len(leaders) > limit {
		leaders = leaders[:limit]
	}
	return leaders
}

func roundToOneDecimal(value float64) float64 {
	return math.Round(value*10) / 10
}
