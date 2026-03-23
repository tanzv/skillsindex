import type { MarketplaceSkill, PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

export interface ComparedSkills {
  leftSkill: MarketplaceSkill | null;
  rightSkill: MarketplaceSkill | null;
}

export function resolveComparedSkillsFromItems(
  items: MarketplaceSkill[],
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

  const fallbackLeft = items.find((item) => item.id === leftSkillId) || items[0] || null;
  const fallbackRight = items.find((item) => item.id === rightSkillId) || items.find((item) => item.id !== fallbackLeft?.id) || null;

  return {
    leftSkill: fallbackLeft,
    rightSkill: fallbackRight
  };
}

export function resolveComparedSkills(
  marketplace: PublicMarketplaceResponse,
  comparePayload: PublicSkillCompareResponse | null,
  leftSkillId: number,
  rightSkillId: number
): ComparedSkills {
  return resolveComparedSkillsFromItems(marketplace.items, comparePayload, leftSkillId, rightSkillId);
}
