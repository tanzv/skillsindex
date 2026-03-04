import { describe, expect, it } from "vitest";
import type { PublicMarketplaceResponse } from "../lib/api";
import {
  buildCategoryResultsPath,
  resolveCategoryCardsFromPayload,
  resolveCategoriesViewPayload,
  resolveCategoryPublicPath,
  resolveRankingsPublicPath
} from "./PublicCategoriesPage";

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
      "/light/results?category=testing-automation&page=1"
    );
    expect(resolveCategoryPublicPath("/mobile/light/categories", "testing-automation")).toBe(
      "/mobile/light/results?category=testing-automation&page=1"
    );
    expect(resolveRankingsPublicPath("/mobile/light/categories")).toBe("/mobile/light/rankings");
  });

  it("builds category cards from payload categories and limits subcategories to top three", () => {
    const cards = resolveCategoryCardsFromPayload(createPayload(), "No category description available");

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      slug: "testing-automation",
      name: "Testing Automation",
      description: "Regression and release confidence workflows",
      count: 12
    });
    expect(cards[0]?.topSubcategories).toHaveLength(3);
    expect(cards[0]?.topSubcategories.map((item) => item.slug)).toEqual([
      "workflow-regression",
      "assertion-library",
      "coverage-matrix"
    ]);
  });

  it("creates a results query with category and fixed page", () => {
    expect(buildCategoryResultsPath("odoo")).toBe("/results?category=odoo&page=1");
  });

  it("returns an empty view payload when runtime payload is missing", () => {
    const payload = resolveCategoriesViewPayload(null);
    expect(payload.stats.total_skills).toBe(0);
    expect(payload.items).toEqual([]);
    expect(payload.categories).toEqual([]);
  });
});
