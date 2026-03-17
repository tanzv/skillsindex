import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { resolveComparedSkills } from "@/src/features/public/publicCompareModel";
import type { PublicSkillCompareResponse } from "@/src/lib/schemas/public";

describe("public compare model", () => {
  it("prefers explicit compare payload when available", () => {
    const marketplace = buildPublicMarketplaceFallback();
    const comparePayload: PublicSkillCompareResponse = {
      left_skill: marketplace.items[1],
      right_skill: marketplace.items[2]
    };

    const compared = resolveComparedSkills(marketplace, comparePayload, 101, 102);

    expect(compared.leftSkill?.id).toBe(102);
    expect(compared.rightSkill?.id).toBe(103);
  });

  it("falls back to marketplace items when compare payload is unavailable", () => {
    const marketplace = buildPublicMarketplaceFallback();
    const compared = resolveComparedSkills(marketplace, null, 103, 101);

    expect(compared.leftSkill?.id).toBe(103);
    expect(compared.rightSkill?.id).toBe(101);
  });
});
