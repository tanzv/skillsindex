import { describe, expect, it } from "vitest";
import { resolveLegacyPublicRouteRedirect, resolvePublicLocaleSwitchMode } from "./App.shared";

describe("resolvePublicLocaleSwitchMode", () => {
  it("resolves overlay mode when explicitly configured", () => {
    expect(resolvePublicLocaleSwitchMode("overlay")).toBe("overlay");
    expect(resolvePublicLocaleSwitchMode(" OVERLAY ")).toBe("overlay");
  });

  it("falls back to hidden for unsupported values", () => {
    expect(resolvePublicLocaleSwitchMode("")).toBe("hidden");
    expect(resolvePublicLocaleSwitchMode("drawer")).toBe("hidden");
    expect(resolvePublicLocaleSwitchMode(undefined)).toBe("hidden");
  });
});

describe("resolveLegacyPublicRouteRedirect", () => {
  it("redirects legacy docs and compare roots to semantic routes", () => {
    expect(resolveLegacyPublicRouteRedirect("/docs")).toBe("/categories");
    expect(resolveLegacyPublicRouteRedirect("/compare/")).toBe("/rankings");
  });

  it("keeps light and mobile prefixes when redirecting legacy roots", () => {
    expect(resolveLegacyPublicRouteRedirect("/light/docs")).toBe("/light/categories");
    expect(resolveLegacyPublicRouteRedirect("/mobile/light/compare")).toBe("/mobile/light/rankings");
  });

  it("preserves query and hash when redirecting legacy roots", () => {
    expect(resolveLegacyPublicRouteRedirect("/compare", "?left=901&right=902")).toBe(
      "/rankings?left=901&right=902"
    );
    expect(resolveLegacyPublicRouteRedirect("/docs", "", "#api")).toBe("/categories#api");
    expect(resolveLegacyPublicRouteRedirect("/light/compare", "?left=1", "#focus")).toBe(
      "/light/rankings?left=1#focus"
    );
  });

  it("ignores non-legacy routes", () => {
    expect(resolveLegacyPublicRouteRedirect("/")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/categories")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/rankings")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/docs/api")).toBeNull();
  });
});
