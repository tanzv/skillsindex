import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import { buildPublicComparePageModel } from "@/src/features/public/publicComparePageModel";
import type { PublicSkillCompareResponse } from "@/src/lib/schemas/public";

describe("public compare page model", () => {
  it("builds compare selections, detail links, form defaults, and continuation links", () => {
    const marketplace = buildPublicMarketplaceFallback();
    const comparePayload: PublicSkillCompareResponse = {
      left_skill: marketplace.items[0],
      right_skill: marketplace.items[1]
    };

    const model = buildPublicComparePageModel({
      marketplace,
      comparePayload,
      leftSkillId: marketplace.items[0].id,
      rightSkillId: marketplace.items[1].id,
      resolvePath: (route) => `/light${route}`
    });

    expect(model.stageTitle).toBe("Skill Compare");
    expect(model.compareSelections).toHaveLength(2);
    expect(model.selectedSkillLinks).toEqual([
      {
        key: `compare-detail-${marketplace.items[0].id}-0`,
        href: `/light/skills/${marketplace.items[0].id}`,
        label: `Open ${marketplace.items[0].name}`,
        meta: "Skill detail"
      },
      {
        key: `compare-detail-${marketplace.items[1].id}-1`,
        href: `/light/skills/${marketplace.items[1].id}`,
        label: `Open ${marketplace.items[1].name}`,
        meta: "Skill detail"
      }
    ]);
    expect(model.compareFormAction).toBe("/light/compare");
    expect(model.compareFormLeftValue).toBe(String(marketplace.items[0].id));
    expect(model.compareFormRightValue).toBe(String(marketplace.items[1].id));
    expect(model.continueLinks).toEqual([
      {
        key: "compare-rankings",
        href: "/light/rankings",
        label: "Open rankings",
        meta: "Ranking ledger"
      },
      {
        key: "compare-categories",
        href: "/light/categories",
        label: "Browse categories",
        meta: "Category hub"
      },
      {
        key: "compare-results",
        href: "/light/results",
        label: "Open results",
        meta: "Search ledger"
      }
    ]);
  });

  it("falls back to selected ids and marketplace defaults when compare payload is unavailable", () => {
    const marketplace = buildPublicMarketplaceFallback();
    const expectedRightSkill = marketplace.items.find((item) => item.id !== marketplace.items[2].id);

    const model = buildPublicComparePageModel({
      marketplace,
      comparePayload: null,
      leftSkillId: marketplace.items[2].id,
      rightSkillId: 0,
      resolvePath: (route) => route
    });

    expect(model.compareSelections[0]?.title).toBe(marketplace.items[2].name);
    expect(model.compareFormLeftValue).toBe(String(marketplace.items[2].id));
    expect(model.compareFormRightValue).toBe(String(expectedRightSkill?.id || ""));
  });
});
