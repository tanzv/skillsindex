import type { MarketplaceSkill, PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

export interface ComparedSkills {
  leftSkill: MarketplaceSkill | null;
  rightSkill: MarketplaceSkill | null;
}

export function resolveComparedSkills(
  marketplace: PublicMarketplaceResponse,
  comparePayload: PublicSkillCompareResponse | null,
  leftSkillId: number,
  rightSkillId: number
): ComparedSkills {
  if (comparePayload) {
    return {
      leftSkill: comparePayload.left_skill,
      rightSkill: comparePayload.right_skill
    };
  }

  const fallbackLeft = marketplace.items.find((item) => item.id === leftSkillId) || marketplace.items[0] || null;
  const fallbackRight =
    marketplace.items.find((item) => item.id === rightSkillId) ||
    marketplace.items.find((item) => item.id !== fallbackLeft?.id) ||
    null;

  return {
    leftSkill: fallbackLeft,
    rightSkill: fallbackRight
  };
}
