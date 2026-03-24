package web

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"skillsindex/internal/catalog"
	"skillsindex/internal/services"
)

type marketplaceSubcategoryCatalogSetting struct {
	Slug      string `json:"slug"`
	Name      string `json:"name"`
	Enabled   bool   `json:"enabled"`
	SortOrder int    `json:"sort_order"`
}

type marketplaceCategoryCatalogSetting struct {
	Slug          string                                 `json:"slug"`
	Name          string                                 `json:"name"`
	Description   string                                 `json:"description"`
	Enabled       bool                                   `json:"enabled"`
	SortOrder     int                                    `json:"sort_order"`
	Subcategories []marketplaceSubcategoryCatalogSetting `json:"subcategories"`
}

type marketplaceCategoryCatalogPayload struct {
	Items []marketplaceCategoryCatalogSetting `json:"items"`
}

func defaultMarketplaceCategoryCatalog() []marketplaceCategoryCatalogSetting {
	defaults := catalog.Categories()
	items := make([]marketplaceCategoryCatalogSetting, 0, len(defaults))
	for categoryIndex, item := range defaults {
		subcategories := make([]marketplaceSubcategoryCatalogSetting, 0, len(item.Subcategories))
		for subcategoryIndex, subcategory := range item.Subcategories {
			subcategories = append(subcategories, marketplaceSubcategoryCatalogSetting{
				Slug:      subcategory.Slug,
				Name:      subcategory.Name,
				Enabled:   true,
				SortOrder: defaultCatalogSortOrder(subcategoryIndex),
			})
		}
		items = append(items, marketplaceCategoryCatalogSetting{
			Slug:          item.Slug,
			Name:          item.Name,
			Description:   item.Description,
			Enabled:       true,
			SortOrder:     defaultCatalogSortOrder(categoryIndex),
			Subcategories: subcategories,
		})
	}
	return items
}

func defaultCatalogSortOrder(index int) int {
	return (index + 1) * 10
}

func normalizeMarketplaceCatalogSortOrder(raw int, index int) int {
	if raw > 0 {
		return raw
	}
	return defaultCatalogSortOrder(index)
}

