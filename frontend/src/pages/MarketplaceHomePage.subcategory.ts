import type { MarketplaceCategory } from "../lib/api";

export interface MarketplaceSubcategoryOption {
  slug: string;
  name: string;
  count: number;
}

export interface MarketplaceCategorySubcategoryState {
  categoryName: string;
  options: MarketplaceSubcategoryOption[];
}

function normalizeCategorySlug(rawValue: string): string {
  return String(rawValue || "").trim().toLowerCase();
}

function normalizeCount(rawValue: unknown): number {
  const parsedCount = Number(rawValue);
  if (!Number.isFinite(parsedCount) || parsedCount <= 0) {
    return 0;
  }
  return Math.round(parsedCount);
}

export function resolveMarketplaceCategorySubcategoryState(
  categories: MarketplaceCategory[],
  categorySlug: string,
  fallbackCategoryName: string
): MarketplaceCategorySubcategoryState {
  const normalizedCategorySlug = normalizeCategorySlug(categorySlug);
  if (!normalizedCategorySlug || !Array.isArray(categories) || categories.length === 0) {
    return {
      categoryName: String(fallbackCategoryName || "").trim(),
      options: []
    };
  }

  const matchedCategory = categories.find(
    (category) => normalizeCategorySlug(String(category.slug || "")) === normalizedCategorySlug
  );
  if (!matchedCategory) {
    return {
      categoryName: String(fallbackCategoryName || "").trim(),
      options: []
    };
  }

  const options = (Array.isArray(matchedCategory.subcategories) ? matchedCategory.subcategories : [])
    .map((subcategory) => ({
      slug: String(subcategory.slug || "").trim(),
      name: String(subcategory.name || "").trim(),
      count: normalizeCount(subcategory.count)
    }))
    .filter((item) => item.slug && item.name)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 12);

  return {
    categoryName: String(matchedCategory.name || "").trim() || String(fallbackCategoryName || "").trim(),
    options
  };
}
