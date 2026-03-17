import { describe, expect, it } from "vitest";

import {
  defaultAuthenticatedRedirect,
  hasSessionCookie,
  sessionCookieName,
  shouldAllowAnonymousAccess,
  shouldRedirectAuthenticatedUser
} from "@/src/lib/auth/middleware";
import { buildBackendProxyPath, buildProxyResponseHeaders } from "@/src/lib/bff/proxy";
import { buildLoginRedirectPath } from "@/src/lib/auth/guards";
import { appTopNavItems, publicRoutes } from "@/src/lib/routing/routes";

describe("auth routing contracts", () => {
  it("builds login redirects with the current target path", () => {
    expect(buildLoginRedirectPath("/admin/overview")).toBe("/login?redirect=%2Fadmin%2Foverview");
  });

  it("recognizes the server session cookie", () => {
    expect(sessionCookieName).toBe("skillsindex_session");
    expect(hasSessionCookie(new Headers({ cookie: "skillsindex_session=token-1; skillsindex_csrf=csrf-1" }))).toBe(true);
    expect(hasSessionCookie(new Headers({ cookie: "other=token-1" }))).toBe(false);
  });

  it("keeps public pages anonymous and redirects authenticated users away from login", () => {
    expect(shouldAllowAnonymousAccess("/")).toBe(true);
    expect(shouldAllowAnonymousAccess("/search")).toBe(true);
    expect(shouldAllowAnonymousAccess("/login")).toBe(true);
    expect(shouldAllowAnonymousAccess("/workspace")).toBe(false);
    expect(shouldRedirectAuthenticatedUser("/login")).toBe(true);
    expect(shouldRedirectAuthenticatedUser("/search")).toBe(false);
    expect(defaultAuthenticatedRedirect).toBe("/workspace");
  });

  it("registers public discovery routes in the top navigation contract", () => {
    expect(publicRoutes).toContain("/results");
    expect(publicRoutes).toContain("/rankings");

    expect(appTopNavItems[0]?.matchPrefixes).toEqual(
      expect.arrayContaining(["/results", "/rankings", "/states"])
    );
  });

  it("builds backend proxy paths under /api/v1", () => {
    expect(buildBackendProxyPath(["admin", "overview"])).toBe("/api/v1/admin/overview");
    expect(buildBackendProxyPath(["public", "skills", "42"], "tab=files")).toBe("/api/v1/public/skills/42?tab=files");
  });

  it("marks proxied API responses as non-cacheable while preserving passthrough headers", () => {
    const source = new Headers({
      "content-type": "application/json",
      location: "/login",
      "set-cookie": "skillsindex_session=token-1; Path=/; HttpOnly"
    });

    const headers = buildProxyResponseHeaders(source);

    expect(headers.get("cache-control")).toBe("no-store, max-age=0, must-revalidate");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("location")).toBe("/login");
    expect(headers.get("set-cookie")).toContain("skillsindex_session=token-1");
  });
});
