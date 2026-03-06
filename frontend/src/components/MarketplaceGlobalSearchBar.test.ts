import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MarketplaceGlobalSearchBar from "./MarketplaceGlobalSearchBar";

describe("MarketplaceGlobalSearchBar", () => {
  it("renders only the submit action when filter action is not provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplaceGlobalSearchBar, {
        queryAriaLabel: "Keyword query",
        queryValue: "repo",
        queryPlaceholder: "Search skills",
        queryReadOnly: true,
        onQueryKeyDown: () => undefined,
        submitLabel: "Search",
        onSubmit: () => undefined
      })
    );

    expect(html).toContain("marketplace-search-submit");
    expect(html).not.toContain("marketplace-search-filter-btn");
  });

  it("renders filter before submit when filter-first order is requested", () => {
    const onFilterClick = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(MarketplaceGlobalSearchBar, {
        queryAriaLabel: "Keyword query",
        queryValue: "repo",
        queryPlaceholder: "Search skills",
        queryReadOnly: true,
        onQueryKeyDown: () => undefined,
        submitLabel: "Search",
        onSubmit: () => undefined,
        filterLabel: "Advanced",
        onFilterClick,
        actionOrder: "filter-first"
      })
    );

    const filterIndex = html.indexOf("marketplace-search-filter-btn");
    const submitIndex = html.indexOf("marketplace-search-submit");
    expect(filterIndex).toBeGreaterThanOrEqual(0);
    expect(submitIndex).toBeGreaterThanOrEqual(0);
    expect(filterIndex).toBeLessThan(submitIndex);
  });

  it("hides submit action when no-button mode is enabled", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplaceGlobalSearchBar, {
        queryAriaLabel: "Keyword query",
        queryValue: "repo",
        queryPlaceholder: "Search skills",
        queryReadOnly: true,
        onQueryKeyDown: () => undefined,
        submitLabel: "Search",
        onSubmit: () => undefined,
        showSubmitAction: false
      })
    );

    expect(html).not.toContain("marketplace-search-submit");
  });
});
