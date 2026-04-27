import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public skill detail fallback split", () => {
  it("keeps the skill detail fallback decoupled from marketplace presentation builders", () => {
    const fallbackSource = readRepoFile("src/features/public/publicSkillDetailFallback.ts");

    expect(fallbackSource).not.toContain('from "./publicMarketplaceFallback"');
    expect(fallbackSource).not.toContain("from './publicMarketplaceFallback'");
    expect(fallbackSource).not.toContain('from "./publicMarketplaceFallbackCatalog"');
    expect(fallbackSource).not.toContain("from './publicMarketplaceFallbackCatalog'");
    expect(fallbackSource).not.toContain("marketplaceViewModel");
    expect(fallbackSource).not.toContain("marketplaceTaxonomy");
  });
});
