import type { MarketplaceSkill, PublicMarketplaceResponse } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import { createPublicPageNavigator } from "./publicPageNavigation";

export type RankingSortKey = "stars" | "quality";

export interface RankingSummaryMetrics {
  totalCompared: number;
  topStars: number;
  topQuality: number;
  averageQuality: number;
}

export interface RankingSections {
  highlightedItems: MarketplaceSkill[];
  listItems: MarketplaceSkill[];
}

export function sortRankingItems(items: MarketplaceSkill[], sortKey: RankingSortKey): MarketplaceSkill[] {
  const sorted = [...items];
  if (sortKey === "stars") {
    sorted.sort(
      (left, right) =>
        right.star_count - left.star_count || right.quality_score - left.quality_score || right.id - left.id
    );
    return sorted;
  }

  sorted.sort(
    (left, right) =>
      right.quality_score - left.quality_score || right.star_count - left.star_count || right.id - left.id
  );
  return sorted;
}

export function buildRankingCategoriesPath(pathname: string): string {
  return createPublicPageNavigator(pathname).toPublic("/categories");
}

export function buildRankingSkillPath(pathname: string, skillID: number): string {
  return createPublicPageNavigator(pathname).toPublic(`/skills/${skillID}`);
}

export function resolveRankingSourceItems(
  payload: PublicMarketplaceResponse | null,
  fallbackPayload: PublicMarketplaceResponse
): MarketplaceSkill[] {
  if (payload?.items && payload.items.length > 0) {
    return payload.items;
  }
  return fallbackPayload.items;
}

export function buildRankingSummaryMetrics(items: MarketplaceSkill[]): RankingSummaryMetrics {
  if (items.length === 0) {
    return {
      totalCompared: 0,
      topStars: 0,
      topQuality: 0,
      averageQuality: 0
    };
  }

  const topStars = items.reduce((maxValue, item) => Math.max(maxValue, item.star_count), 0);
  const topQualityRaw = items.reduce((maxValue, item) => Math.max(maxValue, item.quality_score), 0);
  const totalQuality = items.reduce((sum, item) => sum + item.quality_score, 0);
  const averageQualityRaw = totalQuality / items.length;

  return {
    totalCompared: items.length,
    topStars,
    topQuality: Number(topQualityRaw.toFixed(1)),
    averageQuality: Number(averageQualityRaw.toFixed(1))
  };
}

export function splitRankingSections(items: MarketplaceSkill[], highlightCount = 3): RankingSections {
  const safeHighlightCount = Math.max(0, Math.min(highlightCount, items.length));
  return {
    highlightedItems: items.slice(0, safeHighlightCount),
    listItems: items.slice(safeHighlightCount)
  };
}

export function formatRankingUpdatedAt(value: string, locale: AppLocale): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "--";
  }
  const localeTag = locale === "zh" ? "zh-CN" : "en-US";
  return parsedDate.toLocaleDateString(localeTag, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export function formatRankingCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(Math.round(value));
}
