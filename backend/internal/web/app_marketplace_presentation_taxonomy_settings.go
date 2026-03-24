package web

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"skillsindex/internal/services"
)

type marketplacePresentationSubcategorySetting struct {
	Slug                   string   `json:"slug"`
	Name                   string   `json:"name"`
	Enabled                bool     `json:"enabled"`
	SortOrder              int      `json:"sort_order"`
	LegacyCategorySlugs    []string `json:"legacy_category_slugs"`
	LegacySubcategorySlugs []string `json:"legacy_subcategory_slugs"`
	Keywords               []string `json:"keywords"`
}

type marketplacePresentationCategorySetting struct {
	Slug          string                                      `json:"slug"`
	Name          string                                      `json:"name"`
	Description   string                                      `json:"description"`
	Enabled       bool                                        `json:"enabled"`
	SortOrder     int                                         `json:"sort_order"`
	Subcategories []marketplacePresentationSubcategorySetting `json:"subcategories"`
}

type marketplacePresentationTaxonomyPayload struct {
	Items []marketplacePresentationCategorySetting `json:"items"`
}

func defaultMarketplacePresentationTaxonomySettings() []marketplacePresentationCategorySetting {
	items := make([]marketplacePresentationCategorySetting, 0, len(publicMarketplaceTaxonomy))
	for categoryIndex, category := range publicMarketplaceTaxonomy {
		subcategories := make([]marketplacePresentationSubcategorySetting, 0, len(category.Subcategories))
		for subcategoryIndex, subcategory := range category.Subcategories {
			subcategories = append(subcategories, marketplacePresentationSubcategorySetting{
				Slug:                   subcategory.Slug,
				Name:                   subcategory.Name,
				Enabled:                true,
				SortOrder:              defaultCatalogSortOrder(subcategoryIndex),
				LegacyCategorySlugs:    append([]string{}, subcategory.LegacyCategorySlugs...),
				LegacySubcategorySlugs: append([]string{}, subcategory.LegacySubcategorySlugs...),
				Keywords:               append([]string{}, subcategory.Keywords...),
			})
		}

		items = append(items, marketplacePresentationCategorySetting{
			Slug:          category.Slug,
			Name:          category.Name,
			Description:   category.Description,
			Enabled:       true,
			SortOrder:     defaultCatalogSortOrder(categoryIndex),
			Subcategories: subcategories,
		})
	}

	return items
}

func normalizeMarketplacePresentationList(values []string) []string {
	normalized := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))

	for _, value := range values {
		cleanValue := strings.TrimSpace(value)
		if cleanValue == "" {
			continue
		}
		normalizedKey := strings.ToLower(cleanValue)
		if _, exists := seen[normalizedKey]; exists {
			continue
		}
		seen[normalizedKey] = struct{}{}
		normalized = append(normalized, cleanValue)
	}

	return normalized
}

func normalizeMarketplacePresentationTaxonomy(items []marketplacePresentationCategorySetting) ([]marketplacePresentationCategorySetting, error) {
	if len(items) == 0 {
		return nil, fmt.Errorf("at least one presentation category is required")
	}

	normalized := make([]marketplacePresentationCategorySetting, 0, len(items))
	categorySlugs := make(map[string]struct{}, len(items))
	subcategorySlugs := make(map[string]struct{})

	for categoryIndex, item := range items {
		slug := strings.TrimSpace(item.Slug)
		name := strings.TrimSpace(item.Name)
		description := strings.TrimSpace(item.Description)
		if slug == "" {
			return nil, fmt.Errorf("presentation category slug is required")
		}
		if name == "" {
			return nil, fmt.Errorf("presentation category name is required for %s", slug)
		}
		if _, exists := categorySlugs[slug]; exists {
			return nil, fmt.Errorf("duplicate presentation category slug: %s", slug)
		}
		categorySlugs[slug] = struct{}{}
		if len(item.Subcategories) == 0 {
			return nil, fmt.Errorf("at least one presentation subcategory is required for %s", slug)
		}

		subcategories := make([]marketplacePresentationSubcategorySetting, 0, len(item.Subcategories))
		for subcategoryIndex, subcategory := range item.Subcategories {
			subSlug := strings.TrimSpace(subcategory.Slug)
			subName := strings.TrimSpace(subcategory.Name)
			if subSlug == "" {
				return nil, fmt.Errorf("presentation subcategory slug is required for %s", slug)
			}
			if subName == "" {
				return nil, fmt.Errorf("presentation subcategory name is required for %s/%s", slug, subSlug)
			}
			if _, exists := subcategorySlugs[subSlug]; exists {
				return nil, fmt.Errorf("duplicate presentation subcategory slug: %s", subSlug)
			}
			subcategorySlugs[subSlug] = struct{}{}

			subcategories = append(subcategories, marketplacePresentationSubcategorySetting{
				Slug:                   subSlug,
				Name:                   subName,
				Enabled:                subcategory.Enabled,
				SortOrder:              normalizeMarketplaceCatalogSortOrder(subcategory.SortOrder, subcategoryIndex),
				LegacyCategorySlugs:    normalizeMarketplacePresentationList(subcategory.LegacyCategorySlugs),
				LegacySubcategorySlugs: normalizeMarketplacePresentationList(subcategory.LegacySubcategorySlugs),
				Keywords:               normalizeMarketplacePresentationList(subcategory.Keywords),
			})
		}

		sort.SliceStable(subcategories, func(left int, right int) bool {
			if subcategories[left].SortOrder != subcategories[right].SortOrder {
				return subcategories[left].SortOrder < subcategories[right].SortOrder
			}
			return subcategories[left].Name < subcategories[right].Name
		})

		normalized = append(normalized, marketplacePresentationCategorySetting{
			Slug:          slug,
			Name:          name,
			Description:   description,
			Enabled:       item.Enabled,
			SortOrder:     normalizeMarketplaceCatalogSortOrder(item.SortOrder, categoryIndex),
			Subcategories: subcategories,
		})
	}

	sort.SliceStable(normalized, func(left int, right int) bool {
		if normalized[left].SortOrder != normalized[right].SortOrder {
			return normalized[left].SortOrder < normalized[right].SortOrder
		}
		return normalized[left].Name < normalized[right].Name
	})

	return normalized, nil
}

