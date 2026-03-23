import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import { buildMarketplaceSkillSearchText, matchesMarketplaceCategorySelection } from "./taxonomy";

export interface MarketplaceFilterContext {
  activeCategory?: string;
  activeSubcategory?: string;
  query?: string;
  semanticQuery?: string;
  sort?: string;
}

function normalizeSearchTerms(rawValue: string | undefined): string[] {
  return String(rawValue || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function filterMarketplaceItems(items: MarketplaceSkill[], context: MarketplaceFilterContext): MarketplaceSkill[] {
  const queryTerms = normalizeSearchTerms(context.query);
  const semanticTerms = normalizeSearchTerms(context.semanticQuery);
  const normalizedSort = String(context.sort || "").trim().toLowerCase();

  const visibleItems = items.filter((item) => {
    if (!matchesMarketplaceCategorySelection(item, context.activeCategory, context.activeSubcategory)) {
      return false;
    }

    const haystack = buildMarketplaceSkillSearchText(item);

    if (queryTerms.length > 0 && !queryTerms.every((term) => haystack.includes(term))) {
      return false;
    }

    if (semanticTerms.length > 0 && !semanticTerms.every((term) => haystack.includes(term))) {
      return false;
    }

    return true;
  });

  if (normalizedSort === "recent" || normalizedSort === "latest") {
    return [...visibleItems].sort((left, right) => Date.parse(right.updated_at || "") - Date.parse(left.updated_at || ""));
  }

  if (normalizedSort === "stars") {
    return [...visibleItems].sort((left, right) => {
      if (right.star_count !== left.star_count) {
        return right.star_count - left.star_count;
      }

      if (right.quality_score !== left.quality_score) {
        return right.quality_score - left.quality_score;
      }

      return left.name.localeCompare(right.name);
    });
  }

  if (normalizedSort === "quality") {
    return [...visibleItems].sort((left, right) => {
      if (right.quality_score !== left.quality_score) {
        return right.quality_score - left.quality_score;
      }

      if (right.star_count !== left.star_count) {
        return right.star_count - left.star_count;
      }

      return left.name.localeCompare(right.name);
    });
  }

  return visibleItems;
}

export function filterMarketplaceItemsByCategory(items: MarketplaceSkill[], activeCategory: string | undefined): MarketplaceSkill[] {
  if (!String(activeCategory || "").trim()) {
    return items;
  }

  return filterMarketplaceItems(items, { activeCategory });
}
