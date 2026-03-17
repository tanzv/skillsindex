import { afterEach, describe, expect, it, vi } from "vitest";

import type { MarketplaceQueryParams } from "../../lib/api";
import * as marketplaceAPI from "../../lib/api";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";

const baseQuery: MarketplaceQueryParams = {
  q: "",
  tags: "",
  category: "",
  subcategory: "",
  sort: "recent",
  mode: "keyword",
  page: 1
};

afterEach(() => {
  vi.useRealTimers();
});

describe("prototypeDataFallback", () => {
  it("defaults to prototype mode when mode is missing", () => {
    expect(resolvePrototypeDataMode(undefined)).toBe("prototype");
    expect(resolvePrototypeDataMode("")).toBe("prototype");
    expect(resolvePrototypeDataMode("unknown")).toBe("prototype");
  });

  it("supports live mode when explicitly requested", () => {
    expect(resolvePrototypeDataMode("live")).toBe("live");
    expect(resolvePrototypeDataMode(" LIVE ")).toBe("live");
  });

  it("waits for configured delay in prototype mode", async () => {
    vi.useFakeTimers();
    let settled = false;

    const task = loadMarketplaceWithFallback({
      query: baseQuery,
      locale: "en",
      sessionUser: null,
      mode: "prototype",
      prototypeDelayMs: 180
    }).then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(179);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await task;
    expect(settled).toBe(true);
  });

  it("returns prototype payload immediately when delay is invalid", async () => {
    vi.useFakeTimers();
    let settled = false;

    const task = loadMarketplaceWithFallback({
      query: baseQuery,
      locale: "en",
      sessionUser: null,
      mode: "prototype",
      prototypeDelayMs: Number.NaN
    }).then(() => {
      settled = true;
    });

    await vi.runAllTimersAsync();
    await task;
    expect(settled).toBe(true);
  });

  it("returns an empty degraded payload when live mode request fails", async () => {
    const fetchSpy = vi
      .spyOn(marketplaceAPI, "fetchPublicMarketplace")
      .mockRejectedValueOnce(new Error("backend unavailable"));

    const result = await loadMarketplaceWithFallback({
      query: {
        ...baseQuery,
        q: "repo sync",
        page: 3
      },
      locale: "en",
      sessionUser: null,
      mode: "live"
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(result.degraded).toBe(true);
    expect(result.errorMessage).toBe("backend unavailable");
    expect(result.payload.items).toEqual([]);
    expect(result.payload.categories).toEqual([]);
    expect(result.payload.stats).toEqual({
      total_skills: 0,
      matching_skills: 0
    });
    expect(result.payload.pagination).toEqual({
      page: 3,
      page_size: 24,
      total_items: 0,
      total_pages: 3,
      prev_page: 2,
      next_page: 0
    });
    expect(result.payload.filters.q).toBe("repo sync");
  });
});
