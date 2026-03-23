import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceResultsListSection } from "@/src/features/public/marketplace/MarketplaceResultsListSection";

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

describe("MarketplaceResultsListSection", () => {
  it("renders results content when results are available", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceResultsListSection, {
        title: "Search Results",
        description: "Browse matching skills.",
        hasResults: true,
        testId: "results-section",
        headerMeta: createElement("div", { className: "section-meta" }, "Meta"),
        resultsContent: createElement("article", { className: "result-card" }, "Result A"),
        emptyContent: createElement("div", { className: "empty-card" }, "Empty")
      })
    );

    expectMarkupToContainAll(markup, [
      'data-testid="results-section"',
      'class="marketplace-section-card"',
      'class="marketplace-section-header"',
      "Search Results",
      "Browse matching skills.",
      "section-meta",
      'class="marketplace-list-stack"',
      "result-card"
    ]);
    expectMarkupToExcludeAll(markup, ["empty-card"]);
  });

  it("renders empty content when no results are available", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceResultsListSection, {
        title: "Category Results",
        description: "No matching skills.",
        hasResults: false,
        resultsContent: createElement("article", { className: "result-card" }, "Result A"),
        emptyContent: createElement("div", { className: "empty-card" }, "Empty")
      })
    );

    expectMarkupToContainAll(markup, [
      'class="marketplace-section-card"',
      'class="marketplace-list-stack"',
      "Category Results",
      "No matching skills.",
      "empty-card"
    ]);
    expectMarkupToExcludeAll(markup, ["result-card"]);
  });
});
