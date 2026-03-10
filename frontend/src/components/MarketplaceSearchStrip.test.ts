import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { marketplaceHomeCopy } from "../pages/marketplaceHome/MarketplaceHomePage.copy";
import type { MarketplaceFilterForm } from "../pages/marketplaceHome/MarketplaceHomePage.helpers";
import type { MarketplaceText } from "../pages/marketplacePublic/marketplaceText";
import MarketplaceSearchStrip from "./MarketplaceSearchStrip";

const baseText = marketplaceHomeCopy.en as MarketplaceText;
const baseForm: MarketplaceFilterForm = {
  q: "repo",
  tags: "workflow",
  category: "",
  subcategory: "",
  sort: "recent",
  mode: "keyword"
};

describe("MarketplaceSearchStrip", () => {
  it("renders home entry variant without semantic field", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplaceSearchStrip, {
        variant: "home-entry",
        text: baseText,
        form: baseForm,
        submitDisabled: false,
        hotFilters: [],
        onFilterFieldChange: vi.fn(),
        onSearchInputKeyDown: vi.fn(),
        onSearchSubmit: vi.fn(),
        onSearchEntryOpen: vi.fn(),
        onHotFilterApply: vi.fn()
      })
    );

    expect(html).toContain("marketplace-search-utility-row");
    expect(html).not.toContain("marketplace-search-input is-semantic");
  });

  it("renders results variant with semantic field", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplaceSearchStrip, {
        variant: "results",
        text: baseText,
        form: baseForm,
        submitDisabled: false,
        hotFilters: [],
        onFilterFieldChange: vi.fn(),
        onSearchInputKeyDown: vi.fn(),
        onSearchSubmit: vi.fn(),
        onHotFilterApply: vi.fn()
      })
    );

    expect(html).toContain("marketplace-search-input is-semantic");
    expect(html).not.toContain("marketplace-search-utility-row");
  });
});
