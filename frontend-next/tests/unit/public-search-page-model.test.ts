import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import { buildPublicSearchPageModel } from "@/src/features/public/publicSearchPageModel";

const messages = {
  resultsLedgerTitle: "Search Results",
  resultsLedgerDescription: "Browse matched skills.",
  resultsCategoryContextTitle: "Category Results",
  stageResults: "Results",
  statTotalSkills: "Total Skills",
  statMatchingSkills: "Matching Skills",
  statCategories: "Categories",
  statTopTags: "Top Tags",
  metricPublicAssets: "Public assets",
  metricDiscoveryWindow: "Discovery window",
  metricCategoryFamilies: "Category families",
  metricTopTagPivots: "Top tag pivots"
};

describe("public search page model", () => {
  it("builds visible items, context labels, and category links for results routes", () => {
    const marketplace = buildPublicMarketplaceFallback({ tags: "ops" });

    const model = buildPublicSearchPageModel({
      marketplace,
      query: "",
      semanticQuery: "ops",
      messages,
      formAction: "/results"
    });

    expect(model.visibleItems.length).toBeGreaterThan(0);
    expect(model.resolvedTitle).toBe("Search Results");
    expect(model.contextLabel).toBe("Results");
    expect(model.categoryLinks.length).toBeGreaterThan(0);
    expect(model.categoryLinks[0]?.href).toMatch(/^\/categories\//);
    expect(model.summaryMetrics.length).toBe(4);
  });
});
