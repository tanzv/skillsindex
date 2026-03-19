import { describe, expect, it } from "vitest";

import {
  buildPublicLinkTarget,
  buildPublicPrefix,
  buildPublicRouteCompatibilityRedirect,
  buildPublicRouteCompatibilityRewrite,
  splitPublicPathPrefix,
  withPublicPathPrefix
} from "@/src/lib/routing/publicCompat";

describe("public compatibility helpers", () => {
  it("splits public prefixes into stable route state", () => {
    expect(splitPublicPathPrefix("/results")).toEqual({
      prefix: "",
      corePath: "/results",
      isLightTheme: false,
      isMobileLayout: false
    });

    expect(splitPublicPathPrefix("/light/categories/operations")).toEqual({
      prefix: "/light",
      corePath: "/categories/operations",
      isLightTheme: true,
      isMobileLayout: false
    });

    expect(splitPublicPathPrefix("/mobile/light/rankings")).toEqual({
      prefix: "/mobile/light",
      corePath: "/rankings",
      isLightTheme: true,
      isMobileLayout: true
    });
  });

  it("rebuilds prefixed public routes predictably", () => {
    expect(buildPublicPrefix(false, false)).toBe("");
    expect(buildPublicPrefix(true, false)).toBe("/light");
    expect(buildPublicPrefix(false, true)).toBe("/mobile");
    expect(buildPublicPrefix(true, true)).toBe("/mobile/light");
    expect(withPublicPathPrefix("", "/results")).toBe("/results");
    expect(withPublicPathPrefix("/light", "/results")).toBe("/light/results");
    expect(withPublicPathPrefix("/mobile/light", "/categories")).toBe("/mobile/light/categories");
  });

  it("redirects legacy search and compare compatibility paths to the canonical public routes", () => {
    expect(buildPublicRouteCompatibilityRedirect("/search", "?q=release")).toBe("/results?q=release");
    expect(buildPublicRouteCompatibilityRedirect("/compare", "?left=101&right=102")).toBe("/rankings?left=101&right=102");
    expect(buildPublicRouteCompatibilityRedirect("/mobile/light/search", "?q=planner")).toBe("/mobile/light/results?q=planner");
    expect(buildPublicRouteCompatibilityRedirect("/light/compare")).toBe("/light/rankings");
    expect(buildPublicRouteCompatibilityRedirect("/rankings")).toBeNull();
  });

  it("rewrites prefixed public routes back to the canonical app paths", () => {
    expect(buildPublicRouteCompatibilityRewrite("/light/results", "?q=release")).toBe("/results?q=release");
    expect(buildPublicRouteCompatibilityRewrite("/mobile/light/categories/operations")).toBe("/categories/operations");
    expect(buildPublicRouteCompatibilityRewrite("/mobile/light/search", "?q=release")).toBeNull();
    expect(buildPublicRouteCompatibilityRewrite("/workspace")).toBeNull();
  });

  it("builds stable link targets for prefixed public routes without touching protected or external paths", () => {
    expect(buildPublicLinkTarget("/light", "/results?q=release")).toEqual({
      href: "/results?q=release",
      as: "/light/results?q=release"
    });

    expect(buildPublicLinkTarget("/light", "/light/skills/103")).toEqual({
      href: "/skills/103",
      as: "/light/skills/103"
    });

    expect(buildPublicLinkTarget("/light", "/categories/operations")).toEqual({
      href: "/categories/operations",
      as: "/light/categories/operations"
    });

    expect(buildPublicLinkTarget("/light", "/workspace")).toEqual({
      href: "/workspace"
    });

    expect(buildPublicLinkTarget("/light", "https://example.com/docs")).toEqual({
      href: "https://example.com/docs"
    });
  });
});
