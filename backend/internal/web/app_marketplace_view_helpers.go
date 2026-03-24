package web

import (
	"context"
	"fmt"
	"math"
	"net/url"
	"sort"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) populateHomeHighlights(ctx context.Context, view *ViewData) {
	result, err := a.skillService.SearchPublicSkills(ctx, services.PublicSearchInput{
		SortBy: "stars",
		Page:   1,
		Limit:  120,
	})
	if err != nil {
		return
	}

	view.TopTags = buildTopTags(result.Items, 12)
	limit := 6
	if len(result.Items) < limit {
		limit = len(result.Items)
	}
	view.FeaturedSkills = result.Items[:limit]
}

func buildTopTags(skills []models.Skill, limit int) []TagCard {
	if limit <= 0 {
		limit = 10
	}
	counts := make(map[string]int)
	for _, skill := range skills {
		seen := make(map[string]struct{}, len(skill.Tags))
		for _, tag := range skill.Tags {
			name := strings.ToLower(strings.TrimSpace(tag.Name))
			if name == "" {
				continue
			}
			if _, ok := seen[name]; ok {
				continue
			}
			seen[name] = struct{}{}
			counts[name]++
		}
	}

	cards := make([]TagCard, 0, len(counts))
	for name, count := range counts {
		cards = append(cards, TagCard{Name: name, Count: count})
	}
	sort.Slice(cards, func(i, j int) bool {
		if cards[i].Count == cards[j].Count {
			return cards[i].Name < cards[j].Name
		}
		return cards[i].Count > cards[j].Count
	})
	if len(cards) > limit {
		return cards[:limit]
	}
	return cards
}

func countSkillBuckets(skills []models.Skill) (publicCount int, privateCount int, syncableCount int) {
	for _, skill := range skills {
		if skill.Visibility == models.VisibilityPublic {
			publicCount++
		} else {
			privateCount++
		}
		if skill.SourceType == models.SourceTypeRepository || skill.SourceType == models.SourceTypeSkillMP {
			syncableCount++
		}
	}
	return publicCount, privateCount, syncableCount
}

func trimGitURL(raw string) string {
	trimmed := strings.TrimSpace(raw)
	trimmed = strings.TrimPrefix(trimmed, "https://")
	trimmed = strings.TrimPrefix(trimmed, "http://")
	trimmed = strings.TrimPrefix(trimmed, "github.com/")
	trimmed = strings.TrimSuffix(trimmed, ".git")
	trimmed = strings.Trim(trimmed, "/")
	if trimmed == "" {
		return "org/repo"
	}
	return trimmed
}

func extractSkillMPIdentifier(raw string) string {
	parsed, err := url.Parse(raw)
	if err != nil {
		return "skill-id"
	}
	segments := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	if len(segments) == 0 || segments[len(segments)-1] == "" {
		return "skill-id"
	}
	return segments[len(segments)-1]
}

func filterSkillsByCategory(skills []models.Skill, category string, subcategory string) []models.Skill {
	category = strings.TrimSpace(category)
	subcategory = strings.TrimSpace(subcategory)
	if category == "" && subcategory == "" {
		return skills
	}
	filtered := make([]models.Skill, 0, len(skills))
	for _, skill := range skills {
		if category != "" && skill.CategorySlug != category {
			continue
		}
		if subcategory != "" && skill.SubcategorySlug != subcategory {
			continue
		}
		filtered = append(filtered, skill)
	}
	return filtered
}

func buildTimelineSVGPoints(points []services.TimelinePoint, width float64, height float64) string {
	if len(points) == 0 {
		return ""
	}
	maxValue := int64(1)
	for _, point := range points {
		if point.Cumulative > maxValue {
			maxValue = point.Cumulative
		}
	}
	xStep := width / math.Max(float64(len(points)-1), 1)
	coords := make([]string, 0, len(points))
	for i, point := range points {
		x := float64(i) * xStep
		ratio := float64(point.Cumulative) / float64(maxValue)
		y := height - (ratio * height)
		coords = append(coords, fmt.Sprintf("%.2f,%.2f", x, y))
	}
	return strings.Join(coords, " ")
}

func resultToAPIItems(items []models.Skill) []apiSkillResponse {
	return resultToAPIItemsWithTaxonomy(items, publicMarketplaceTaxonomy)
}

func resultToAPIItemsWithTaxonomy(
	items []models.Skill,
	taxonomy []marketplacePresentationCategoryDefinition,
) []apiSkillResponse {
	responses := make([]apiSkillResponse, 0, len(items))
	for _, item := range items {
		tagNames := make([]string, 0, len(item.Tags))
		for _, tag := range item.Tags {
			name := strings.TrimSpace(tag.Name)
			if name != "" {
				tagNames = append(tagNames, name)
			}
		}
		classification := resolveMarketplacePresentationClassificationForSkillWithTaxonomy(item, taxonomy)
		responses = append(responses, apiSkillResponse{
			ID:                    item.ID,
			Name:                  item.Name,
			Description:           item.Description,
			Content:               item.Content,
			Category:              item.CategorySlug,
			Subcategory:           item.SubcategorySlug,
			CategoryGroup:         classification.CategorySlug,
			CategoryGroupLabel:    classification.CategoryLabel,
			SubcategoryGroup:      classification.SubcategorySlug,
			SubcategoryGroupLabel: classification.SubcategoryLabel,
			Tags:                  tagNames,
			SourceType:            string(item.SourceType),
			SourceURL:             item.SourceURL,
			StarCount:             item.StarCount,
			QualityScore:          item.QualityScore,
			InstallCommand:        item.InstallCommand,
			UpdatedAt:             item.UpdatedAt,
		})
	}
	return responses
}
