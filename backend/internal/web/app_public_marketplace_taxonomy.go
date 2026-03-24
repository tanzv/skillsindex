package web

import (
	"strings"
	"unicode"

	"skillsindex/internal/models"
)

type (
	marketplacePresentationSubcategoryDefinition struct {
		Name                   string
		Slug                   string
		LegacyCategorySlugs    []string
		LegacySubcategorySlugs []string
		Keywords               []string
	}

	marketplacePresentationCategoryDefinition struct {
		Name          string
		Description   string
		Slug          string
		Subcategories []marketplacePresentationSubcategoryDefinition
	}

	marketplacePresentationClassificationInput struct {
		RawCategory    string
		RawSubcategory string
		RawLabel       string
		RawDescription string
		Tags           []string
		SourceType     string
	}

	marketplacePresentationClassification struct {
		CategorySlug        string
		CategoryLabel       string
		CategoryDescription string
		SubcategorySlug     string
		SubcategoryLabel    string
	}
)

func normalizeMarketplacePresentationSlug(value string) string {
	lowered := strings.ToLower(strings.TrimSpace(value))
	if lowered == "" {
		return ""
	}

	var builder strings.Builder
	builder.Grow(len(lowered))
	lastDash := false
	for _, char := range lowered {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') {
			builder.WriteRune(char)
			lastDash = false
			continue
		}
		if !lastDash {
			builder.WriteByte('-')
			lastDash = true
		}
	}
	return strings.Trim(builder.String(), "-")
}

func tokenizeMarketplacePresentationValue(value string) []string {
	return strings.FieldsFunc(strings.ToLower(strings.TrimSpace(value)), func(char rune) bool {
		return !unicode.IsLetter(char) && !unicode.IsDigit(char)
	})
}

func buildMarketplacePresentationKeywordSet(values ...any) map[string]struct{} {
	keywords := make(map[string]struct{})
	for _, value := range values {
		switch typed := value.(type) {
		case []string:
			for _, item := range typed {
				for _, token := range tokenizeMarketplacePresentationValue(item) {
					keywords[token] = struct{}{}
				}
			}
		case string:
			for _, token := range tokenizeMarketplacePresentationValue(typed) {
				keywords[token] = struct{}{}
			}
		}
	}
	return keywords
}

func hasMarketplacePresentationKeywordMatch(keywords map[string]struct{}, candidates []string) bool {
	for _, candidate := range candidates {
		normalizedCandidate := normalizeMarketplacePresentationSlug(candidate)
		if normalizedCandidate != "" {
			if _, ok := keywords[normalizedCandidate]; ok {
				return true
			}
		}

		candidateTokens := tokenizeMarketplacePresentationValue(candidate)
		if len(candidateTokens) == 0 {
			continue
		}
		allMatched := true
		for _, token := range candidateTokens {
			if _, ok := keywords[token]; !ok {
				allMatched = false
				break
			}
		}
		if allMatched {
			return true
		}
	}
	return false
}

func matchesMarketplacePresentationSubcategoryByLegacySlug(
	definition marketplacePresentationSubcategoryDefinition,
	input marketplacePresentationClassificationInput,
) bool {
	normalizedCategory := normalizeMarketplacePresentationSlug(input.RawCategory)
	normalizedSubcategory := normalizeMarketplacePresentationSlug(input.RawSubcategory)

	for _, candidate := range definition.LegacySubcategorySlugs {
		if normalizeMarketplacePresentationSlug(candidate) == normalizedSubcategory && normalizedSubcategory != "" {
			return true
		}
	}
	if normalizedSubcategory != "" {
		return false
	}
	for _, candidate := range definition.LegacyCategorySlugs {
		if normalizeMarketplacePresentationSlug(candidate) == normalizedCategory && normalizedCategory != "" {
			return true
		}
	}
	return false
}

func matchesMarketplacePresentationSubcategoryByHeuristics(
	definition marketplacePresentationSubcategoryDefinition,
	input marketplacePresentationClassificationInput,
	keywords map[string]struct{},
) bool {
	normalizedCategory := normalizeMarketplacePresentationSlug(input.RawCategory)
	normalizedSubcategory := normalizeMarketplacePresentationSlug(input.RawSubcategory)

	for _, candidate := range definition.LegacySubcategorySlugs {
		if normalizeMarketplacePresentationSlug(candidate) == normalizedSubcategory && normalizedSubcategory != "" {
			return true
		}
	}
	for _, candidate := range definition.LegacyCategorySlugs {
		if normalizeMarketplacePresentationSlug(candidate) != normalizedCategory || normalizedCategory == "" {
			continue
		}
		if len(definition.LegacySubcategorySlugs) == 0 || normalizedSubcategory == "" {
			return true
		}
	}
	return hasMarketplacePresentationKeywordMatch(keywords, definition.Keywords)
}

func resolveMarketplacePresentationClassification(input marketplacePresentationClassificationInput) marketplacePresentationClassification {
	return resolveMarketplacePresentationClassificationWithTaxonomy(publicMarketplaceTaxonomy, input)
}

