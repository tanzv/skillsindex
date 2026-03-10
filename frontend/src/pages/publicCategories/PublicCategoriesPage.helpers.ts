import type { PublicMarketplaceResponse } from "../../lib/api";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";

export interface CategoryCardViewModel {
  slug: string;
  name: string;
  description: string;
  count: number;
  subcategoryCount: number;
  topSubcategoryTotalCount: number;
  iconPlaceholder: string;
  topSubcategories: Array<{ slug: string; name: string; count: number }>;
}

export interface CategoryFallbackLabels {
  noDescription: string;
  uncategorizedName: string;
  generalSubcategoryName: string;
  iconPlaceholderFallback: string;
}

function createEmptyMarketplacePayload(): PublicMarketplaceResponse {
  return {
    filters: {
      q: "",
      tags: "",
      category: "",
      subcategory: "",
      sort: "recent",
      mode: "keyword"
    },
    stats: {
      total_skills: 0,
      matching_skills: 0
    },
    pagination: {
      page: 1,
      page_size: 24,
      total_items: 0,
      total_pages: 1,
      prev_page: 0,
      next_page: 0
    },
    categories: [],
    top_tags: [],
    items: [],
    session_user: null,
    can_access_dashboard: false
  };
}

function normalizeCount(rawValue: unknown): number {
  const count = Number(rawValue);
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }
  return Math.round(count);
}

function resolveCategoryDescription(description: string, fallbackLabel: string): string {
  const normalized = String(description || "").trim();
  return normalized || fallbackLabel;
}

export function buildCategoryIconPlaceholder(name: string, fallbackLabel = "NA"): string {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return String(fallbackLabel || "NA").trim().slice(0, 2).toUpperCase() || "NA";
  }

  const words = normalizedName.split(/[\s_/\\-]+/).filter(Boolean);
  if (words.length >= 2) {
    const joinedInitials = `${words[0]?.charAt(0) || ""}${words[1]?.charAt(0) || ""}`.trim().toUpperCase();
    if (joinedInitials) {
      return joinedInitials;
    }
  }

  const compactName = normalizedName.replace(/[\s_/\\-]+/g, "");
  return compactName.slice(0, 2).toUpperCase() || "NA";
}

export function resolveCategoriesViewPayload(payload: PublicMarketplaceResponse | null): PublicMarketplaceResponse {
  return payload || createEmptyMarketplacePayload();
}

export function resolveCategoryCardsFromPayload(
  payload: PublicMarketplaceResponse,
  fallbackLabels: CategoryFallbackLabels
): CategoryCardViewModel[] {
  if (!payload || !Array.isArray(payload.categories)) {
    return [];
  }

  return payload.categories.map((category) => {
    const normalizedName = String(category.name || "").trim() || fallbackLabels.uncategorizedName;
    const rawSubcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
    const topSubcategories = rawSubcategories.slice(0, 3).map((subcategory) => ({
      slug: String(subcategory.slug || "").trim(),
      name: String(subcategory.name || "").trim() || fallbackLabels.generalSubcategoryName,
      count: normalizeCount(subcategory.count)
    }));

    return {
      slug: String(category.slug || "").trim(),
      name: normalizedName,
      description: resolveCategoryDescription(category.description, fallbackLabels.noDescription),
      count: normalizeCount(category.count),
      subcategoryCount: rawSubcategories.length,
      topSubcategoryTotalCount: topSubcategories.reduce((total, item) => total + normalizeCount(item.count), 0),
      iconPlaceholder: buildCategoryIconPlaceholder(normalizedName, fallbackLabels.iconPlaceholderFallback),
      topSubcategories
    };
  });
}

export function buildCategoryDetailPath(categorySlug: string): string {
  const normalizedSlug = String(categorySlug || "").trim();
  if (!normalizedSlug) {
    return "/categories";
  }
  const encodedSlug = encodeURIComponent(normalizedSlug);
  const params = new URLSearchParams();
  params.set("category", normalizedSlug);
  params.set("page", "1");
  return `/categories/${encodedSlug}?${params.toString()}`;
}

export function resolveCategoryPublicPath(currentPath: string, categorySlug: string): string {
  const navigator = createPublicPageNavigator(currentPath);
  return navigator.toPublic(buildCategoryDetailPath(categorySlug));
}

export function resolveRankingsPublicPath(currentPath: string): string {
  return createPublicPageNavigator(currentPath).toPublic("/rankings");
}
