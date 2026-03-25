import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceHomeVirtualFeed } from "@/src/features/public/marketplace/MarketplaceHomeVirtualFeed";

vi.mock("@/src/features/public/i18n/PublicI18nProvider", () => ({
  usePublicI18n: () => ({
    locale: "en",
    messages: {
      resultsEmptyTitle: "No matching skills found",
      resultsEmptyDescription: "Refine search terms or reset filters to continue.",
      loadMore: "Load more",
      loadMoreHint: "More results load as you scroll."
    }
  })
}));

describe("MarketplaceHomeVirtualFeed", () => {
  it("renders explicit empty states for both featured and latest sections when marketplace data is empty", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceHomeVirtualFeed, {
        featuredItems: [],
        latestItems: [],
        featuredTitle: "Curated Picks",
        featuredDescription: "Featured description",
        featuredChips: [],
        latestTitle: "Latest Updates",
        latestDescription: "Latest description",
        latestChips: []
      })
    );

    expect(markup).toContain('data-testid="landing-featured-grid"');
    expect(markup).toContain('data-testid="landing-latest-rows"');
    expect((markup.match(/marketplace-empty-state/g) || []).length).toBe(2);
    expect((markup.match(/No matching skills found/g) || []).length).toBe(2);
  });

  it("does not expose an auto-load pagination shell when latest items are present", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceHomeVirtualFeed, {
        featuredItems: [
          {
            id: 101,
            name: "Featured Skill",
            description: "Featured description",
            content: "Featured content",
            category: "operations",
            subcategory: "release",
            tags: ["ops"],
            source_type: "repository",
            source_url: "https://example.com/featured",
            star_count: 10,
            quality_score: 9.2,
            install_command: "npx install-featured",
            updated_at: "2026-03-20T00:00:00Z"
          }
        ],
        latestItems: [
          {
            id: 202,
            name: "Latest Skill",
            description: "Latest description",
            content: "Latest content",
            category: "operations",
            subcategory: "release",
            tags: ["ops"],
            source_type: "repository",
            source_url: "https://example.com/latest",
            star_count: 8,
            quality_score: 8.8,
            install_command: "npx install-latest",
            updated_at: "2026-03-21T00:00:00Z"
          }
        ],
        featuredTitle: "Curated Picks",
        featuredDescription: "Featured description",
        featuredChips: [],
        latestTitle: "Latest Updates",
        latestDescription: "Latest description",
        latestChips: []
      })
    );

    expect(markup).not.toContain('data-testid="marketplace-pagination-auto-load"');
    expect(markup).not.toContain("Load more");
  });
});