func normalizeMarketplaceCategoryCatalog(items []marketplaceCategoryCatalogSetting) ([]marketplaceCategoryCatalogSetting, error) {
	if len(items) == 0 {
		return nil, fmt.Errorf("at least one category is required")
	}

	normalized := make([]marketplaceCategoryCatalogSetting, 0, len(items))
	categorySlugs := make(map[string]struct{}, len(items))
	subcategorySlugs := make(map[string]struct{})

	for categoryIndex, item := range items {
		slug := strings.TrimSpace(item.Slug)
		name := strings.TrimSpace(item.Name)
		description := strings.TrimSpace(item.Description)
		if slug == "" {
			return nil, fmt.Errorf("category slug is required")
		}
		if name == "" {
			return nil, fmt.Errorf("category name is required for %s", slug)
		}
		if _, exists := categorySlugs[slug]; exists {
			return nil, fmt.Errorf("duplicate category slug: %s", slug)
		}
		categorySlugs[slug] = struct{}{}

		subcategories := make([]marketplaceSubcategoryCatalogSetting, 0, len(item.Subcategories))
		for subcategoryIndex, subcategory := range item.Subcategories {
			subSlug := strings.TrimSpace(subcategory.Slug)
			subName := strings.TrimSpace(subcategory.Name)
			if subSlug == "" {
				return nil, fmt.Errorf("subcategory slug is required for category %s", slug)
			}
			if subName == "" {
				return nil, fmt.Errorf("subcategory name is required for %s/%s", slug, subSlug)
			}
			if _, exists := subcategorySlugs[subSlug]; exists {
				return nil, fmt.Errorf("duplicate subcategory slug: %s", subSlug)
			}
			subcategorySlugs[subSlug] = struct{}{}
			subcategories = append(subcategories, marketplaceSubcategoryCatalogSetting{
				Slug:      subSlug,
				Name:      subName,
				Enabled:   subcategory.Enabled,
				SortOrder: normalizeMarketplaceCatalogSortOrder(subcategory.SortOrder, subcategoryIndex),
			})
		}

		sort.SliceStable(subcategories, func(left int, right int) bool {
			if subcategories[left].SortOrder != subcategories[right].SortOrder {
				return subcategories[left].SortOrder < subcategories[right].SortOrder
			}
			return subcategories[left].Name < subcategories[right].Name
		})

		normalized = append(normalized, marketplaceCategoryCatalogSetting{
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

func (a *App) loadMarketplaceCategoryCatalog(ctx context.Context) ([]marketplaceCategoryCatalogSetting, error) {
	defaultCatalog := defaultMarketplaceCategoryCatalog()
	if a.settingsService == nil {
		return defaultCatalog, nil
	}

	rawValue, err := a.settingsService.Get(ctx, services.SettingMarketplaceCategoryCatalog, "")
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(rawValue) == "" {
		return defaultCatalog, nil
	}

	var payload marketplaceCategoryCatalogPayload
	if err := json.Unmarshal([]byte(rawValue), &payload); err != nil {
		return defaultCatalog, nil
	}

	normalized, err := normalizeMarketplaceCategoryCatalog(payload.Items)
	if err != nil {
		return defaultCatalog, nil
	}
	return normalized, nil
}

func (a *App) saveMarketplaceCategoryCatalog(ctx context.Context, items []marketplaceCategoryCatalogSetting) error {
	if a.settingsService == nil {
		return fmt.Errorf("settings service unavailable")
	}

	normalized, err := normalizeMarketplaceCategoryCatalog(items)
	if err != nil {
		return err
	}

	payload := marketplaceCategoryCatalogPayload{Items: normalized}
	encoded, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to encode marketplace category catalog: %w", err)
	}

	if err := a.settingsService.Set(ctx, services.SettingMarketplaceCategoryCatalog, string(encoded)); err != nil {
		return err
	}
	return nil
}

func filterEnabledMarketplaceCategoryCatalog(items []marketplaceCategoryCatalogSetting) []marketplaceCategoryCatalogSetting {
	filtered := make([]marketplaceCategoryCatalogSetting, 0, len(items))
	for _, item := range items {
		if !item.Enabled {
			continue
		}
		subcategories := make([]marketplaceSubcategoryCatalogSetting, 0, len(item.Subcategories))
		for _, subcategory := range item.Subcategories {
			if !subcategory.Enabled {
				continue
			}
			subcategories = append(subcategories, subcategory)
		}
		filtered = append(filtered, marketplaceCategoryCatalogSetting{
			Slug:          item.Slug,
			Name:          item.Name,
			Description:   item.Description,
			Enabled:       item.Enabled,
			SortOrder:     item.SortOrder,
			Subcategories: subcategories,
		})
	}
	return filtered
}

func (a *App) marketplaceCatalogCategories(ctx context.Context) []catalog.Category {
	items, err := a.loadMarketplaceCategoryCatalog(ctx)
	if err != nil {
		return catalog.Categories()
	}
	visibleItems := filterEnabledMarketplaceCategoryCatalog(items)
	if len(visibleItems) == 0 {
		return catalog.Categories()
	}

	categories := make([]catalog.Category, 0, len(visibleItems))
	for _, item := range visibleItems {
		subcategories := make([]catalog.Subcategory, 0, len(item.Subcategories))
		for _, subcategory := range item.Subcategories {
			subcategories = append(subcategories, catalog.Subcategory{
				Slug: subcategory.Slug,
				Name: subcategory.Name,
			})
		}
		categories = append(categories, catalog.Category{
			Slug:          item.Slug,
			Name:          item.Name,
			Description:   item.Description,
			Subcategories: subcategories,
		})
	}
	return categories
}

func (a *App) findMarketplaceCategory(ctx context.Context, slug string) (marketplaceCategoryCatalogSetting, bool) {
	items, err := a.loadMarketplaceCategoryCatalog(ctx)
	if err != nil {
		return marketplaceCategoryCatalogSetting{}, false
	}
	for _, item := range filterEnabledMarketplaceCategoryCatalog(items) {
		if item.Slug == strings.TrimSpace(slug) {
			return item, true
		}
	}
	return marketplaceCategoryCatalogSetting{}, false
}

func (a *App) resolveCategorySelection(
	ctx context.Context,
	categorySlug string,
	subcategorySlug string,
	fallbackCategory string,
	fallbackSubcategory string,
) (string, string) {
	category, ok := a.findMarketplaceCategory(ctx, categorySlug)
	if !ok {
		return fallbackCategory, fallbackSubcategory
	}
	if len(category.Subcategories) == 0 {
		return category.Slug, ""
	}

	cleanSubcategory := strings.TrimSpace(subcategorySlug)
	if cleanSubcategory == "" {
		return category.Slug, category.Subcategories[0].Slug
	}
	for _, subcategory := range category.Subcategories {
		if subcategory.Slug == cleanSubcategory {
			return category.Slug, subcategory.Slug
		}
	}
	return category.Slug, category.Subcategories[0].Slug
}
