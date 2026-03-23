package web

import (
	"sort"
	"strings"

	"skillsindex/internal/models"
)

func filterMarketplaceSkillsByKeywordAndTags(skills []models.Skill, query string, tags []string) []models.Skill {
	normalizedQuery := strings.ToLower(strings.TrimSpace(query))
	normalizedTags := make([]string, 0, len(tags))
	for _, tag := range tags {
		clean := strings.ToLower(strings.TrimSpace(tag))
		if clean != "" {
			normalizedTags = append(normalizedTags, clean)
		}
	}

	filtered := make([]models.Skill, 0, len(skills))
	for _, skill := range skills {
		if normalizedQuery != "" {
			text := strings.ToLower(strings.Join([]string{skill.Name, skill.Description, skill.Content}, " "))
			if !strings.Contains(text, normalizedQuery) {
				continue
			}
		}
		if len(normalizedTags) > 0 {
			skillTags := make(map[string]struct{}, len(skill.Tags))
			for _, tag := range skill.Tags {
				skillTags[strings.ToLower(strings.TrimSpace(tag.Name))] = struct{}{}
			}
			allMatched := true
			for _, tag := range normalizedTags {
				if _, ok := skillTags[tag]; !ok {
					allMatched = false
					break
				}
			}
			if !allMatched {
				continue
			}
		}
		filtered = append(filtered, skill)
	}
	return filtered
}

func sortMarketplaceSkillsInPlace(skills []models.Skill, sortBy string) {
	switch strings.ToLower(strings.TrimSpace(sortBy)) {
	case "stars":
		sort.SliceStable(skills, func(i, j int) bool {
			if skills[i].StarCount == skills[j].StarCount {
				return skills[i].UpdatedAt.After(skills[j].UpdatedAt)
			}
			return skills[i].StarCount > skills[j].StarCount
		})
	case "quality":
		sort.SliceStable(skills, func(i, j int) bool {
			if skills[i].QualityScore == skills[j].QualityScore {
				return skills[i].UpdatedAt.After(skills[j].UpdatedAt)
			}
			return skills[i].QualityScore > skills[j].QualityScore
		})
	default:
		sort.SliceStable(skills, func(i, j int) bool {
			return skills[i].UpdatedAt.After(skills[j].UpdatedAt)
		})
	}
}

func sliceMarketplaceSkills(skills []models.Skill, page int, pageSize int) []models.Skill {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 24
	}
	start := (page - 1) * pageSize
	if start >= len(skills) {
		return []models.Skill{}
	}
	end := start + pageSize
	if end > len(skills) {
		end = len(skills)
	}
	return skills[start:end]
}

func skillTagNames(tags []models.Tag) []string {
	result := make([]string, 0, len(tags))
	for _, tag := range tags {
		clean := strings.TrimSpace(tag.Name)
		if clean != "" {
			result = append(result, clean)
		}
	}
	return result
}
