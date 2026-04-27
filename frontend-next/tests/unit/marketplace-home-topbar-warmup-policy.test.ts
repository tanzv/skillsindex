import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("marketplace home topbar warmup policy", () => {
  it("consults the shared dev warmup policy before prefetching marketplace routes", () => {
    const source = readRepoFile("src/features/public/marketplace/MarketplaceHomeTopbar.tsx");

    expect(source).toContain("shouldWarmPublicMarketplaceRoutesInDev");
  });
});
