import { describe, expect, it } from "vitest";

import {
  isCategoryDetailResultsRoutePath,
  isResultsRoutePath,
  resolveResultsToolbarTitle
} from "./MarketplaceHomeResultsContent.route";

describe("isResultsRoutePath", () => {
  it("matches canonical results routes", () => {
    expect(isResultsRoutePath("/results")).toBe(true);
    expect(isResultsRoutePath("/light/results")).toBe(true);
    expect(isResultsRoutePath("/mobile/light/results/")).toBe(true);
  });

  it("does not match category result routes", () => {
    expect(isResultsRoutePath("/categories/tools")).toBe(false);
  });
});

describe("isCategoryDetailResultsRoutePath", () => {
  it("matches category detail routes with optional prefixes", () => {
    expect(isCategoryDetailResultsRoutePath("/categories/tools")).toBe(true);
    expect(isCategoryDetailResultsRoutePath("/light/categories/tools")).toBe(true);
    expect(isCategoryDetailResultsRoutePath("/mobile/light/categories/tools/")).toBe(true);
  });

  it("does not match category root and non-category routes", () => {
    expect(isCategoryDetailResultsRoutePath("/categories")).toBe(false);
    expect(isCategoryDetailResultsRoutePath("/results")).toBe(false);
  });
});

describe("resolveResultsToolbarTitle", () => {
  const labels = {
    latestTitle: "Latest",
    resultsTitle: "Search Results",
    categoryResultsTitle: "Category Results"
  };

  it("returns category title for category result routes", () => {
    expect(
      resolveResultsToolbarTitle({
        isResultsPage: true,
        pathname: "/categories/tools",
        labels
      })
    ).toBe("Category Results");
  });

  it("returns generic results title for regular results routes", () => {
    expect(
      resolveResultsToolbarTitle({
        isResultsPage: true,
        pathname: "/results",
        labels
      })
    ).toBe("Search Results");
  });

  it("returns latest title for homepage results section", () => {
    expect(
      resolveResultsToolbarTitle({
        isResultsPage: false,
        pathname: "/",
        labels
      })
    ).toBe("Latest");
  });
});
