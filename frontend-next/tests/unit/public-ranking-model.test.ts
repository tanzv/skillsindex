import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { buildPublicRankingModel, sortRankingItems } from "@/src/features/public/publicRankingModel";

describe("public ranking model", () => {
  it("sorts fallback skills deterministically by stars and quality", () => {
    const payload = buildPublicMarketplaceFallback();

    expect(sortRankingItems(payload.items, "stars").map((item) => item.id)).toEqual([101, 104, 105, 102, 103, 111, 106, 107, 109, 108, 110, 112]);
    expect(sortRankingItems(payload.items, "quality").map((item) => item.id)).toEqual([101, 104, 111, 102, 103, 105, 106, 107, 108, 109, 110, 112]);
  });

  it("builds ranking highlights, summary metrics, and category leaders", () => {
    const payload = buildPublicMarketplaceFallback();
    const model = buildPublicRankingModel(payload, "stars");

    expect(model.summary.totalCompared).toBe(12);
    expect(model.summary.topStars).toBe(214);
    expect(model.summary.averageQuality).toBe(9);
    expect(model.highlights).toHaveLength(3);
    expect(model.categoryLeaders[0]).toEqual(
      expect.objectContaining({
        category: "Programming & Development",
        count: 7,
        averageQuality: 9.2,
        leadingSkillName: "Next.js UX Audit Agent"
      })
    );
  });
});
