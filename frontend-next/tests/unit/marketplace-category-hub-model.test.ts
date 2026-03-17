import { describe, expect, it } from "vitest";

import { buildMarketplaceCategoryHubModel } from "@/src/features/public/marketplace/marketplaceCategoryHubModel";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";

describe("marketplace category hub model", () => {
  it("builds the reference-style category rail, skill sections, and category spotlights", () => {
    const payload = buildPublicMarketplaceFallback();
    const model = buildMarketplaceCategoryHubModel(payload.categories, payload.items);

    expect(model.navigationItems[0]).toEqual(
      expect.objectContaining({
        slug: "programming-development",
        count: 7
      })
    );

    expect(model.skillSections.map((section) => section.slug)).toEqual([
      "most-installed",
      "popular",
      "featured",
      "recently-updated"
    ]);

    expect(model.skillSections[0]?.items).toHaveLength(6);
    expect(model.skillSections[0]?.items[0]?.name).toBe("Next.js UX Audit Agent");
    expect(model.skillSections[3]?.items[0]?.updated_at).toBe("2026-03-12T08:00:00Z");
    expect(model.categorySpotlights[0]).toEqual(
      expect.objectContaining({
        slug: "programming-development",
        previewSkills: expect.arrayContaining([
          expect.objectContaining({
            name: "Next.js UX Audit Agent"
          })
        ])
      })
    );
  });
});
