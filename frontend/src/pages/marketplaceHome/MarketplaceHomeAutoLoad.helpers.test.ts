import { describe, expect, it } from "vitest";

import type { MarketplaceQueryParams, MarketplaceSkill, PublicMarketplaceResponse } from "../../lib/api";
import {
  buildHomeQuerySignature,
  canArmAutoLoadFromScrollState,
  computeVirtualRowWindow,
  mergeMarketplacePayloadForHomeAutoLoad,
  normalizeUnavailableLiveMarketplacePayload
} from "./MarketplaceHomeAutoLoad.helpers";

function createSkill(id: number): MarketplaceSkill {
  return {
    id,
    name: `Skill ${id}`,
    description: `Description ${id}`,
    content: "",
    category: "Testing Automation",
    subcategory: "Workflow Regression",
    tags: ["tag-a", "tag-b"],
    source_type: "official",
    source_url: "",
    star_count: 10,
    quality_score: 8.8,
    install_command: `skills install ${id}`,
    updated_at: "2026-01-01T00:00:00Z"
  };
}

function createPayload(
  page: number,
  items: MarketplaceSkill[],
  q = "odoo",
  paginationOverrides: Partial<PublicMarketplaceResponse["pagination"]> = {}
): PublicMarketplaceResponse {
  const basePagination = {
    page,
    page_size: 24,
    total_items: 100,
    total_pages: 5,
    prev_page: page > 1 ? page - 1 : 0,
    next_page: page < 5 ? page + 1 : 0
  };
  return {
    filters: {
      q,
      tags: "",
      category: "",
      subcategory: "",
      sort: "recent",
      mode: "keyword"
    },
    stats: {
      total_skills: 1000,
      matching_skills: 100
    },
    pagination: {
      ...basePagination,
      ...paginationOverrides
    },
    categories: [],
    top_tags: [],
    items,
    session_user: null,
    can_access_dashboard: false
  };
}

describe("buildHomeQuerySignature", () => {
  it("ignores page and keeps filter signature stable", () => {
    const base: MarketplaceQueryParams = {
      q: "odoo",
      tags: "workflow",
      category: "testing",
      subcategory: "e2e",
      sort: "quality",
      mode: "semantic",
      page: 2
    };

    const changedPage: MarketplaceQueryParams = {
      ...base,
      page: 56
    };

    expect(buildHomeQuerySignature(base)).toBe(buildHomeQuerySignature(changedPage));
  });
});

describe("normalizeUnavailableLiveMarketplacePayload", () => {
  it("forces a terminal pagination state on degraded live payload", () => {
    const degradedPayload = createPayload(3, [createSkill(1), createSkill(2)], "odoo", {
      total_pages: 99,
      next_page: 4,
      total_items: 500
    });

    const normalized = normalizeUnavailableLiveMarketplacePayload(degradedPayload, 21);
    expect(normalized.items).toEqual([]);
    expect(normalized.stats.matching_skills).toBe(0);
    expect(normalized.pagination.page).toBe(21);
    expect(normalized.pagination.total_items).toBe(0);
    expect(normalized.pagination.total_pages).toBe(21);
    expect(normalized.pagination.prev_page).toBe(20);
    expect(normalized.pagination.next_page).toBe(0);
  });
});

