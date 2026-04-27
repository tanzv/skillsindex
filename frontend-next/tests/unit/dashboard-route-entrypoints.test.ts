import { describe, expect, it } from "vitest";

import {
  adminOverviewRoute,
  protectedDashboardRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("dashboard compatibility route entrypoints", () => {
  it("keeps the dashboard index redirect aligned with the protected route contract", () => {
    const routeSource = expectRouteEntrypoint("app/dashboard/page.tsx", {
      requiredSnippets: ['from "@/src/lib/routing/protectedSurfaceLinks"', "adminOverviewRoute"],
      forbiddenSnippets: [`redirect("${adminOverviewRoute}")`]
    });

    expect(routeSource).toContain("redirect(adminOverviewRoute)");
  });

  it("routes dashboard compatibility paths through protected route constants", () => {
    const routeSource = expectRouteEntrypoint("app/dashboard/[...slug]/page.tsx", {
      requiredSnippets: [
        'from "@/src/lib/routing/protectedSurfaceLinks"',
        "adminRoutePrefix",
        "protectedDashboardRoute"
      ],
      forbiddenSnippets: ["`/admin/${slug.join(\"/\")}", '"/admin/"', `"${protectedDashboardRoute}"`]
    });

    expect(routeSource).toContain("buildQueryString");
  });
});