func (a *App) loadMarketplacePresentationTaxonomySettings(ctx context.Context) ([]marketplacePresentationCategorySetting, error) {
	defaultSettings := defaultMarketplacePresentationTaxonomySettings()
	if a.settingsService == nil {
		return defaultSettings, nil
	}

	rawValue, err := a.settingsService.Get(ctx, services.SettingMarketplacePresentationTaxonomy, "")
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(rawValue) == "" {
		return defaultSettings, nil
	}

	var payload marketplacePresentationTaxonomyPayload
	if err := json.Unmarshal([]byte(rawValue), &payload); err != nil {
		return defaultSettings, nil
	}

	normalized, err := normalizeMarketplacePresentationTaxonomy(payload.Items)
	if err != nil {
		return defaultSettings, nil
	}

	return normalized, nil
}

func (a *App) saveMarketplacePresentationTaxonomySettings(ctx context.Context, items []marketplacePresentationCategorySetting) error {
	if a.settingsService == nil {
		return fmt.Errorf("settings service unavailable")
	}

	normalized, err := normalizeMarketplacePresentationTaxonomy(items)
	if err != nil {
		return err
	}

	encoded, err := json.Marshal(marketplacePresentationTaxonomyPayload{Items: normalized})
	if err != nil {
		return fmt.Errorf("failed to encode marketplace presentation taxonomy: %w", err)
	}

	return a.settingsService.Set(ctx, services.SettingMarketplacePresentationTaxonomy, string(encoded))
}

func filterEnabledMarketplacePresentationTaxonomySettings(
	items []marketplacePresentationCategorySetting,
) []marketplacePresentationCategoryDefinition {
	filtered := make([]marketplacePresentationCategoryDefinition, 0, len(items))
	for _, item := range items {
		if !item.Enabled {
			continue
		}

		subcategories := make([]marketplacePresentationSubcategoryDefinition, 0, len(item.Subcategories))
		for _, subcategory := range item.Subcategories {
			if !subcategory.Enabled {
				continue
			}
			subcategories = append(subcategories, marketplacePresentationSubcategoryDefinition{
				Name:                   subcategory.Name,
				Slug:                   subcategory.Slug,
				LegacyCategorySlugs:    append([]string{}, subcategory.LegacyCategorySlugs...),
				LegacySubcategorySlugs: append([]string{}, subcategory.LegacySubcategorySlugs...),
				Keywords:               append([]string{}, subcategory.Keywords...),
			})
		}
		if len(subcategories) == 0 {
			continue
		}

		filtered = append(filtered, marketplacePresentationCategoryDefinition{
			Name:          item.Name,
			Description:   item.Description,
			Slug:          item.Slug,
			Subcategories: subcategories,
		})
	}

	return filtered
}

func (a *App) marketplacePresentationTaxonomy(ctx context.Context) []marketplacePresentationCategoryDefinition {
	items, err := a.loadMarketplacePresentationTaxonomySettings(ctx)
	if err != nil {
		return publicMarketplaceTaxonomy
	}

	filtered := filterEnabledMarketplacePresentationTaxonomySettings(items)
	if len(filtered) == 0 {
		return publicMarketplaceTaxonomy
	}

	return filtered
}
