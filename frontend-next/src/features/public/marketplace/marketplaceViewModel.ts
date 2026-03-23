import type {
  MarketplaceCategory,
  MarketplaceSkill,
  MarketplaceSubcategory,
  PublicMarketplaceResponse
} from "@/src/lib/schemas/public";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import {
  type MarketplaceFilterContext,
  filterMarketplaceItems,
  filterMarketplaceItemsByCategory
} from "@/src/lib/marketplace/itemFilter";

import {
  resolveMarketplaceCategorySummary as resolveMarketplaceCategorySummaryFromTaxonomy
} from "./marketplaceTaxonomy";

export interface MarketplaceSummaryMetric {
  label: string;
  value: string;
  detail: string;
}

type MarketplaceSummaryMetricMessages = Pick<
  PublicMarketplaceMessages,
  | "metricCategoryFamilies"
  | "metricDiscoveryWindow"
  | "metricPublicAssets"
  | "metricTopTagPivots"
  | "statCategories"
  | "statMatchingSkills"
  | "statTopTags"
  | "statTotalSkills"
>;

export interface MarketplaceCategoryShelfEntry {
  subcategory: MarketplaceSubcategory;
  previewSkills: MarketplaceSkill[];
}

export interface MarketplaceCategoryShelf {
  anchorId: string;
  category: MarketplaceCategory;
  primarySubcategories: MarketplaceCategoryShelfEntry[];
  featuredSkills: MarketplaceSkill[];
  remainingSubcategoryCount: number;
}

export function formatCompactMarketplaceNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(Math.round(value));
}

export function buildMarketplaceSummaryMetrics(
  payload: PublicMarketplaceResponse,
  messages: MarketplaceSummaryMetricMessages
): MarketplaceSummaryMetric[] {
  return [
    {
      label: messages.statTotalSkills,
      value: formatCompactMarketplaceNumber(payload.stats.total_skills),
      detail: messages.metricPublicAssets
    },
    {
      label: messages.statMatchingSkills,
      value: formatCompactMarketplaceNumber(payload.stats.matching_skills),
      detail: messages.metricDiscoveryWindow
    },
    {
      label: messages.statCategories,
      value: formatCompactMarketplaceNumber(payload.categories.length),
      detail: messages.metricCategoryFamilies
    },
    {
      label: messages.statTopTags,
      value: formatCompactMarketplaceNumber(payload.top_tags.length),
      detail: messages.metricTopTagPivots
    }
  ];
}

export function resolveFeaturedMarketplaceItems(items: MarketplaceSkill[], limit = 4): MarketplaceSkill[] {
  return [...items]
    .sort((left, right) => {
      if (right.star_count !== left.star_count) {
        return right.star_count - left.star_count;
      }

      if (right.quality_score !== left.quality_score) {
        return right.quality_score - left.quality_score;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}

export function resolveLatestMarketplaceItems(
  items: MarketplaceSkill[],
  limit = 6,
  excludedIds: ReadonlySet<number> = new Set<number>()
): MarketplaceSkill[] {
  return [...items]
    .filter((item) => !excludedIds.has(item.id))
    .sort((left, right) => {
      const leftTimestamp = Date.parse(left.updated_at || "");
      const rightTimestamp = Date.parse(right.updated_at || "");

      if (Number.isFinite(rightTimestamp) && Number.isFinite(leftTimestamp) && rightTimestamp !== leftTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      if (right.star_count !== left.star_count) {
        return right.star_count - left.star_count;
      }

      if (right.quality_score !== left.quality_score) {
        return right.quality_score - left.quality_score;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}

export function resolveMarketplaceCategorySummary(
  categories: PublicMarketplaceResponse["categories"],
  activeCategory: string | undefined,
  items: MarketplaceSkill[] = []
) {
  return resolveMarketplaceCategorySummaryFromTaxonomy(categories, activeCategory, items);
}

export function buildMarketplaceCategoryAnchorId(categorySlug: string): string {
  return `category-shelf-${String(categorySlug || "").trim().toLowerCase()}`;
}

interface MarketplaceCategoryShelfOptions {
  maxFeaturedSkills?: number;
  maxSubcategories?: number;
  maxPreviewSkills?: number;
}

export function buildMarketplaceCategoryShelves(
  categories: MarketplaceCategory[],
  items: MarketplaceSkill[],
  options: MarketplaceCategoryShelfOptions = {}
): MarketplaceCategoryShelf[] {
  const maxFeaturedSkills = Math.max(1, options.maxFeaturedSkills ?? 3);
  const maxSubcategories = Math.max(1, options.maxSubcategories ?? 4);
  const maxPreviewSkills = Math.max(1, options.maxPreviewSkills ?? 2);

  return categories.map((category) => {
    const categoryItems = filterMarketplaceItemsByCategory(items, category.slug);
    const primarySubcategories = category.subcategories.slice(0, maxSubcategories).map((subcategory) => ({
      subcategory,
      previewSkills: filterMarketplaceItems(categoryItems, {
        activeCategory: category.slug,
        activeSubcategory: subcategory.slug,
        sort: "stars"
      }).slice(0, maxPreviewSkills)
    }));

    return {
      anchorId: buildMarketplaceCategoryAnchorId(category.slug),
      category,
      primarySubcategories,
      featuredSkills: resolveFeaturedMarketplaceItems(categoryItems, maxFeaturedSkills),
      remainingSubcategoryCount: Math.max(0, category.subcategories.length - primarySubcategories.length)
    };
  });
}

export type { MarketplaceFilterContext };
export { filterMarketplaceItems, filterMarketplaceItemsByCategory };
