import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceSearchOverlay } from "@/src/features/public/marketplace/MarketplaceSearchOverlay";

vi.mock("next/navigation", () => ({
  usePathname: () => "/results"
}));

describe("MarketplaceSearchOverlay", () => {
  it("renders recent entries through the shared support link list", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchOverlay, {
        action: "/results",
        isOpen: true,
        title: "Search Results",
        description: "Overlay description",
        closeLabel: "Close",
        clearLabel: "Clear",
        recentTitle: "Recent searches",
        recentDescription: "Continue from recent filters.",
        emptyLabel: "No recent searches.",
        queryLabel: "Query",
        queryPlaceholder: "Search skills",
        semanticLabel: "Tags",
        semanticPlaceholder: "Semantic tags",
        submitLabel: "Search",
        query: "release",
        tags: "ops",
        entries: [
          {
            route: "/results",
            query: "release",
            tags: "ops",
            createdAt: "2026-03-17T00:00:00.000Z"
          }
        ],
        onClose: () => {},
        onClear: () => {},
        onSubmit: () => {},
        onQueryChange: () => {},
        onTagsChange: () => {}
      })
    );

    expect(markup).toContain("Recent searches");
    expect(markup).toContain("Continue from recent filters.");
    expect(markup).toContain("marketplace-overlay-list");
    expect(markup).toContain("release · ops");
    expect(markup).toContain("/results");
  });
});
