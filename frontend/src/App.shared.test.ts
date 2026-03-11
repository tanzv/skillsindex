import { describe, expect, it } from "vitest";
import {
  buildLoginRedirectPath,
  isMarketplaceRoute,
  resolvePostLoginRedirect,
  resolveLegacyPublicRouteRedirect,
  resolvePublicLocaleSwitchMode,
  shouldRequireSession,
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

describe("isMarketplaceRoute", () => {
  it("marks marketplace public routes as marketplace-scoped", () => {
    expect(isMarketplaceRoute("/")).toBe(true);
    expect(isMarketplaceRoute("/results")).toBe(true);
    expect(isMarketplaceRoute("/compare")).toBe(true);
    expect(isMarketplaceRoute("/docs")).toBe(true);
    expect(isMarketplaceRoute("/categories")).toBe(true);
    expect(isMarketplaceRoute("/categories/:slug")).toBe(true);
    expect(isMarketplaceRoute("/rankings")).toBe(true);
    expect(isMarketplaceRoute("/skills/:id")).toBe(true);
  });

  it("does not mark non-marketplace routes", () => {
    expect(isMarketplaceRoute("/login")).toBe(false);
    expect(isMarketplaceRoute("/prototype")).toBe(false);
    expect(isMarketplaceRoute("/admin/overview")).toBe(false);
    expect(isMarketplaceRoute("/account/profile")).toBe(false);
  });
});

describe("shouldRequireSession", () => {
  it("always requires a session for protected routes", () => {
    expect(shouldRequireSession("/admin/overview", true)).toBe(true);
    expect(shouldRequireSession("/account/profile", true)).toBe(true);
  });

  it("requires a session for marketplace routes when marketplace access is private", () => {
    expect(shouldRequireSession("/", false)).toBe(true);
    expect(shouldRequireSession("/skills/:id", false)).toBe(true);
    expect(shouldRequireSession("/categories", false)).toBe(true);
  });

  it("keeps marketplace routes public when marketplace access is public", () => {
    expect(shouldRequireSession("/", true)).toBe(false);
    expect(shouldRequireSession("/skills/:id", true)).toBe(false);
    expect(shouldRequireSession("/categories/:slug", true)).toBe(false);
  });
});

describe("buildLoginRedirectPath", () => {
  it("keeps current public prefix and preserves the return target", () => {
    expect(buildLoginRedirectPath("/skills/11", "?tab=files", "#readme")).toBe(
      "/login?redirect=%2Fskills%2F11%3Ftab%3Dfiles%23readme"
    );
    expect(buildLoginRedirectPath("/light/skills/11", "", "")).toBe(
      "/light/login?redirect=%2Flight%2Fskills%2F11"
    );
    expect(buildLoginRedirectPath("/mobile/light/categories/qa", "?page=2")).toBe(
      "/mobile/light/login?redirect=%2Fmobile%2Flight%2Fcategories%2Fqa%3Fpage%3D2"
    );
  });
});

describe("resolvePostLoginRedirect", () => {
  it("returns a safe local redirect target when present", () => {
    expect(resolvePostLoginRedirect("?redirect=%2Fskills%2F11%3Ftab%3Dfiles")).toBe("/skills/11?tab=files");
    expect(resolvePostLoginRedirect("?foo=bar&redirect=%2Flight%2Frankings")).toBe("/light/rankings");
  });

  it("falls back when redirect is missing or unsafe", () => {
    expect(resolvePostLoginRedirect("")).toBe("/");
    expect(resolvePostLoginRedirect("?redirect=https%3A%2F%2Fevil.example")).toBe("/");
    expect(resolvePostLoginRedirect("?redirect=%2F%2Fevil.example")).toBe("/");
    expect(resolvePostLoginRedirect("?redirect=%2Flight%2Flogin")).toBe("/");
  });
});
