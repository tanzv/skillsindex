import { afterEach, describe, expect, it, vi } from "vitest";

import type { MarketplaceQueryParams } from "../../lib/api";
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
});
