import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public auth optimization", () => {
  it("keeps the public layout on a cookie-level auth hint instead of a blocking session fetch", () => {
    const layoutSource = readRepoFile("app/(public)/layout.tsx");

    expect(layoutSource).toContain('from "@/src/lib/auth/middleware"');
    expect(layoutSource).toContain("hasSessionCookie(requestHeaders)");
    expect(layoutSource).not.toContain('from "@/src/lib/auth/session"');
    expect(layoutSource).not.toContain("getServerSessionContext()");
  });

  it("keeps the login route entry thin and resolves the full session inside the route renderer only when a session cookie is present", () => {
    const loginPageSource = readRepoFile("app/login/page.tsx");
    const loginRouteSource = readRepoFile("src/features/auth/renderLoginRoute.tsx");

    expect(loginPageSource).toContain('from "@/src/features/auth/renderLoginRoute"');
    expect(loginPageSource).toContain("await renderLoginRoute(searchParams)");
    expect(loginPageSource).not.toContain("getServerSessionContext()");
    expect(loginRouteSource).toContain("if (!hasSessionCookie(requestHeaders))");
    expect(loginRouteSource).toContain("const session = await getServerSessionContext()");
    expect(loginRouteSource).toContain("if (isAuthenticatedSession(session))");
  });
});
