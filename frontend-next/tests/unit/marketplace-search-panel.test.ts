import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceSearchPanel } from "@/src/features/public/marketplace/MarketplaceSearchPanel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

vi.mock("next/navigation", () => ({
  usePathname: () => "/results",
  useRouter: () => ({
    refresh: () => {}
  })
}));

vi.mock("@/src/features/public/i18n/PublicI18nProvider", () => ({
  usePublicI18n: () => ({
    locale: "en",
    messages: {
      searchPlaceholder: "Search skills",
      searchButton: "Search",
      searchSemanticPlaceholder: "Semantic placeholder",
      searchSemanticLabel: "Semantic Filters",
      searchRecommendedLabel: "Recommended",
      searchUtilityAriaLabel: "Search utility",
      searchModeLabel: "Mode",
      searchSortLabel: "Sort",
      searchViewLabel: "View",
      categoryModeAI: "AI",
      categoryModeHybrid: "Hybrid",
      categoryModeKeyword: "Keyword",
      categorySortQuality: "Quality",
      categorySortRecent: "Recent",
      categorySortRelevance: "Relevance",
      categorySortStars: "Stars",
      searchRecentOpen: "Filters",
      searchOverlayTitle: "Search Results",
      searchOverlayDescription: "Overlay description",
      searchRecentClear: "Reset",
      searchClose: "Close",
      searchRecentTitle: "Recent searches",
      searchRecentDescription: "Recent searches description",
      searchRecentEmpty: "History appears here after you submit a query."
    } as PublicMarketplaceMessages
  })
}));

describe("MarketplaceSearchPanel", () => {
  it("renders results variant with the form before the recommendations", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchPanel, {
        variant: "results",
        action: "/results",
        query: "release",
        semanticQuery: "ops",
        suggestions: ["release", "ops"],
        showSemanticField: true
      })
    );

    expect(markup.indexOf("marketplace-search-form")).toBeLessThan(markup.indexOf("marketplace-top-recommendations"));
  });

  it("renders entry variant with recommendations before the form", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchPanel, {
        variant: "entry",
        action: "/results",
        query: "",
        suggestions: ["release", "ops"],
        readOnlyQuery: true,
        showSubmitAction: false
      })
    );

    expect(markup.indexOf("marketplace-top-recommendations")).toBeLessThan(markup.indexOf("marketplace-search-form"));
  });

  it("filters empty and duplicate suggestions before rendering recommendation chips", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchPanel, {
        variant: "entry",
        action: "/results",
        query: "",
        suggestions: ["release", "", "release", "  ", "sync"],
        readOnlyQuery: true,
        showSubmitAction: false
      })
    );

    expect((markup.match(/marketplace-recommendation-chip/g) || []).length).toBe(2);
    expect(markup).toContain(">release<");
    expect(markup).toContain(">sync<");
    expect(markup).not.toContain("href=\"/results\">");
  });

  it("renders interactive sort and mode controls that preserve the active search filters", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchPanel, {
        variant: "results",
        action: "/results",
        query: "release",
        semanticQuery: "ops",
        currentSort: "quality",
        currentMode: "ai",
        showSemanticField: true
      })
    );

    expect(markup).toContain("Relevance");
    expect(markup).toContain("Stars");
    expect(markup).toContain("Keyword");
    expect(markup).toContain("AI");
    expect(markup).toContain('href="/results?q=release&amp;tags=ops&amp;sort=stars&amp;mode=ai"');
    expect(markup).toContain('href="/results?q=release&amp;tags=ops&amp;sort=quality&amp;mode=keyword"');
  });
});
