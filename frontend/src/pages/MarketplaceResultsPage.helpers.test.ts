import { describe, expect, it } from "vitest";
import type { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";
import { buildRecentSearchEntryLabel, buildResultsRoutePreview, resolveSearchContextValue } from "./MarketplaceResultsPage.helpers";

const emptyForm: MarketplaceFilterForm = {
  q: "",
  tags: "",
  category: "",
  subcategory: "",
  sort: "recent",
  mode: "keyword"
};

describe("MarketplaceResultsPage.helpers", () => {
  it("builds base route preview when query fields are empty", () => {
    expect(buildResultsRoutePreview(emptyForm)).toBe("/results");
  });

  it("builds route preview with normalized query fields", () => {
    expect(
      buildResultsRoutePreview({
        ...emptyForm,
        q: "  repo sync  ",
        tags: "  workflow  ",
        category: "tools",
        subcategory: "deployment"
      })
    ).toBe("/results?q=repo+sync&tags=workflow&category=tools&subcategory=deployment");
  });

  it("returns fallback search context when field value is empty", () => {
    expect(resolveSearchContextValue("   ", "Search skills, tags, or authors")).toBe("Search skills, tags, or authors");
    expect(resolveSearchContextValue("repo", "fallback")).toBe("repo");
  });

  it("builds readable labels for recent search entries", () => {
    expect(buildRecentSearchEntryLabel({ q: "repo", tags: "workflow", timestamp: 1 })).toBe("repo · workflow");
    expect(buildRecentSearchEntryLabel({ q: "repo", tags: "", timestamp: 1 })).toBe("repo");
    expect(buildRecentSearchEntryLabel({ q: "", tags: "workflow", timestamp: 1 })).toBe("workflow");
  });
});
