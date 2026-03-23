import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceSearchForm } from "@/src/features/public/marketplace/MarketplaceSearchForm";

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

    expectMarkupToContainAll(markup, [
      'action="/categories/operations"',
      'class="marketplace-search-form"',
      'name="q"',
      'value="release"',
      'placeholder="Search skills"',
      'aria-label="Search"',
      'name="tags"',
      'value="ops"',
      'placeholder="Semantic filters"',
      'aria-label="Semantic Filters"',
      'type="hidden"',
      'name="subcategory"',
      'name="sort"',
      ">Search<"
    ]);
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

    expectMarkupToContainAll(markup, ['name="q"', 'placeholder="Search skills"', 'aria-label="Search"']);
    expectMarkupToExcludeAll(markup, ['name="tags"', ">Search<"]);
  });
});
