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
  it("redirects legacy compare roots to rankings routes", () => {
    expect(resolveLegacyPublicRouteRedirect("/compare/")).toBe("/rankings");
  });

  it("keeps light and mobile prefixes when redirecting compare roots", () => {
    expect(resolveLegacyPublicRouteRedirect("/mobile/light/compare")).toBe("/mobile/light/rankings");
  });

  it("preserves query and hash when redirecting compare roots", () => {
    expect(resolveLegacyPublicRouteRedirect("/compare", "?left=901&right=902")).toBe(
      "/rankings?left=901&right=902"
    );
    expect(resolveLegacyPublicRouteRedirect("/light/compare", "?left=1", "#focus")).toBe(
      "/light/rankings?left=1#focus"
    );
  });

  it("ignores non-legacy or active routes", () => {
    expect(resolveLegacyPublicRouteRedirect("/")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/docs")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/mobile/light/docs", "", "#api")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/categories")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/rankings")).toBeNull();
    expect(resolveLegacyPublicRouteRedirect("/docs/api")).toBeNull();
  });
});
