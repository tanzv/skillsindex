import { describe, expect, it, vi } from "vitest";

import {
  buildPublicMarketplaceWarmupTargets,
  prefetchPublicMarketplaceRoutes,
  shouldWarmPublicMarketplaceRoutesInDev,
  warmPublicMarketplaceRoutes
} from "@/src/features/public/marketplace/publicRouteWarmup";

describe("public route warmup", () => {
  it("builds stable warmup targets from public route builders", () => {
    expect(buildPublicMarketplaceWarmupTargets((route) => `/light${route}`, "/login")).toEqual([
      "/light/categories",
      "/light/rankings",
      "/light/results",
      "/login"
    ]);
  });

  it("deduplicates additional authentication warmup targets", () => {
    expect(buildPublicMarketplaceWarmupTargets((route) => route, "/rankings")).toEqual([
      "/categories",
      "/rankings",
      "/results"
    ]);
  });

  it("warms public routes with HEAD requests and same-origin credentials", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await warmPublicMarketplaceRoutes(fetchImpl, ["/categories", "/rankings"]);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenNthCalledWith(1, "/categories", {
      method: "HEAD",
      credentials: "same-origin"
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(2, "/rankings", {
      method: "HEAD",
      credentials: "same-origin"
    });
  });

  it("ignores individual warmup request failures", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("compile failed"))
      .mockResolvedValueOnce({ ok: true });

    await expect(warmPublicMarketplaceRoutes(fetchImpl, ["/categories", "/rankings"])).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("prefetches each public marketplace route once through the app router", () => {
    const prefetchImpl = vi.fn();

    prefetchPublicMarketplaceRoutes(prefetchImpl, ["/login", "/categories", "/rankings"]);

    expect(prefetchImpl).toHaveBeenCalledTimes(3);
    expect(prefetchImpl).toHaveBeenNthCalledWith(1, "/login");
    expect(prefetchImpl).toHaveBeenNthCalledWith(2, "/categories");
    expect(prefetchImpl).toHaveBeenNthCalledWith(3, "/rankings");
  });

  it("keeps dev marketplace route warmup disabled by default", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_MARKETPLACE_WARMUP", undefined);

    expect(shouldWarmPublicMarketplaceRoutesInDev()).toBe(false);
  });

  it("allows dev marketplace route warmup when explicitly enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_MARKETPLACE_WARMUP", "true");

    expect(shouldWarmPublicMarketplaceRoutesInDev()).toBe(true);
  });
});
