package web

import "strings"

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
