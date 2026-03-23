import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public results route entrypoint", () => {
  it("routes the results page through the shared results route helper", () => {
    const routeSource = readAppFile("app/(public)/results/page.tsx");

    expect(routeSource).toContain('from "@/src/features/public/publicResultsRouteEntry"');
    expect(routeSource).not.toContain("PublicSearchPage");
    expect(routeSource).not.toContain("fetchMarketplace");
    expect(routeSource).not.toContain("buildPublicSearchPageModel");
    expect(routeSource).not.toContain("next/headers");
  });
});
