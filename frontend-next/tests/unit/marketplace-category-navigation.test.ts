import { describe, expect, it } from "vitest";

import { buildMarketplaceCategoryNavigation } from "@/src/features/public/marketplace/marketplaceCategoryNavigation";
import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";

describe("marketplace category navigation", () => {
  it("orders categories by count and name for shared rail rendering", () => {
    const payload = buildPublicMarketplaceFallback();
    const navigation = buildMarketplaceCategoryNavigation(payload.categories);

    expect(navigation[0]).toEqual(
      expect.objectContaining({
        slug: "programming-development",
        count: 7
      })
    );
    expect(navigation.map((item) => item.count)).toEqual([...navigation.map((item) => item.count)].sort((left, right) => right - left));
  });
});