func resolveMarketplacePresentationClassificationWithTaxonomy(
	taxonomy []marketplacePresentationCategoryDefinition,
	input marketplacePresentationClassificationInput,
) marketplacePresentationClassification {
	keywords := buildMarketplacePresentationKeywordSet(
		input.RawCategory,
		input.RawSubcategory,
		input.RawLabel,
		input.RawDescription,
		input.Tags,
		input.SourceType,
	)

	for _, category := range taxonomy {
		for _, subcategory := range category.Subcategories {
			if matchesMarketplacePresentationSubcategoryByLegacySlug(subcategory, input) {
				return marketplacePresentationClassification{
					CategorySlug:        category.Slug,
					CategoryLabel:       category.Name,
					CategoryDescription: category.Description,
					SubcategorySlug:     subcategory.Slug,
					SubcategoryLabel:    subcategory.Name,
				}
			}
		}
	}

	for _, category := range taxonomy {
		for _, subcategory := range category.Subcategories {
			if matchesMarketplacePresentationSubcategoryByHeuristics(subcategory, input, keywords) {
				return marketplacePresentationClassification{
					CategorySlug:        category.Slug,
					CategoryLabel:       category.Name,
					CategoryDescription: category.Description,
					SubcategorySlug:     subcategory.Slug,
					SubcategoryLabel:    subcategory.Name,
				}
			}
		}
	}

	return marketplacePresentationClassification{
		CategorySlug:        "programming-development",
		CategoryLabel:       "Programming & Development",
		CategoryDescription: "Coding workflows, agents, infra, security, and applied software delivery tracks.",
		SubcategorySlug:     "coding-agents-ides",
		SubcategoryLabel:    "Coding Agents & IDEs",
	}
}

func isPresentationMarketplaceCategorySlug(categorySlug string) bool {
	return isPresentationMarketplaceCategorySlugWithTaxonomy(publicMarketplaceTaxonomy, categorySlug)
}

func isPresentationMarketplaceCategorySlugWithTaxonomy(
	taxonomy []marketplacePresentationCategoryDefinition,
	categorySlug string,
) bool {
	normalizedCategory := normalizeMarketplacePresentationSlug(categorySlug)
	for _, category := range taxonomy {
		if category.Slug == normalizedCategory {
			return true
		}
	}
	return false
}

func filterSkillsByMarketplaceSelection(
	skills []models.Skill,
	category string,
	subcategory string,
	categoryGroup string,
	subcategoryGroup string,
) []models.Skill {
	return filterSkillsByMarketplaceSelectionWithTaxonomy(
		skills,
		category,
		subcategory,
		categoryGroup,
		subcategoryGroup,
		publicMarketplaceTaxonomy,
	)
}

func filterSkillsByMarketplaceSelectionWithTaxonomy(
	skills []models.Skill,
	category string,
	subcategory string,
	categoryGroup string,
	subcategoryGroup string,
	taxonomy []marketplacePresentationCategoryDefinition,
) []models.Skill {
	normalizedCategory := strings.TrimSpace(category)
	normalizedSubcategory := strings.TrimSpace(subcategory)
	normalizedCategoryGroup := normalizeMarketplacePresentationSlug(categoryGroup)
	normalizedSubcategoryGroup := normalizeMarketplacePresentationSlug(subcategoryGroup)

	if normalizedCategory == "" && normalizedSubcategory == "" && normalizedCategoryGroup == "" && normalizedSubcategoryGroup == "" {
		return skills
	}

	filtered := make([]models.Skill, 0, len(skills))
	for _, skill := range skills {
		if normalizedCategory != "" && skill.CategorySlug != normalizedCategory {
			continue
		}
		if normalizedSubcategory != "" && skill.SubcategorySlug != normalizedSubcategory {
			continue
		}
		if normalizedCategoryGroup != "" || normalizedSubcategoryGroup != "" {
			classification := resolveMarketplacePresentationClassificationForSkillWithTaxonomy(skill, taxonomy)
			if normalizedCategoryGroup != "" && classification.CategorySlug != normalizedCategoryGroup {
				continue
			}
			if normalizedSubcategoryGroup != "" && classification.SubcategorySlug != normalizedSubcategoryGroup {
				continue
			}
		}
		filtered = append(filtered, skill)
	}
	return filtered
}

func resolveMarketplacePresentationClassificationForSkill(skill models.Skill) marketplacePresentationClassification {
	return resolveMarketplacePresentationClassificationForSkillWithTaxonomy(skill, publicMarketplaceTaxonomy)
}

func resolveMarketplacePresentationClassificationForSkillWithTaxonomy(
	skill models.Skill,
	taxonomy []marketplacePresentationCategoryDefinition,
) marketplacePresentationClassification {
	return resolveMarketplacePresentationClassificationWithTaxonomy(taxonomy, marketplacePresentationClassificationInput{
		RawCategory:    skill.CategorySlug,
		RawSubcategory: skill.SubcategorySlug,
		RawLabel:       skill.Name,
		RawDescription: skill.Description,
		Tags:           skillTagNames(skill.Tags),
		SourceType:     string(skill.SourceType),
	})
}

