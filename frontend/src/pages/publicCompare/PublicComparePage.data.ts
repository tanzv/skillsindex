import type { MarketplaceSkill, PublicMarketplaceResponse, PublicSkillCompareResponse } from "../../lib/api";

interface CompareQueryStateLike {
  left: number;
  right: number;
}

export function resolveComparedSkills(
  payload: PublicMarketplaceResponse | null,
  comparePayload: PublicSkillCompareResponse | null,
  queryState: CompareQueryStateLike
): {
  leftSkill: MarketplaceSkill | null;
  rightSkill: MarketplaceSkill | null;
} {
  if (comparePayload && queryState.left > 0 && queryState.right > 0) {
    return {
      leftSkill: comparePayload.left_skill,
      rightSkill: comparePayload.right_skill
    };
  }

  if (queryState.left > 0 && queryState.right > 0) {
    return {
      leftSkill: null,
      rightSkill: null
    };
  }

  const items = payload?.items || [];
  const fallbackLeftID = items[0]?.id || 0;
  const fallbackRightID = items[1]?.id || items[0]?.id || 0;
  const leftID = queryState.left || fallbackLeftID;
  const rightID = queryState.right || (leftID === fallbackRightID ? items[2]?.id || fallbackRightID : fallbackRightID);

  const leftSkill = items.find((item) => item.id === leftID) || items[0] || null;
  const rightSkill =
    items.find((item) => item.id === rightID) ||
    items.find((item) => item.id !== leftSkill?.id) ||
    leftSkill ||
    null;

  return {
    leftSkill,
    rightSkill
  };
}
