import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceResultsListSection } from "@/src/features/public/marketplace/MarketplaceResultsListSection";

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

    expect(markup).toContain("data-testid=\"results-section\"");
    expect(markup).toContain("Search Results");
    expect(markup).toContain("Browse matching skills.");
    expect(markup).toContain("section-meta");
    expect(markup).toContain("result-card");
    expect(markup).not.toContain("empty-card");
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

    expect(markup).toContain("empty-card");
    expect(markup).not.toContain("result-card");
  });
});
