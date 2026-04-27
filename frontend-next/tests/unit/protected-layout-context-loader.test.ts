import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("protected layout context loader", () => {
  it("loads session and locale in parallel, gates auth before i18n payload work, and reuses request-scoped caches", () => {
    const loaderSource = readRepoFile("src/features/protected/loadProtectedLayoutContext.ts");
    const sessionSource = readRepoFile("src/lib/auth/session.ts");
    const localeSource = readRepoFile("src/lib/i18n/serverLocale.ts");

    expect(loaderSource).toContain("await Promise.all([getServerSessionContext(), resolveServerLocale(), cookies()])");
    expect(loaderSource).toContain("requireRouteSession(session, requiredRoute);");
    expect(loaderSource).toContain("await Promise.all([loadProtectedMessages(locale), loadProtectedPageMessages(locale)])");
    expect(loaderSource).toContain("resolveThemePreferenceFromCookieValue(cookieStore.get(sharedThemeCookieName)?.value)");

    expect(sessionSource).toContain('import { cache } from "react";');
    expect(sessionSource).toContain("export const getServerSessionContext = cache(async (): Promise<SessionContext> => {");

    expect(localeSource).toContain('import { cache } from "react";');
    expect(localeSource).toContain("export const resolveServerLocale = cache(async (): Promise<PublicLocale> => {");
  });
});
