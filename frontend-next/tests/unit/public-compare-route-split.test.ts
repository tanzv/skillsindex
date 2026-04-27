import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public compare route split", () => {
  it("keeps the compare page free of direct compare and taxonomy derivation helpers", () => {
    const pageSource = readRepoFile("src/features/public/PublicComparePage.tsx");

    expect(pageSource).toContain('from "./publicComparePageModel"');
    expect(pageSource).not.toContain('from "./publicCompareModel"');
    expect(pageSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
  });
});
