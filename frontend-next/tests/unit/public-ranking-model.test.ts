import { describe, expect, it } from "vitest";

import {
  mapRankingCategoryLeaderCards,
  sortRankingItems
} from "@/src/features/public/publicRankingModel";

import { buildPublicRankingResponseFixture, publicRankingFixtureUnsortedItems } from "./stubs/publicRankingFixture";

describe("public ranking model", () => {
  it("sorts ranking items deterministically by stars and quality", () => {
    expect(sortRankingItems(publicRankingFixtureUnsortedItems, "stars").map((item) => item.id)).toEqual([101, 104, 105, 102, 103, 111]);
    expect(sortRankingItems(publicRankingFixtureUnsortedItems, "quality").map((item) => item.id)).toEqual([101, 104, 111, 102, 103, 105]);
  });

  it("maps ranking category leader cards from backend ranking payloads", () => {
    const payload = buildPublicRankingResponseFixture("stars");
    const leaderCards = mapRankingCategoryLeaderCards(payload.category_leaders);

    expect(payload.summary.total_compared).toBe(6);
    expect(payload.summary.top_stars).toBe(214);
    expect(payload.summary.average_quality).toBe(9.3);
    expect(payload.highlights).toHaveLength(3);
    expect(payload.list_items).toHaveLength(3);
    expect(leaderCards[0]).toEqual(
      expect.objectContaining({
        category: "Programming & Development",
        count: 4,
        averageQuality: 9.3,
        leadingSkillName: "Next.js UX Audit Agent"
      })
    );
  });
});
