import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import {
  buildPublicLandingPageModel,
  publicLandingLatestFeedLimit
} from "@/src/features/public/publicLandingPageModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  landingCuratedDescription: "Curated marketplace picks.",
  landingCuratedTitle: "Curated Picks",
  landingLatestDescription: "Recently updated entries.",
  landingLatestTitle: "Latest Updates"
} as PublicMarketplaceMessages;

describe("public landing page model", () => {
  it("builds landing summary, feed labels, and warmup targets from marketplace data", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const model = buildPublicLandingPageModel({
      marketplace,
      messages,
      resolvePath: (route) => `/public${route}`
    });

    expect(model.featuredTitle).toBe("Curated Picks");
    expect(model.featuredDescription).toBe("Curated marketplace picks.");
    expect(model.latestTitle).toBe("Latest Updates");
    expect(model.latestDescription).toBe("Recently updated entries.");
    expect(model.featuredItems).toHaveLength(Math.min(marketplace.items.length, 3));
    expect(model.latestItems.length).toBeGreaterThan(0);
    expect(model.latestItems.length).toBeLessThanOrEqual(publicLandingLatestFeedLimit);
    expect(model.featuredChips).toEqual(
      marketplace.top_tags.slice(0, 3).map((tag) => tag.name)
    );
    expect(model.latestChips).toEqual(
      marketplace.categories.slice(0, 4).map((category) => category.name)
    );
    expect(model.searchSuggestions).toEqual(marketplace.top_tags.map((tag) => tag.name));
    expect(model.searchAction).toBe("/public/results");
    expect(model.landingSummary).toEqual(marketplace.summary?.landing);
    expect(model.skillWarmupTargets.length).toBeGreaterThan(0);
    expect(model.skillWarmupTargets.every((route) => route.startsWith("/public/skills/"))).toBe(true);
  });

  it("falls back to computed landing summary when snapshot summary is unavailable", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const model = buildPublicLandingPageModel({
      marketplace: {
        ...marketplace,
        summary: {
          ...marketplace.summary,
          landing: undefined
        }
      },
      messages,
      resolvePath: (route) => route
    });

    expect(model.landingSummary.total_skills).toBe(marketplace.stats.total_skills);
    expect(model.landingSummary.category_count).toBe(
      marketplace.categories.filter((category) => category.count > 0).length
    );
    expect(model.landingSummary.top_tag_count).toBe(marketplace.top_tags.length);
    expect(model.landingSummary.featured_skill_count).toBe(model.featuredItems.length);
    expect(model.landingSummary.latest_skill_count).toBe(model.latestItems.length);
  });
});
