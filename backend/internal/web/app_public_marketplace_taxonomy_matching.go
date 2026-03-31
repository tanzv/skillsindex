package web

import (
	"strings"
	"unicode"
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
