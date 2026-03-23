import type {
  MarketplaceSkill,
  PublicRankingCategoryLeader
} from "@/src/lib/schemas/public";
import {
  resolveMarketplaceSkillCategoryLabel
} from "@/src/lib/marketplace/taxonomy";

export type RankingSortKey = "stars" | "quality";

export interface RankingCategoryLeader {
  category: string;
  count: number;
  averageQuality: number;
  leadingSkillName: string;
}

export function sortRankingItems(
  items: MarketplaceSkill[],
  sortKey: RankingSortKey,
): MarketplaceSkill[] {
  return [...items].sort((left, right) => {
    if (sortKey === "quality") {
      return (
        right.quality_score - left.quality_score ||
        right.star_count - left.star_count ||
        right.updated_at.localeCompare(left.updated_at) ||
        right.id - left.id
      );
    }

    return (
      right.star_count - left.star_count ||
      right.quality_score - left.quality_score ||
      right.updated_at.localeCompare(left.updated_at) ||
      right.id - left.id
    );
  });
}

export function mapRankingCategoryLeaderCards(
  leaders: PublicRankingCategoryLeader[],
): RankingCategoryLeader[] {
  return leaders.map((leader) => ({
    category:
      resolveMarketplaceSkillCategoryLabel(leader.leading_skill) ||
      leader.category_slug,
    count: leader.count,
    averageQuality: leader.average_quality,
    leadingSkillName: leader.leading_skill.name,
  }));
}
