package web

import (
	"strings"
	"unicode"

	"skillsindex/internal/models"
)

type (
	marketplacePresentationSubcategoryDefinition struct {
		Slug                   string
		LegacyCategorySlugs    []string
		LegacySubcategorySlugs []string
		Keywords               []string
	}

	marketplacePresentationCategoryDefinition struct {
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
		CategorySlug    string
		SubcategorySlug string
	}

	marketplaceCategoryAggregate struct {
		TotalSkills          int64
		VisibleSubcategories map[string]int64
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
	keywords := buildMarketplacePresentationKeywordSet(
		input.RawCategory,
		input.RawSubcategory,
		input.RawLabel,
		input.RawDescription,
		input.Tags,
		input.SourceType,
	)

	for _, category := range publicMarketplaceTaxonomy {
		for _, subcategory := range category.Subcategories {
			if matchesMarketplacePresentationSubcategoryByLegacySlug(subcategory, input) {
				return marketplacePresentationClassification{CategorySlug: category.Slug, SubcategorySlug: subcategory.Slug}
			}
		}
	}

	for _, category := range publicMarketplaceTaxonomy {
		for _, subcategory := range category.Subcategories {
			if matchesMarketplacePresentationSubcategoryByHeuristics(subcategory, input, keywords) {
				return marketplacePresentationClassification{CategorySlug: category.Slug, SubcategorySlug: subcategory.Slug}
			}
		}
	}

	return marketplacePresentationClassification{
		CategorySlug:    "programming-development",
		SubcategorySlug: "coding-agents-ides",
	}
}

func isPresentationMarketplaceCategorySlug(categorySlug string) bool {
	normalizedCategory := normalizeMarketplacePresentationSlug(categorySlug)
	for _, category := range publicMarketplaceTaxonomy {
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
			classification := resolveMarketplacePresentationClassification(marketplacePresentationClassificationInput{
				RawCategory:    skill.CategorySlug,
				RawSubcategory: skill.SubcategorySlug,
				RawLabel:       skill.Name,
				RawDescription: skill.Description,
				Tags:           skillTagNames(skill.Tags),
				SourceType:     string(skill.SourceType),
			})
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

func buildMarketplacePresentationCategoryDetailSummary(
	cards []CategoryCard,
	categoryGroup string,
	matchingSkills int64,
) *apiPublicMarketplaceCategoryDetailSummary {
	normalizedCategoryGroup := normalizeMarketplacePresentationSlug(categoryGroup)
	if normalizedCategoryGroup == "" {
		return nil
	}

	aggregates := make(map[string]*marketplaceCategoryAggregate)
	for _, card := range cards {
		rawSubcategories := card.Subcategories
		if len(rawSubcategories) == 0 {
			rawSubcategories = []SubcategoryCard{{Slug: card.Slug, Name: card.Name, Count: card.Count}}
		}
		for _, subcategory := range rawSubcategories {
			if subcategory.Count <= 0 {
				continue
			}
			classification := resolveMarketplacePresentationClassification(marketplacePresentationClassificationInput{
				RawCategory:    card.Slug,
				RawSubcategory: subcategory.Slug,
				RawLabel:       strings.TrimSpace(card.Name + " " + subcategory.Name),
				RawDescription: strings.TrimSpace(card.Description + " " + subcategory.Name),
			})
			aggregate := aggregates[classification.CategorySlug]
			if aggregate == nil {
				aggregate = &marketplaceCategoryAggregate{VisibleSubcategories: make(map[string]int64)}
				aggregates[classification.CategorySlug] = aggregate
			}
			aggregate.TotalSkills += subcategory.Count
			aggregate.VisibleSubcategories[classification.SubcategorySlug] += subcategory.Count
		}
	}

	aggregate := aggregates[normalizedCategoryGroup]
	if aggregate == nil {
		return &apiPublicMarketplaceCategoryDetailSummary{
			CategorySlug:     normalizedCategoryGroup,
			TotalSkills:      0,
			MatchingSkills:   matchingSkills,
			SubcategoryCount: 0,
		}
	}

	visibleSubcategoryCount := 0
	for _, count := range aggregate.VisibleSubcategories {
		if count > 0 {
			visibleSubcategoryCount++
		}
	}

	return &apiPublicMarketplaceCategoryDetailSummary{
		CategorySlug:     normalizedCategoryGroup,
		TotalSkills:      aggregate.TotalSkills,
		MatchingSkills:   matchingSkills,
		SubcategoryCount: visibleSubcategoryCount,
	}
}
