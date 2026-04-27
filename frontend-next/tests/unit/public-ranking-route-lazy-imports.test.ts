import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public ranking route lazy imports", () => {
  it("lazy-loads the ranking page from the shared route helper", () => {
    const routeEntrySource = readRepoFile("src/features/public/publicRankingRouteEntry.tsx");

    expect(routeEntrySource).toContain('await import("./PublicRankingPage")');
    expect(routeEntrySource).not.toContain('import { PublicRankingPage } from "./PublicRankingPage";');
  });
});
