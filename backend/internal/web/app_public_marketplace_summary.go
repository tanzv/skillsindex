package web

import "strings"

type publicMarketplaceSummaryInput struct {
	RawCategoryCards          []CategoryCard
	PresentationCategoryCards []CategoryCard
	PresentationTaxonomy      []marketplacePresentationCategoryDefinition
	CategoryFilter            string
	CategoryGroupFilter       string
	MatchingSkills            int64
	TopTags                   []TagCard
	TotalSkills               int64
}

func buildAPIPublicMarketplaceSummary(input publicMarketplaceSummaryInput) apiPublicMarketplaceSummary {
	visibleCategoryCount := 0
	for _, category := range input.PresentationCategoryCards {
		if category.Count > 0 {
			visibleCategoryCount++
		}
	}

	landingSummary := apiPublicMarketplaceLandingSummary{
		TotalSkills:        input.TotalSkills,
		CategoryCount:      visibleCategoryCount,
		TopTagCount:        len(input.TopTags),
		FeaturedSkillCount: minPositiveInt(int(input.TotalSkills), 3),
		LatestSkillCount:   minPositiveInt(int(input.TotalSkills), 6),
	}

	categoryHubSummary := apiPublicMarketplaceCategoryHubSummary{
		TotalCategories:        visibleCategoryCount,
		TotalSkills:            input.TotalSkills,
		TopTagCount:            len(input.TopTags),
		SpotlightCategoryCount: visibleCategoryCount,
	}

	return apiPublicMarketplaceSummary{
		Landing:     landingSummary,
		CategoryHub: categoryHubSummary,
		CategoryDetail: buildAPIPublicMarketplaceCategoryDetailSummary(
			input.RawCategoryCards,
			input.PresentationCategoryCards,
			input.PresentationTaxonomy,
			input.CategoryFilter,
			input.CategoryGroupFilter,
			input.MatchingSkills,
		),
	}
}

func buildAPIPublicMarketplaceCategoryDetailSummary(
	rawCards []CategoryCard,
	presentationCards []CategoryCard,
	presentationTaxonomy []marketplacePresentationCategoryDefinition,
	categoryFilter string,
	categoryGroupFilter string,
	matchingSkills int64,
) *apiPublicMarketplaceCategoryDetailSummary {
	if normalizedCategoryGroup := strings.TrimSpace(categoryGroupFilter); normalizedCategoryGroup != "" {
		return buildMarketplacePresentationCategoryDetailSummaryWithTaxonomy(
			presentationCards,
			normalizedCategoryGroup,
			matchingSkills,
			presentationTaxonomy,
		)
	}

	normalizedCategory := strings.TrimSpace(categoryFilter)
	if normalizedCategory == "" {
		return nil
	}

	for _, category := range rawCards {
		if category.Slug != normalizedCategory {
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
		CategorySlug:     normalizedCategory,
		TotalSkills:      0,
		MatchingSkills:   matchingSkills,
		SubcategoryCount: 0,
	}
}

func minPositiveInt(value int, maxValue int) int {
	if value <= 0 || maxValue <= 0 {
		return 0
	}
	if value < maxValue {
		return value
	}
	return maxValue
}
