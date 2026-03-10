import { describe, expect, it } from "vitest";

import type { MarketplaceQueryParams, MarketplaceSkill } from "../../lib/api";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";

function createQuery(overrides: Partial<MarketplaceQueryParams> = {}): MarketplaceQueryParams {
  return {
    q: "",
    tags: "",
    category: "",
    subcategory: "",
    sort: "recent",
    mode: "keyword",
    page: 1,
    ...overrides
  };
}

function isSortedByQuality(items: MarketplaceSkill[]): boolean {
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    if (previous.quality_score < current.quality_score) {
      return false;
    }
    if (previous.quality_score === current.quality_score && previous.star_count < current.star_count) {
      return false;
    }
  }
  return true;
}

describe("buildMarketplaceFallback", () => {
  it("filters by category and subcategory slug values", () => {
    const response = buildMarketplaceFallback(
      createQuery({
        category: "testing-automation",
        subcategory: "workflow-regression"
      }),
      "en",
      null
    );

    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items.every((item) => item.category === "Testing Automation")).toBe(true);
    expect(response.items.every((item) => item.subcategory === "Workflow Regression")).toBe(true);
    expect(response.pagination.total_items).toBeGreaterThan(0);
  });

  it("returns empty result set when no skills match the query", () => {
    const response = buildMarketplaceFallback(
      createQuery({
        q: "skill-not-found-zzzz"
      }),
      "en",
      null
    );

    expect(response.items).toEqual([]);
    expect(response.pagination.total_items).toBe(0);
    expect(response.pagination.total_pages).toBe(1);
    expect(response.pagination.page).toBe(1);
    expect(response.stats.matching_skills).toBe(0);
  });

  it("sorts fallback items by quality score when requested", () => {
    const response = buildMarketplaceFallback(
      createQuery({
        sort: "quality"
      }),
      "en",
      null
    );

    expect(response.items.length).toBeGreaterThan(1);
    expect(isSortedByQuality(response.items)).toBe(true);
  });

  it("clamps page to the last available page for narrow filters", () => {
    const response = buildMarketplaceFallback(
      createQuery({
        category: "governance",
        page: 999
      }),
      "en",
      null
    );

    expect(response.pagination.total_items).toBeGreaterThan(0);
    expect(response.pagination.total_pages).toBeGreaterThanOrEqual(1);
    expect(response.pagination.page).toBe(response.pagination.total_pages);
    expect(response.pagination.prev_page).toBe(response.pagination.page - 1);
    expect(response.pagination.next_page).toBe(0);
  });

  it("creates stable paginated mock data across different pages", () => {
    const pageOne = buildMarketplaceFallback(
      createQuery({
        q: "odoo",
        page: 1
      }),
      "en",
      null
    );
    const pageTwo = buildMarketplaceFallback(
      createQuery({
        q: "odoo",
        page: 2
      }),
      "en",
      null
    );

    expect(pageOne.pagination.total_pages).toBeGreaterThan(1);
    expect(pageOne.items.length).toBeGreaterThan(0);
    expect(pageTwo.items.length).toBeGreaterThan(0);
    expect(pageOne.items[0]?.id).not.toBe(pageTwo.items[0]?.id);
  });

  it("localizes category and description fields for zh locale while keeping slug filtering", () => {
    const response = buildMarketplaceFallback(
      createQuery({
        category: "testing-automation",
        page: 1
      }),
      "zh",
      null
    );

    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0]?.category).toBe("\u6d4b\u8bd5\u81ea\u52a8\u5316");
    expect(response.items[0]?.description).toContain("\u63a8\u8350\u7406\u7531");
    const category = response.categories.find((item) => item.slug === "testing-automation");
    expect(category?.name).toBe("\u6d4b\u8bd5\u81ea\u52a8\u5316");
  });
});
