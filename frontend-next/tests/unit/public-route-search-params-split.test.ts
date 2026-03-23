import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public route search params split", () => {
  it("keeps public route helpers on the shared search-param parser instead of inlining field extraction", () => {
    const resultsSource = readSourceFile("src/features/public/publicResultsRouteEntry.tsx");
    const categorySource = readSourceFile("src/features/public/publicCategoryRouteEntry.tsx");
    const detailSource = readSourceFile("src/features/public/publicCategoryDetailRouteEntry.tsx");
    const rankingSource = readSourceFile("src/features/public/publicRankingRouteLoader.ts");

    for (const source of [resultsSource, categorySource, detailSource, rankingSource]) {
      expect(source).toContain('from "./publicRouteSearchParams"');
      expect(source).not.toContain("typeof resolvedSearchParams.");
    }
  });
});
