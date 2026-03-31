import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("account route entrypoints", () => {
  it("keeps the account index redirect aligned with the protected route contract", () => {
    const routeSource = readAppFile("app/(account)/account/page.tsx");

    expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
    expect(routeSource).toContain("accountProfileRoute");
    expect(routeSource).not.toContain('redirect("/account/profile")');
  });

  it("routes account pages through the shared account route helper and protected route contract", () => {
    const routeFiles = [
      { file: "app/(account)/account/profile/page.tsx", route: accountProfileRoute },
      { file: "app/(account)/account/security/page.tsx", route: accountSecurityRoute },
      { file: "app/(account)/account/sessions/page.tsx", route: accountSessionsRoute },
      { file: "app/(account)/account/api-credentials/page.tsx", route: accountApiCredentialsRoute }
    ];

    for (const { file, route } of routeFiles) {
      const routeSource = readAppFile(file);

      expect(routeSource).toContain('from "@/src/features/accountCenter/renderAccountRoute"');
      expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
      expect(routeSource).not.toContain("AccountCenterPage");
      expect(routeSource).not.toContain(`renderAccountRoute("${route}")`);
    }
  });
});
