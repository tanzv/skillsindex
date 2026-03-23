import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("account route entrypoints", () => {
  it("routes account pages through the shared account route helper", () => {
    const profileRoute = readAppFile("app/(account)/account/profile/page.tsx");
    const securityRoute = readAppFile("app/(account)/account/security/page.tsx");
    const sessionsRoute = readAppFile("app/(account)/account/sessions/page.tsx");
    const credentialsRoute = readAppFile("app/(account)/account/api-credentials/page.tsx");

    for (const routeSource of [profileRoute, securityRoute, sessionsRoute, credentialsRoute]) {
      expect(routeSource).toContain('from "@/src/features/accountCenter/renderAccountRoute"');
      expect(routeSource).not.toContain("AccountCenterPage");
    }
  });
});
