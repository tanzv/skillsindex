import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { publicRankingsRoute, publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public compatibility route entrypoints", () => {
  it("routes the legacy search page through the shared compatibility helper", () => {
    const routeSource = readAppFile("app/(public)/search/page.tsx");

    expect(routeSource).toContain('from "@/src/features/public/publicCompatibilityRouteEntry"');
    expect(routeSource).toContain('from "@/src/lib/routing/publicRouteRegistry"');
    expect(routeSource).toContain("publicResultsRoute");
    expect(routeSource).not.toContain('from "next/navigation"');
    expect(routeSource).not.toContain("URLSearchParams");
    expect(routeSource).not.toContain('"/results?"');
    expect(routeSource).not.toContain(`canonicalRoute: "${publicResultsRoute}"`);
  });

  it("routes the legacy compare page through the shared compatibility helper", () => {
    const routeSource = readAppFile("app/(public)/compare/page.tsx");

    expect(routeSource).toContain('from "@/src/features/public/publicCompatibilityRouteEntry"');
    expect(routeSource).toContain('from "@/src/lib/routing/publicRouteRegistry"');
    expect(routeSource).toContain("publicRankingsRoute");
    expect(routeSource).not.toContain('from "next/navigation"');
    expect(routeSource).not.toContain("URLSearchParams");
    expect(routeSource).not.toContain('params.set("sort", "stars")');
    expect(routeSource).not.toContain(`canonicalRoute: "${publicRankingsRoute}"`);
  });
});