describe("mergeMarketplacePayloadForHomeAutoLoad", () => {
  it("appends sequential page items for same filter signature", () => {
    const previousPayload = createPayload(2, [createSkill(1), createSkill(2)]);
    const nextPayload = createPayload(3, [createSkill(3), createSkill(4)]);

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload,
      nextQuery: { q: "odoo", page: 3 }
    });

    expect(merged.pagination.page).toBe(3);
    expect(merged.items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
  });

  it("deduplicates same skill id while appending", () => {
    const previousPayload = createPayload(2, [createSkill(1), createSkill(2)]);
    const nextPayload = createPayload(3, [createSkill(2), createSkill(5)]);

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload,
      nextQuery: { q: "odoo", page: 3 }
    });

    expect(merged.items.map((item) => item.id)).toEqual([1, 2, 5]);
  });

  it("uses requested query page when backend payload page lags", () => {
    const previousPayload = createPayload(1, [createSkill(1), createSkill(2)]);
    const laggingNextPayload = createPayload(1, [createSkill(3), createSkill(4)]);

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload: laggingNextPayload,
      nextQuery: { q: "odoo", page: 2 }
    });

    expect(merged.pagination.page).toBe(2);
    expect(merged.items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
  });

  it("resets items when page jump is not sequential", () => {
    const previousPayload = createPayload(2, [createSkill(1), createSkill(2)]);
    const nextPayload = createPayload(5, [createSkill(9), createSkill(10)]);

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload,
      nextQuery: { q: "odoo", page: 5 }
    });

    expect(merged.items.map((item) => item.id)).toEqual([9, 10]);
  });

  it("resets items when filter signature changes", () => {
    const previousPayload = createPayload(2, [createSkill(1), createSkill(2)]);
    const nextPayload = createPayload(3, [createSkill(6), createSkill(7)], "repo");

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload,
      nextQuery: { q: "repo", page: 3 }
    });

    expect(merged.items.map((item) => item.id)).toEqual([6, 7]);
  });

  it("stops auto-load when the next sequential page has no items", () => {
    const previousPayload = createPayload(2, [createSkill(1), createSkill(2)]);
    const emptyNextPagePayload = createPayload(3, [], "odoo", {
      total_pages: 99,
      next_page: 4
    });

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload: emptyNextPagePayload,
      nextQuery: { q: "odoo", page: 3 }
    });

    expect(merged.items.map((item) => item.id)).toEqual([1, 2]);
    expect(merged.pagination.page).toBe(2);
    expect(merged.pagination.total_pages).toBe(2);
    expect(merged.pagination.next_page).toBe(0);
  });

  it("stops auto-load when the backend repeats last-page items after a sequential request", () => {
    const previousPayload = createPayload(109, [createSkill(1), createSkill(2)], "odoo", {
      total_pages: 109,
      next_page: 0
    });
    const repeatedLastPagePayload = createPayload(109, [createSkill(1), createSkill(2)], "odoo", {
      total_pages: 109,
      next_page: 0
    });

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload,
      nextPayload: repeatedLastPagePayload,
      nextQuery: { q: "odoo", page: 110 }
    });

    expect(merged.pagination.page).toBe(109);
    expect(merged.pagination.total_pages).toBe(109);
    expect(merged.pagination.next_page).toBe(0);
    expect(merged.items.map((item) => item.id)).toEqual([1, 2]);
  });

  it("normalizes pagination to terminal state for an empty first payload", () => {
    const emptyFirstPayload = createPayload(21, [], "repo", {
      total_pages: 999,
      next_page: 22
    });

    const merged = mergeMarketplacePayloadForHomeAutoLoad({
      previousPayload: null,
      nextPayload: emptyFirstPayload,
      nextQuery: { q: "repo", page: 21 }
    });

    expect(merged.items).toEqual([]);
    expect(merged.pagination.page).toBe(21);
    expect(merged.pagination.total_pages).toBe(21);
    expect(merged.pagination.next_page).toBe(0);
  });
});

describe("computeVirtualRowWindow", () => {
  it("computes first viewport range with overscan", () => {
    const windowState = computeVirtualRowWindow({
      totalRows: 20,
      rowHeight: 168,
      rowGap: 10,
      overscanRows: 1,
      viewportTop: 0,
      viewportBottom: 400
    });

    expect(windowState.startIndex).toBe(0);
    expect(windowState.endIndex).toBe(4);
    expect(windowState.paddingTop).toBe(0);
    expect(windowState.paddingBottom).toBe(2838);
  });

  it("computes middle viewport range and spacer heights", () => {
    const windowState = computeVirtualRowWindow({
      totalRows: 20,
      rowHeight: 168,
      rowGap: 10,
      overscanRows: 2,
      viewportTop: 800,
      viewportBottom: 1200
    });

    expect(windowState.startIndex).toBe(2);
    expect(windowState.endIndex).toBe(9);
    expect(windowState.paddingTop).toBe(346);
    expect(windowState.paddingBottom).toBe(1948);
  });

  it("returns empty window for zero rows", () => {
    const windowState = computeVirtualRowWindow({
      totalRows: 0,
      rowHeight: 168,
      rowGap: 10,
      overscanRows: 2,
      viewportTop: 0,
      viewportBottom: 100
    });

    expect(windowState).toEqual({
      startIndex: 0,
      endIndex: 0,
      paddingTop: 0,
      paddingBottom: 0
    });
  });
});

describe("canArmAutoLoadFromScrollState", () => {
  it("returns true after user has scrolled down", () => {
    const ready = canArmAutoLoadFromScrollState({
      scrollTop: 12,
      scrollHeight: 1800,
      viewportHeight: 900,
      triggerDistancePx: 150
    });

    expect(ready).toBe(true);
  });

  it("returns true when content does not exceed viewport threshold", () => {
    const ready = canArmAutoLoadFromScrollState({
      scrollTop: 0,
      scrollHeight: 980,
      viewportHeight: 900,
      triggerDistancePx: 100
    });

    expect(ready).toBe(true);
  });

  it("returns false when user has not scrolled and content is taller than threshold", () => {
    const ready = canArmAutoLoadFromScrollState({
      scrollTop: 0,
      scrollHeight: 1700,
      viewportHeight: 900,
      triggerDistancePx: 120
    });

    expect(ready).toBe(false);
  });
});
