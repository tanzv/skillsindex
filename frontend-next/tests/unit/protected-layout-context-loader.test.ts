import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("protected layout context loader", () => {
  it("loads session and locale in parallel, gates auth before i18n payload work, and reuses request-scoped caches", () => {
    const loaderSource = readSourceFile("src/features/protected/loadProtectedLayoutContext.ts");
    const sessionSource = readSourceFile("src/lib/auth/session.ts");
    const localeSource = readSourceFile("src/lib/i18n/serverLocale.ts");

    expect(loaderSource).toContain("await Promise.all([getServerSessionContext(), resolveServerLocale()])");
    expect(loaderSource).toContain("requireRouteSession(session, requiredRoute);");
    expect(loaderSource).toContain("await Promise.all([loadProtectedMessages(locale), loadProtectedPageMessages(locale)])");

    expect(sessionSource).toContain('import { cache } from "react";');
    expect(sessionSource).toContain("export const getServerSessionContext = cache(async (): Promise<SessionContext> => {");

    expect(localeSource).toContain('import { cache } from "react";');
    expect(localeSource).toContain("export const resolveServerLocale = cache(async (): Promise<PublicLocale> => {");
  });
});
