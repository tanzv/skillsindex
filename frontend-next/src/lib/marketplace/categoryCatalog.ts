import type { MarketplaceCategory, MarketplaceSkill } from "@/src/lib/schemas/public";

import { marketplaceTaxonomy, taxonomySubcategoryLookup, type MarketplaceTaxonomyCategoryDefinition } from "./taxonomyDefinitions";
import { humanizeMarketplaceSlug, normalizeMarketplaceSlug } from "./taxonomyText";

export function buildLegacyMarketplaceCategorySummary(items: MarketplaceSkill[], rawCategorySlug: string): MarketplaceCategory | null {
  const normalizedCategory = normalizeMarketplaceSlug(rawCategorySlug);
  if (!normalizedCategory) {
    return null;
  }

  const matchedItems = items.filter((item) => normalizeMarketplaceSlug(item.category) === normalizedCategory);
  if (matchedItems.length === 0) {
    return null;
  }

  const subcategoryCounter = new Map<string, { name: string; count: number }>();

  for (const item of matchedItems) {
    const subcategorySlug = normalizeMarketplaceSlug(item.subcategory) || "general";
    const currentEntry = subcategoryCounter.get(subcategorySlug);

    if (currentEntry) {
      currentEntry.count += 1;
      continue;
    }

    subcategoryCounter.set(subcategorySlug, {
      name: humanizeMarketplaceSlug(item.subcategory, "General"),
      count: 1
    });
  }

  const subcategories = [...subcategoryCounter.entries()]
    .map(([slug, entry]) => ({ slug, name: entry.name, count: entry.count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));

  return {
    slug: normalizedCategory,
    name: humanizeMarketplaceSlug(normalizedCategory),
    description: `Legacy category route for ${humanizeMarketplaceSlug(normalizedCategory)}.`,
    count: matchedItems.length,
    subcategories
  };
}

export function buildMarketplaceTaxonomyCategorySummary(
  definition: MarketplaceTaxonomyCategoryDefinition,
  groupedCategory?: MarketplaceCategory | null
): MarketplaceCategory {
  const groupedSubcategoryCounts = new Map(
    (groupedCategory?.subcategories || []).map((subcategory) => [normalizeMarketplaceSlug(subcategory.slug), subcategory.count] as const)
  );
  const groupedSubcategories = new Map(
    (groupedCategory?.subcategories || []).map((subcategory) => [normalizeMarketplaceSlug(subcategory.slug), subcategory] as const)
  );

  const subcategories = definition.subcategories.map((subcategoryDefinition) => ({
    slug: subcategoryDefinition.slug,
    name: subcategoryDefinition.name,
    count: groupedSubcategoryCounts.get(subcategoryDefinition.slug) || 0
  }));
  const unmatchedSubcategories = [...groupedSubcategories.values()]
    .filter((subcategory) => !taxonomySubcategoryLookup.has(normalizeMarketplaceSlug(subcategory.slug)))
    .map((subcategory) => ({
      slug: normalizeMarketplaceSlug(subcategory.slug),
      name: subcategory.name,
      count: subcategory.count
    }));

  return {
    slug: definition.slug,
    name: definition.name,
    description: groupedCategory?.description || definition.description,
    count: groupedCategory?.count || 0,
    subcategories: [...subcategories, ...unmatchedSubcategories]
  };
}

export function buildMarketplaceCategoryCatalog(categories: MarketplaceCategory[]): MarketplaceCategory[] {
  const groupedCategories = new Map(categories.map((category) => [normalizeMarketplaceSlug(category.slug), category]));

  return marketplaceTaxonomy.map((categoryDefinition) =>
    buildMarketplaceTaxonomyCategorySummary(categoryDefinition, groupedCategories.get(categoryDefinition.slug) || null)
  );
}
