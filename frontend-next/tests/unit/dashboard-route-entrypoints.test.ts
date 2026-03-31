import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  adminOverviewRoute,
  protectedDashboardRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("dashboard compatibility route entrypoints", () => {
  it("keeps the dashboard index redirect aligned with the protected route contract", () => {
    const routeSource = readAppFile("app/dashboard/page.tsx");

    expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
    expect(routeSource).toContain("adminOverviewRoute");
    expect(routeSource).not.toContain(`redirect("${adminOverviewRoute}")`);
  });

  it("routes dashboard compatibility paths through protected route constants", () => {
    const routeSource = readAppFile("app/dashboard/[...slug]/page.tsx");

    expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
    expect(routeSource).toContain("adminRoutePrefix");
    expect(routeSource).toContain("protectedDashboardRoute");
    expect(routeSource).not.toContain("`/admin/${slug.join(\"/\")}");
    expect(routeSource).not.toContain('"/admin/"');
    expect(routeSource).not.toContain(`"${protectedDashboardRoute}"`);
  });
});
