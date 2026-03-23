import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import { buildPublicCategoryDetailPageModel } from "@/src/features/public/publicCategoryDetailPageModel";

const messages = {
  categoryAllSubcategories: "All Subcategories",
  categoryHubAllCategories: "All Categories",
  categoryModeAI: "AI",
  categoryModeHybrid: "Hybrid",
  categoryModeKeyword: "Keyword",
  categoryResultsSuffix: "Results",
  categorySortQuality: "Quality",
  categorySortRecent: "Recent",
  categorySortRelevance: "Relevance",
  categorySortStars: "Stars",
  metricCategoryFamilies: "Category families",
  metricDiscoveryWindow: "Discovery window",
  metricPublicAssets: "Public assets",
  metricTopTagPivots: "Top tag pivots",
  resultsCategoryContextTitle: "Category Results",
  statCategories: "Categories",
  statMatchingSkills: "Matching Skills",
  statTopTags: "Top Tags",
  statTotalSkills: "Total Skills"
};

describe("public category detail page model", () => {
  it("builds category detail state from pure inputs", () => {
    const marketplace = buildPublicMarketplaceFallback({
      category: "operations",
      subcategory: "release",
      sort: "stars"
    });

    const model = buildPublicCategoryDetailPageModel({
      marketplace,
      messages,
      activeCategory: "operations",
      activeSubcategory: "release",
      sort: "stars",
      mode: "ai",
      resolvePath: (route) => `/light${route}`,
      resolveLinkTarget: (route) => ({ href: `/light${route}` })
    });

    expect(model.categorySummary?.slug).toBe("operations");
    expect(model.visibleItems.length).toBeGreaterThan(0);
    expect(model.actionPath).toBe("/light/categories/operations");
    expect(model.activeSortLabel).toBe("Stars");
    expect(model.activeModeLabel).toBe("AI");
    expect(model.subcategoryItems[1]?.href).toContain("/light/categories/operations?subcategory=release");
    expect(model.railItems[0]).toMatchObject({
      slug: "all",
      href: "/light/categories"
    });
    expect(model.summaryMetrics.length).toBe(4);
  });
});
