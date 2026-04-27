import { describe, expect, it } from "vitest";

import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("account route entrypoints", () => {
  it("keeps the account index redirect aligned with the protected route contract", () => {
    const routeSource = expectRouteEntrypoint("app/(account)/account/page.tsx", {
      requiredSnippets: ['from "@/src/lib/routing/protectedSurfaceLinks"', "accountProfileRoute"],
      forbiddenSnippets: ['redirect("/account/profile")']
    });

    expect(routeSource).toContain("redirect(accountProfileRoute)");
  });

  it("routes account pages through the shared account route helper and protected route contract", () => {
    const routeFiles = [
      { file: "app/(account)/account/profile/page.tsx", route: accountProfileRoute },
      { file: "app/(account)/account/security/page.tsx", route: accountSecurityRoute },
      { file: "app/(account)/account/sessions/page.tsx", route: accountSessionsRoute },
      { file: "app/(account)/account/api-credentials/page.tsx", route: accountApiCredentialsRoute }
    ];

    for (const { file, route } of routeFiles) {
      const routeSource = expectRouteEntrypoint(file, {
        requiredSnippets: [
          'from "@/src/features/accountCenter/renderAccountRoute"',
          'from "@/src/lib/routing/protectedSurfaceLinks"'
        ],
        forbiddenSnippets: ["AccountCenterPage", `renderAccountRoute("${route}")`]
      });

      expect(routeSource).toContain("renderAccountRoute(");
    }
  });
});
