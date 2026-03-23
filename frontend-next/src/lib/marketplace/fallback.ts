import type { MarketplaceSkill, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { filterMarketplaceItems } from "./itemFilter";
import {
  buildMarketplacePresentationPayload,
  buildRawMarketplaceCategoriesFromItems
} from "./taxonomy";
import { fallbackSkills } from "./fallbackCatalog";

function buildTopTags(items: MarketplaceSkill[]): Array<{ name: string; count: number }> {
  const counter = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counter.set(tag, (counter.get(tag) || 0) + 1);
    }
  }

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

export function buildPublicMarketplaceFallback(
  searchParams?: Record<string, string | string[] | undefined>
): PublicMarketplaceResponse {
  const activeCategory =
    typeof searchParams?.category_group === "string"
      ? searchParams.category_group
      : typeof searchParams?.category === "string"
        ? searchParams.category
        : "";
  const activeSubcategory =
    typeof searchParams?.subcategory_group === "string"
      ? searchParams.subcategory_group
      : typeof searchParams?.subcategory === "string"
        ? searchParams.subcategory
        : "";
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";
  const semanticQuery = typeof searchParams?.tags === "string" ? searchParams.tags : "";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "relevance";

  const items = filterMarketplaceItems(fallbackSkills, {
    activeCategory,
    activeSubcategory,
    query,
    semanticQuery,
    sort
  });
  const rawCategories = buildRawMarketplaceCategoriesFromItems(fallbackSkills);
  const payload = buildMarketplacePresentationPayload({
    filters: Object.fromEntries(
      Object.entries(searchParams || {}).flatMap(([key, value]) => {
        if (typeof value === "string" && value.trim()) {
          return [[key, value]];
        }
        return [];
      })
    ),
    stats: {
      total_skills: fallbackSkills.length,
      matching_skills: items.length
    },
    pagination: {
      page: 1,
      page_size: items.length || fallbackSkills.length,
      total_items: items.length,
      total_pages: 1,
      prev_page: 0,
      next_page: 0
    },
    categories: rawCategories,
    top_tags: buildTopTags(items),
    items,
    summary: undefined,
    session_user: null,
    can_access_dashboard: false
  });

  const categorySummary = payload.categories.find((category) => category.slug === activeCategory) || null;

  return {
    ...payload,
    summary: {
      landing: {
        total_skills: payload.stats.total_skills,
        category_count: payload.categories.filter((category) => category.count > 0).length,
        top_tag_count: payload.top_tags.length,
        featured_skill_count: Math.min(payload.stats.total_skills, 3),
        latest_skill_count: Math.min(payload.stats.total_skills, 6)
      },
      category_hub: {
        total_categories: payload.categories.filter((category) => category.count > 0).length,
        total_skills: payload.stats.total_skills,
        top_tag_count: payload.top_tags.length,
        spotlight_category_count: payload.categories.filter((category) => category.count > 0).length
      },
      category_detail: activeCategory
        ? {
            category_slug: activeCategory,
            total_skills: categorySummary?.count || 0,
            matching_skills: payload.stats.matching_skills,
            subcategory_count: categorySummary?.subcategories.filter((subcategory) => subcategory.count > 0).length || 0
          }
        : null
    }
  };
}

export { fallbackSkills, resolvePublicMarketplaceFallbackSkill } from "./fallbackCatalog";
