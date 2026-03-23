import { resolveMarketplaceSkillCategoryLabel } from "@/src/lib/marketplace/taxonomy";
import type { MarketplaceCompareSelectionItem } from "./marketplace/MarketplaceCompareSelectionList";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";
import { formatCompactMarketplaceNumber } from "./marketplace/marketplaceViewModel";
import { resolveComparedSkillsFromItems } from "./publicCompareModel";
import {
  mapRankingCategoryLeaderCards,
  type RankingCategoryLeader,
  type RankingSortKey
} from "./publicRankingModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import {
  publicRankingsRoute
} from "@/src/lib/routing/publicRouteRegistry";
import type { PublicRankingResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

export interface PublicRankingSortItem {
  key: string;
  href: string;
  label: string;
  isActive: boolean;
}

export interface PublicRankingSummaryChip {
  key: string;
  text: string;
}

export interface PublicRankingCompareFormItem {
  id: number;
  name: string;
}

export interface PublicRankingPageModel {
  displayItems: PublicRankingResponse["ranked_items"];
  skillWarmupTargets: string[];
  summaryChips: PublicRankingSummaryChip[];
  sortItems: PublicRankingSortItem[];
  compareSelections: MarketplaceCompareSelectionItem[];
  compareFormAction: string;
  compareFormItems: PublicRankingCompareFormItem[];
  compareFormLeftValue: string;
  compareFormRightValue: string;
  compareHiddenFields: Array<{ name: string; value: RankingSortKey }>;
  categoryLeaders: RankingCategoryLeader[];
}

export type PublicRankingPageMessages = Pick<
  PublicMarketplaceMessages,
  | "rankingAverageQualityPrefix"
  | "rankingCompareLeftLabel"
  | "rankingCompareRightLabel"
  | "rankingComparedSuffix"
  | "rankingSortByQuality"
  | "rankingSortByStars"
  | "rankingTopStarsPrefix"
  | "shellCategories"
  | "shellHome"
  | "skillQualitySuffix"
  | "skillStarsSuffix"
  | "statTopQuality"
>;

export interface BuildPublicRankingPageModelInput {
  ranking: PublicRankingResponse;
  sortKey: RankingSortKey;
  comparePayload: PublicSkillCompareResponse | null;
  leftSkillId: number;
  rightSkillId: number;
  messages: PublicRankingPageMessages;
  resolvePath: (route: string) => string;
}

function buildRankingHref(
  nextSortKey: RankingSortKey,
  leftSkillId: number,
  rightSkillId: number,
  resolvePath: (route: string) => string
): string {
  const params = new URLSearchParams();

  if (nextSortKey !== "stars") {
    params.set("sort", nextSortKey);
  }

  if (leftSkillId > 0 && rightSkillId > 0 && leftSkillId !== rightSkillId) {
    params.set("left", String(leftSkillId));
    params.set("right", String(rightSkillId));
  }

  const query = params.toString();
  const rankingsPath = resolvePath(publicRankingsRoute);
  return query ? `${rankingsPath}?${query}` : rankingsPath;
}

export function buildPublicRankingPageModel({
  ranking,
  sortKey,
  comparePayload,
  leftSkillId,
  rightSkillId,
  messages,
  resolvePath
}: BuildPublicRankingPageModelInput): PublicRankingPageModel {
  const displayItems = ranking.highlights.concat(ranking.list_items);
  const { leftSkill, rightSkill } = resolveComparedSkillsFromItems(ranking.ranked_items, comparePayload, leftSkillId, rightSkillId);
  const compareLeftId = leftSkill?.id || 0;
  const compareRightId = rightSkill?.id || 0;
  const resolvedFormLeftId = leftSkill?.id || leftSkillId || ranking.ranked_items[0]?.id || 0;
  const resolvedFormRightId =
    (rightSkill?.id && rightSkill.id !== resolvedFormLeftId
      ? rightSkill.id
      : rightSkillId > 0 && rightSkillId !== resolvedFormLeftId
        ? rightSkillId
        : ranking.ranked_items.find((item) => item.id !== resolvedFormLeftId)?.id) || 0;

  return {
    displayItems,
    skillWarmupTargets: buildPublicSkillBatchWarmupTargets(displayItems, resolvePath),
    summaryChips: [
      {
        key: "compared",
        text: `${ranking.summary.total_compared} ${messages.rankingComparedSuffix}`
      },
      {
        key: "top-stars",
        text: `${messages.rankingTopStarsPrefix} ${formatCompactMarketplaceNumber(ranking.summary.top_stars)}`
      },
      {
        key: "top-quality",
        text: `${messages.statTopQuality} ${ranking.summary.top_quality.toFixed(1)}`
      },
      {
        key: "average-quality",
        text: `${messages.rankingAverageQualityPrefix} ${ranking.summary.average_quality.toFixed(1)}`
      }
    ],
    sortItems: [
      {
        key: "ranking-sort-stars",
        href: buildRankingHref("stars", compareLeftId, compareRightId, resolvePath),
        label: messages.rankingSortByStars,
        isActive: sortKey === "stars"
      },
      {
        key: "ranking-sort-quality",
        href: buildRankingHref("quality", compareLeftId, compareRightId, resolvePath),
        label: messages.rankingSortByQuality,
        isActive: sortKey === "quality"
      }
    ],
    compareSelections: [leftSkill, rightSkill].flatMap((skill, index) =>
      skill
        ? [
            {
              key: `${skill.id}-${index}`,
              label: index === 0 ? messages.rankingCompareLeftLabel : messages.rankingCompareRightLabel,
              title: skill.name,
              description: skill.description,
              metrics: [
                resolveMarketplaceSkillCategoryLabel(skill),
                `${skill.star_count} ${messages.skillStarsSuffix}`,
                `${skill.quality_score.toFixed(1)} ${messages.skillQualitySuffix}`
              ]
            }
          ]
        : []
    ),
    compareFormAction: resolvePath(publicRankingsRoute),
    compareFormItems: ranking.ranked_items.map((item) => ({ id: item.id, name: item.name })),
    compareFormLeftValue: String(resolvedFormLeftId || ""),
    compareFormRightValue: String(resolvedFormRightId || ""),
    compareHiddenFields: [{ name: "sort", value: sortKey }],
    categoryLeaders: mapRankingCategoryLeaderCards(ranking.category_leaders)
  };
}
