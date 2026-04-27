import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public route search params split", () => {
  it("keeps public route helpers on the shared search-param parser instead of inlining field extraction", () => {
    const resultsSource = readRepoFile("src/features/public/publicResultsRouteEntry.tsx");
    const categorySource = readRepoFile("src/features/public/publicCategoryRouteEntry.tsx");
    const detailSource = readRepoFile("src/features/public/publicCategoryDetailRouteEntry.tsx");
    const rankingSource = readRepoFile("src/features/public/publicRankingRouteLoader.ts");

    for (const source of [resultsSource, categorySource, detailSource, rankingSource]) {
      expect(source).toContain('from "./publicRouteSearchParams"');
      expect(source).not.toContain("typeof resolvedSearchParams.");
    }
  });
});
