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
});
