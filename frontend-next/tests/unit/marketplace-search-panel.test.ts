import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
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

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) =>
    createElement("a", { href, ...props }, children)
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

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function expectMarkupToExcludeAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).not.toContain(fragment);
  }
}

function findAnchorMarkupByHref(markup: string, href: string) {
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const anchorMatch = markup.match(new RegExp(`<a[^>]*href="${escapedHref}"[^>]*>[\\s\\S]*?<\\/a>`, "u"));
  expect(anchorMatch?.[0]).toBeDefined();
  return anchorMatch?.[0] ?? "";
}

function findAnchorMarkupByLabel(markup: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const anchorMatch = markup.match(new RegExp(`<a[^>]*>[\\s\\S]*?>${escapedLabel}<[^>]*>[\\s\\S]*?<\\/a>`, "u"));
  expect(anchorMatch?.[0]).toBeDefined();
  return anchorMatch?.[0] ?? "";
}

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

    expectMarkupToContainAll(markup, [
      'class="marketplace-search-form"',
      'action="/results"',
      'aria-label="Search utility"',
      'aria-label="Sort"',
      'aria-label="Mode"',
      ">Filters<"
    ]);
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

    expectMarkupToContainAll(markup, [
      'class="marketplace-top-recommendations"',
      'class="marketplace-search-form"',
      'aria-label="Search utility"',
      ">Recommended<",
      ">Filters<"
    ]);
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

    const releaseSuggestionMarkup = findAnchorMarkupByHref(markup, "/results?q=release");
    const syncSuggestionMarkup = findAnchorMarkupByHref(markup, "/results?q=sync");

    expect((markup.match(/marketplace-recommendation-chip/g) || []).length).toBe(2);
    expectMarkupToContainAll(releaseSuggestionMarkup, [">release<"]);
    expectMarkupToContainAll(syncSuggestionMarkup, [">sync<"]);
    expectMarkupToExcludeAll(markup, ['href="/results"']);
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

    const qualityControlMarkup = findAnchorMarkupByLabel(markup, "Quality");
    const starsControlMarkup = findAnchorMarkupByHref(markup, "/results?q=release&amp;tags=ops&amp;sort=stars&amp;mode=ai");
    const keywordControlMarkup = findAnchorMarkupByHref(markup, "/results?q=release&amp;tags=ops&amp;sort=quality&amp;mode=keyword");
    const aiControlMarkup = findAnchorMarkupByLabel(markup, "AI");

    expectMarkupToContainAll(markup, ["Relevance", "Stars", "Keyword", "AI"]);
    expectMarkupToContainAll(qualityControlMarkup, ['aria-current="page"', ">Quality<"]);
    expectMarkupToContainAll(aiControlMarkup, ['aria-current="page"', ">AI<"]);
    expectMarkupToContainAll(starsControlMarkup, [">Stars<", "q=release", "tags=ops", "sort=stars", "mode=ai"]);
    expectMarkupToContainAll(keywordControlMarkup, [">Keyword<", "q=release", "tags=ops", "sort=quality", "mode=keyword"]);
  });
});
