import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public landing route entrypoint", () => {
  it("routes the landing page through the shared landing route helper", () => {
    const routeSource = readAppFile("app/(public)/page.tsx");

    expect(routeSource).toContain('from "@/src/features/public/publicLandingRouteEntry"');
    expect(routeSource).not.toContain("fetchMarketplace");
    expect(routeSource).not.toContain("buildPublicMarketplaceFallback");
    expect(routeSource).not.toContain("next/headers");
  });
});
