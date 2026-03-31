package web

import (
	"net/url"
	"strconv"
	"strings"
)

func baseMarketplaceQueryValues(
	query string,
	tagFilter string,
	sortBy string,
	mode string,
	category string,
	subcategory string,
) url.Values {
	values := make(url.Values)
	if clean := strings.TrimSpace(query); clean != "" {
		values.Set("q", clean)
	}
	if clean := strings.TrimSpace(tagFilter); clean != "" {
		values.Set("tags", clean)
	}
	values.Set("sort", defaultString(strings.TrimSpace(sortBy), "recent"))
	values.Set("mode", defaultString(strings.TrimSpace(mode), "keyword"))
	if clean := strings.TrimSpace(category); clean != "" {
		values.Set("category", clean)
	}
	if clean := strings.TrimSpace(subcategory); clean != "" {
		values.Set("subcategory", clean)
	}
	return values
}

func buildMarketplacePageLink(path string, base url.Values, page int) string {
	values := make(url.Values, len(base)+1)
	for key, input := range base {
		values[key] = append([]string(nil), input...)
	}
	if page > 1 {
		values.Set("page", strconv.Itoa(page))
	} else {
		values.Del("page")
	}
	encoded := values.Encode()
	if encoded == "" {
		return path
	}
	return path + "?" + encoded
}

func normalizeMarketplaceSort(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "stars":
		return "stars"
	case "quality":
		return "quality"
	default:
		return "recent"
	}
}

func normalizeMarketplaceMode(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "ai":
		return "ai"
	default:
		return "keyword"
	}
}

func normalizeMarketplaceScope(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "category_hub":
		return "category_hub"
	case "category_detail":
		return "category_detail"
	default:
		return ""
	}
}

func isUnpaginatedMarketplaceScope(scope string) bool {
	switch normalizeMarketplaceScope(scope) {
	case "category_hub":
		return true
	default:
		return false
	}
}

func buildMarketplaceFilterOptionValues(values ...string) []map[string]string {
	options := make([]map[string]string, 0, len(values))
	for _, value := range values {
		normalizedValue := strings.ToLower(strings.TrimSpace(value))
		if normalizedValue == "" {
			continue
		}
		options = append(options, map[string]string{"value": normalizedValue})
	}
	return options
}

func resolveMarketplaceCategoryFilterOverride(
	categorySlug string,
) (sortOptions []map[string]string, modeOptions []map[string]string, ok bool) {
	switch strings.ToLower(strings.TrimSpace(categorySlug)) {
	case "security", "governance", "compliance":
		return nil, buildMarketplaceFilterOptionValues("keyword"), true
	case "operations", "devops":
		return buildMarketplaceFilterOptionValues("recent", "stars"), nil, true
	case "testing-automation":
		return buildMarketplaceFilterOptionValues("quality", "recent", "stars"), nil, true
	default:
		return nil, nil, false
	}
}

func buildMarketplaceCategoryFilterOverrides(cards []CategoryCard) []map[string]any {
	overrides := make([]map[string]any, 0, len(cards))
	seen := make(map[string]struct{}, len(cards))
	for _, card := range cards {
		cleanSlug := strings.TrimSpace(card.Slug)
		normalizedSlug := strings.ToLower(cleanSlug)
		if normalizedSlug == "" {
			continue
		}
		if _, exists := seen[normalizedSlug]; exists {
			continue
		}
		seen[normalizedSlug] = struct{}{}
		sortOptions, modeOptions, hasOverride := resolveMarketplaceCategoryFilterOverride(normalizedSlug)
		if !hasOverride {
			continue
		}
		override := map[string]any{
			"category_slug": cleanSlug,
		}
		if len(sortOptions) > 0 {
			override["sort"] = sortOptions
		}
		if len(modeOptions) > 0 {
			override["mode"] = modeOptions
		}
		overrides = append(overrides, override)
	}
	return overrides
}

func buildMarketplaceFilterOptions(cards []CategoryCard) map[string]any {
	filterOptions := map[string]any{
		"sort": buildMarketplaceFilterOptionValues("recent", "stars", "quality"),
		"mode": buildMarketplaceFilterOptionValues("keyword", "ai"),
	}
	categoryOverrides := buildMarketplaceCategoryFilterOverrides(cards)
	if len(categoryOverrides) > 0 {
		filterOptions["category_overrides"] = categoryOverrides
	}
	return filterOptions
}

func mapCategoryCardsToAPI(cards []CategoryCard) []apiMarketplaceCategoryResponse {
	result := make([]apiMarketplaceCategoryResponse, 0, len(cards))
	for _, card := range cards {
		subcategories := make([]apiMarketplaceSubcategoryEntry, 0, len(card.Subcategories))
		for _, sub := range card.Subcategories {
			subcategories = append(subcategories, apiMarketplaceSubcategoryEntry(sub))
		}
		result = append(result, apiMarketplaceCategoryResponse{
			Slug:          card.Slug,
			Name:          card.Name,
			Description:   card.Description,
			Count:         card.Count,
			Subcategories: subcategories,
		})
	}
	return result
}
