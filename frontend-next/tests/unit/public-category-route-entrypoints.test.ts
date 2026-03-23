import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public category route entrypoints", () => {
  it("routes the category hub entry through the shared category route helper", () => {
    const hubRoute = readAppFile("app/(public)/categories/page.tsx");

    expect(hubRoute).toContain('from "@/src/features/public/publicCategoryRouteEntry"');
    expect(hubRoute).not.toContain("PublicCategoryPage");
    expect(hubRoute).not.toContain("PublicCategoryDetailPage");
    expect(hubRoute).not.toContain("fetchMarketplace");
  });

  it("routes the category detail entry through the shared detail route helper", () => {
    const detailRoute = readAppFile("app/(public)/categories/[slug]/page.tsx");

    expect(detailRoute).toContain('from "@/src/features/public/publicCategoryDetailRouteEntry"');
    expect(detailRoute).not.toContain("PublicCategoryDetailPage");
    expect(detailRoute).not.toContain("PublicCategoryPage");
    expect(detailRoute).not.toContain("fetchMarketplace");
  });
});
