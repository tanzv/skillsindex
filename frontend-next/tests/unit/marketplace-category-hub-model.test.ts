import { describe, expect, it } from "vitest";

import { buildMarketplaceCategoryHubModel } from "@/src/features/public/marketplace/marketplaceCategoryHubModel";
import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";

describe("marketplace category hub model", () => {
  it("builds the reference-style category rail, skill sections, and category spotlights", () => {
    const payload = buildPublicMarketplaceFallback();
    const model = buildMarketplaceCategoryHubModel(payload.categories, payload.items);

    expect(model.navigationItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "programming-development",
          count: 7
        }),
        expect.objectContaining({
          slug: "design-art",
          count: 0
        })
      ])
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
    expect(model.categorySpotlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "design-art",
          count: 0,
          previewSkills: []
        })
      ])
    );
    expect(model.categorySpotlights.find((item) => item.slug === "programming-development")).toEqual(
      expect.objectContaining({
        featuredSkills: expect.arrayContaining([
          expect.objectContaining({
            name: "Next.js UX Audit Agent"
          })
        ]),
        previewSkills: expect.arrayContaining([
          expect.objectContaining({
            name: "Next.js UX Audit Agent"
          })
        ])
      })
    );
  });

  it("reorders category hub sections for the human audience lane", () => {
    const payload = buildPublicMarketplaceFallback();
    const model = buildMarketplaceCategoryHubModel(payload.categories, payload.items, 6, "human");

    expect(model.skillSections.map((section) => section.slug)).toEqual([
      "featured",
      "popular",
      "recently-updated",
      "most-installed"
    ]);
    expect(model.skillSections[0]?.items[0]?.source_type).toBe("manual");
    expect(model.categorySpotlights.find((item) => item.slug === "programming-development")?.featuredSkills[0]?.source_type).toBe(
      "manual"
    );
  });
});
