import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceSearchForm } from "@/src/features/public/marketplace/MarketplaceSearchForm";

describe("MarketplaceSearchForm", () => {
  it("renders semantic input, hidden fields, and submit action", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchForm, {
        action: "/categories/operations",
        query: "release",
        semanticQuery: "ops",
        placeholder: "Search skills",
        semanticPlaceholder: "Semantic filters",
        submitLabel: "Search",
        queryAriaLabel: "Search",
        semanticAriaLabel: "Semantic Filters",
        showSemanticField: true,
        hiddenFields: [
          { name: "subcategory", value: "release" },
          { name: "sort", value: "relevance" }
        ]
      })
    );

    expect(markup).toContain("action=\"/categories/operations\"");
    expect(markup).toContain("name=\"q\"");
    expect(markup).toContain("name=\"tags\"");
    expect(markup).toContain("name=\"subcategory\"");
    expect(markup).toContain("name=\"sort\"");
    expect(markup).toContain(">Search<");
  });

  it("omits optional semantic and submit controls when disabled", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSearchForm, {
        action: "/results",
        placeholder: "Search skills",
        semanticPlaceholder: "Semantic filters",
        submitLabel: "Search",
        queryAriaLabel: "Search",
        semanticAriaLabel: "Semantic Filters",
        showSemanticField: false,
        showSubmitAction: false
      })
    );

    expect(markup).toContain("name=\"q\"");
    expect(markup).not.toContain("name=\"tags\"");
    expect(markup).not.toContain(">Search<");
  });
});
