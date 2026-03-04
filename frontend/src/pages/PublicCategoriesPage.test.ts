import { describe, expect, it } from "vitest";
import type { PublicMarketplaceResponse } from "../lib/api";
import {
  buildCategoryDetailPath,
  buildCategoryIconPlaceholder,
  resolveCategoryCardsFromPayload,
  resolveCategoriesViewPayload,
  resolveCategoryPublicPath,
  resolveRankingsPublicPath
} from "./PublicCategoriesPage.helpers";

function createPayload(): PublicMarketplaceResponse {
  return {
    filters: {
      q: "",
      tags: "",
      category: "",
      subcategory: "",
      sort: "recent",
      mode: "keyword"
    },
    stats: {
      total_skills: 3,
      matching_skills: 3
    },
    pagination: {
      page: 1,
      page_size: 24,
      total_items: 3,
      total_pages: 1,
      prev_page: 0,
      next_page: 0
    },
    categories: [
      {
        slug: "testing-automation",
        name: "Testing Automation",
        description: "Regression and release confidence workflows",
        count: 12,
        subcategories: [
          { slug: "workflow-regression", name: "Workflow Regression", count: 5 },
          { slug: "assertion-library", name: "Assertion Library", count: 4 },
          { slug: "coverage-matrix", name: "Coverage Matrix", count: 2 },
          { slug: "nightly-runner", name: "Nightly Runner", count: 1 }
        ]
      }
    ],
    top_tags: [
      { name: "playwright", count: 8 },
      { name: "regression", count: 7 }
    ],
    items: [],
    session_user: null,
    can_access_dashboard: false
  };
}

describe("PublicCategoriesPage helpers", () => {
  it("preserves light and mobile-light prefixes for category and rankings navigation", () => {
    expect(resolveCategoryPublicPath("/light/categories", "testing-automation")).toBe(
      "/light/categories/testing-automation?category=testing-automation&page=1"
    );
    expect(resolveCategoryPublicPath("/mobile/light/categories", "testing-automation")).toBe(
      "/mobile/light/categories/testing-automation?category=testing-automation&page=1"
    );
    expect(resolveRankingsPublicPath("/mobile/light/categories")).toBe("/mobile/light/rankings");
  });

  it("builds category cards from payload categories and exposes compact summary metrics", () => {
    const cards = resolveCategoryCardsFromPayload(createPayload(), {
      noDescription: "No category description available",
      uncategorizedName: "Uncategorized",
      generalSubcategoryName: "General",
      iconPlaceholderFallback: "CT"
    });

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      slug: "testing-automation",
      name: "Testing Automation",
      description: "Regression and release confidence workflows",
      count: 12,
      subcategoryCount: 4,
      topSubcategoryTotalCount: 11,
      iconPlaceholder: "TA"
    });
    expect(cards[0]?.topSubcategories).toHaveLength(3);
    expect(cards[0]?.topSubcategories.map((item) => item.slug)).toEqual([
      "workflow-regression",
      "assertion-library",
      "coverage-matrix"
    ]);
  });

  it("creates a category detail route with category query and fixed page", () => {
    expect(buildCategoryDetailPath("odoo")).toBe("/categories/odoo?category=odoo&page=1");
    expect(buildCategoryDetailPath("release gates")).toBe(
      "/categories/release%20gates?category=release+gates&page=1"
    );
  });

  it("uses localized fallback names when category or subcategory names are empty", () => {
    const payload = createPayload();
    payload.categories[0].name = "";
    payload.categories[0].description = "";
    payload.categories[0].subcategories = [{ slug: "misc", name: "", count: 1 }];

    const cards = resolveCategoryCardsFromPayload(payload, {
      noDescription: "No description",
      uncategorizedName: "Fallback Category",
      generalSubcategoryName: "Fallback Subcategory",
      iconPlaceholderFallback: "CT"
    });

    expect(cards[0]?.name).toBe("Fallback Category");
    expect(cards[0]?.description).toBe("No description");
    expect(cards[0]?.topSubcategories[0]?.name).toBe("Fallback Subcategory");
    expect(cards[0]?.iconPlaceholder).toBe("FC");
  });

  it("returns an empty view payload when runtime payload is missing", () => {
    const payload = resolveCategoriesViewPayload(null);
    expect(payload.stats.total_skills).toBe(0);
    expect(payload.items).toEqual([]);
    expect(payload.categories).toEqual([]);
  });

  it("builds icon placeholders from category names", () => {
    expect(buildCategoryIconPlaceholder("Testing Automation", "CT")).toBe("TA");
    expect(buildCategoryIconPlaceholder("Security", "CT")).toBe("SE");
    expect(buildCategoryIconPlaceholder("", "CT")).toBe("CT");
  });
});
