import { describe, expect, it } from "vitest";
import {
  resolveLegacyPublicRouteRedirect,
  resolvePublicLocaleSwitchMode,
  shouldShowPublicGlobalControls
} from "./App.shared";

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

describe("shouldShowPublicGlobalControls", () => {
  it("hides controls for static public routes", () => {
    expect(shouldShowPublicGlobalControls("/", "/")).toBe(false);
    expect(shouldShowPublicGlobalControls("/results", "/results")).toBe(false);
    expect(shouldShowPublicGlobalControls("/docs", "/docs")).toBe(false);
    expect(shouldShowPublicGlobalControls("/categories", "/categories")).toBe(false);
    expect(shouldShowPublicGlobalControls("/categories/:slug", "/categories/automation")).toBe(false);
    expect(shouldShowPublicGlobalControls("/rankings", "/rankings")).toBe(false);
    expect(shouldShowPublicGlobalControls("/skills/:id", "/skills/42")).toBe(false);
  });

  it("hides controls for workspace prototype route family", () => {
    expect(shouldShowPublicGlobalControls("/prototype", "/workspace")).toBe(false);
    expect(shouldShowPublicGlobalControls("/prototype", "/workspace/activity")).toBe(false);
    expect(shouldShowPublicGlobalControls("/prototype", "/light/workspace/queue")).toBe(false);
    expect(shouldShowPublicGlobalControls("/prototype", "/mobile/light/workspace/actions")).toBe(false);
  });

  it("hides controls for all other routes as well", () => {
    expect(shouldShowPublicGlobalControls("/prototype", "/governance")).toBe(false);
    expect(shouldShowPublicGlobalControls("/prototype", "/light/governance/policy")).toBe(false);
    expect(shouldShowPublicGlobalControls("/prototype", "/admin/accounts")).toBe(false);
    expect(shouldShowPublicGlobalControls("/prototype", "/rollout")).toBe(false);
  });
});