func buildMarketplacePresentationCategoryCards(cards []CategoryCard) []CategoryCard {
	return buildMarketplacePresentationCategoryCardsWithTaxonomy(cards, publicMarketplaceTaxonomy)
}

func buildMarketplacePresentationCategoryCardsWithTaxonomy(
	cards []CategoryCard,
	taxonomy []marketplacePresentationCategoryDefinition,
) []CategoryCard {
	groupedCategories := make(map[string]*CategoryCard)
	groupedSubcategories := make(map[string]map[string]*SubcategoryCard)

	for _, card := range cards {
		rawSubcategories := card.Subcategories
		if len(rawSubcategories) == 0 {
			rawSubcategories = []SubcategoryCard{{Slug: card.Slug, Name: card.Name, Count: card.Count}}
		}
		for _, subcategory := range rawSubcategories {
			if subcategory.Count <= 0 {
				continue
			}

			classification := resolveMarketplacePresentationClassificationWithTaxonomy(taxonomy, marketplacePresentationClassificationInput{
				RawCategory:    card.Slug,
				RawSubcategory: subcategory.Slug,
				RawLabel:       strings.TrimSpace(card.Name + " " + subcategory.Name),
				RawDescription: strings.TrimSpace(card.Description + " " + subcategory.Name),
			})

			groupedCategory := groupedCategories[classification.CategorySlug]
			if groupedCategory == nil {
				groupedCategory = &CategoryCard{
					Slug:        classification.CategorySlug,
					Name:        classification.CategoryLabel,
					Description: classification.CategoryDescription,
				}
				groupedCategories[classification.CategorySlug] = groupedCategory
			}
			groupedCategory.Count += subcategory.Count

			if groupedSubcategories[classification.CategorySlug] == nil {
				groupedSubcategories[classification.CategorySlug] = make(map[string]*SubcategoryCard)
			}
			groupedSubcategory := groupedSubcategories[classification.CategorySlug][classification.SubcategorySlug]
			if groupedSubcategory == nil {
				groupedSubcategory = &SubcategoryCard{
					Slug: classification.SubcategorySlug,
					Name: classification.SubcategoryLabel,
				}
				groupedSubcategories[classification.CategorySlug][classification.SubcategorySlug] = groupedSubcategory
			}
			groupedSubcategory.Count += subcategory.Count
		}
	}

	result := make([]CategoryCard, 0, len(groupedCategories))
	for _, category := range taxonomy {
		groupedCategory := groupedCategories[category.Slug]
		if groupedCategory == nil || groupedCategory.Count <= 0 {
			continue
		}

		subcategories := make([]SubcategoryCard, 0, len(category.Subcategories))
		for _, subcategory := range category.Subcategories {
			groupedSubcategory := groupedSubcategories[category.Slug][subcategory.Slug]
			if groupedSubcategory == nil || groupedSubcategory.Count <= 0 {
				continue
			}
			subcategories = append(subcategories, *groupedSubcategory)
		}
		groupedCategory.Subcategories = subcategories
		result = append(result, *groupedCategory)
	}

	return result
}

func buildMarketplacePresentationCategoryDetailSummary(
	cards []CategoryCard,
	categoryGroup string,
	matchingSkills int64,
) *apiPublicMarketplaceCategoryDetailSummary {
	return buildMarketplacePresentationCategoryDetailSummaryWithTaxonomy(cards, categoryGroup, matchingSkills, publicMarketplaceTaxonomy)
}

func buildMarketplacePresentationCategoryDetailSummaryWithTaxonomy(
	cards []CategoryCard,
	categoryGroup string,
	matchingSkills int64,
	taxonomy []marketplacePresentationCategoryDefinition,
) *apiPublicMarketplaceCategoryDetailSummary {
	normalizedCategoryGroup := normalizeMarketplacePresentationSlug(categoryGroup)
	if normalizedCategoryGroup == "" {
		return nil
	}

	for _, category := range cards {
		if normalizeMarketplacePresentationSlug(category.Slug) != normalizedCategoryGroup {
			continue
		}

		visibleSubcategoryCount := 0
		for _, subcategory := range category.Subcategories {
			if subcategory.Count > 0 {
				visibleSubcategoryCount++
			}
		}

		return &apiPublicMarketplaceCategoryDetailSummary{
			CategorySlug:     category.Slug,
			TotalSkills:      category.Count,
			MatchingSkills:   matchingSkills,
			SubcategoryCount: visibleSubcategoryCount,
		}
	}

	return &apiPublicMarketplaceCategoryDetailSummary{
		CategorySlug:     normalizedCategoryGroup,
		TotalSkills:      0,
		MatchingSkills:   matchingSkills,
		SubcategoryCount: 0,
	}
}
