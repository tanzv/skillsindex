import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MarketplaceFilterForm } from "../pages/MarketplaceHomePage.helpers";
import type { MarketplaceText } from "../pages/marketplaceText";
import MarketplaceCategorySearchControls from "./MarketplaceCategorySearchControls";

const baseForm: MarketplaceFilterForm = {
  q: "pipeline",
  tags: "",
  category: "tools",
  subcategory: "",
  sort: "relevance",
  mode: "hybrid"
};

const text = {
  categoryNav: "Categories",
  allSubcategories: "All subcategories",
  queryKeyword: "Keyword query",
  queryPlaceholder: "Search in category",
  search: "Search",
  sortLabel: "Sort: Relevance",
  modeLabel: "Mode: Hybrid"
} as MarketplaceText;

describe("MarketplaceCategorySearchControls", () => {
  it("renders one global query input without semantic field in category detail context", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplaceCategorySearchControls, {
        text,
        categoryName: "Tools",
        form: baseForm,
        categoryOptions: [
          { slug: "lint", name: "Lint", count: 3 },
          { slug: "build", name: "Build", count: 5 }
        ],
        sortOptions: [
          { value: "relevance", label: "Sort: Relevance" },
          { value: "recent", label: "Sort: Recent" }
        ],
        modeOptions: [
          { value: "hybrid", label: "Mode: Hybrid" },
          { value: "ai", label: "Mode: AI" }
        ],
        submitDisabled: false,
        onFilterFieldChange: () => undefined,
        onSearchInputKeyDown: () => undefined,
        onSearchSubmit: () => undefined,
        onSubcategoryFilterApply: () => undefined,
        onSortFilterApply: () => undefined,
        onModeFilterApply: () => undefined
      })
    );

    expect(html).toContain("marketplace-search-input is-query");
    expect(html).not.toContain("marketplace-search-input is-semantic");
    expect(html).toContain("Sort: Relevance");
    expect(html).toContain("Mode: Hybrid");
  });
});
