import type { MarketplaceSkill, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillCategorySlug } from "./marketplace/marketplaceTaxonomy";

export type RankingSortKey = "stars" | "quality";

export interface RankingSummaryMetrics {
  totalCompared: number;
  topStars: number;
  topQuality: number;
  averageQuality: number;
}

export interface RankingCategoryLeader {
  category: string;
  count: number;
  averageQuality: number;
  leadingSkillName: string;
}

export interface PublicRankingModel {
  rankedItems: MarketplaceSkill[];
  highlights: MarketplaceSkill[];
  listItems: MarketplaceSkill[];
  summary: RankingSummaryMetrics;
  categoryLeaders: RankingCategoryLeader[];
}

export function sortRankingItems(items: MarketplaceSkill[], sortKey: RankingSortKey): MarketplaceSkill[] {
  return [...items].sort((left, right) => {
    if (sortKey === "quality") {
      return right.quality_score - left.quality_score || right.star_count - left.star_count || right.id - left.id;
    }
    return right.star_count - left.star_count || right.quality_score - left.quality_score || right.id - left.id;
  });
}

function buildSummaryMetrics(items: MarketplaceSkill[]): RankingSummaryMetrics {
  if (items.length === 0) {
    return {
      totalCompared: 0,
      topStars: 0,
      topQuality: 0,
      averageQuality: 0
    };
  }

  const totalQuality = items.reduce((sum, item) => sum + item.quality_score, 0);

  return {
    totalCompared: items.length,
    topStars: items.reduce((maxValue, item) => Math.max(maxValue, item.star_count), 0),
    topQuality: Number(items.reduce((maxValue, item) => Math.max(maxValue, item.quality_score), 0).toFixed(1)),
    averageQuality: Number((totalQuality / items.length).toFixed(1))
  };
}

function buildCategoryLeaders(items: MarketplaceSkill[]): RankingCategoryLeader[] {
  const buckets = new Map<string, { label: string; items: MarketplaceSkill[] }>();

  for (const item of items) {
    const categorySlug = resolveMarketplaceSkillCategorySlug(item);
    const currentBucket = buckets.get(categorySlug) || {
      label: resolveMarketplaceSkillCategoryLabel(item),
      items: []
    };
    currentBucket.items.push(item);
    buckets.set(categorySlug, currentBucket);
  }

  return [...buckets.values()]
    .map(({ label, items: categoryItems }) => {
      const leadingSkill = categoryItems[0];
      const averageQuality = categoryItems.reduce((sum, item) => sum + item.quality_score, 0) / categoryItems.length;

      return {
        category: label,
        count: categoryItems.length,
        averageQuality: Number(averageQuality.toFixed(1)),
        leadingSkillName: leadingSkill?.name || "n/a"
      };
    })
    .sort((left, right) => right.count - left.count || right.averageQuality - left.averageQuality || left.category.localeCompare(right.category))
    .slice(0, 5);
}

export function buildPublicRankingModel(
  marketplace: PublicMarketplaceResponse,
  sortKey: RankingSortKey
): PublicRankingModel {
  const rankedItems = sortRankingItems(marketplace.items, sortKey);

  return {
    rankedItems,
    highlights: rankedItems.slice(0, 3),
    listItems: rankedItems.slice(3, 12),
    summary: buildSummaryMetrics(rankedItems),
    categoryLeaders: buildCategoryLeaders(rankedItems)
  };
}
