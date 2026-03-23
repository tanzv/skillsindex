import { describe, expect, it } from "vitest";

import {
  canonicalPublicRoutePrefixes,
  compatibilityPublicRoutePrefixes,
  publicDocsTopNavMatchPrefixes,
  publicMarketplaceTopNavMatchPrefixes,
  publicRouteEntries
} from "@/src/lib/routing/publicRouteRegistry";

describe("public route registry", () => {
  it("keeps public route entries, canonical prefixes, and compatibility prefixes explicit", () => {
    expect(publicRouteEntries).toEqual([
      "/",
      "/search",
      "/results",
      "/categories",
      "/compare",
      "/rankings",
      "/rollout",
      "/timeline",
      "/governance",
      "/docs",
      "/about",
      "/login"
    ]);

    expect(canonicalPublicRoutePrefixes).toEqual([
      "/",
      "/results",
      "/categories",
      "/rankings",
      "/rollout",
      "/timeline",
      "/governance",
      "/docs",
      "/about",
      "/login",
      "/skills",
      "/states"
    ]);

    expect(compatibilityPublicRoutePrefixes).toEqual(["/search", "/compare"]);
  });

  it("keeps top-level app navigation route groupings aligned with the public route registry", () => {
    expect(publicMarketplaceTopNavMatchPrefixes).toEqual([
      "/",
      "/search",
      "/compare",
      "/results",
      "/categories",
      "/skills",
      "/rankings",
      "/rollout",
      "/timeline",
      "/governance",
      "/states"
    ]);

    expect(publicDocsTopNavMatchPrefixes).toEqual(["/docs", "/about"]);
  });
});
