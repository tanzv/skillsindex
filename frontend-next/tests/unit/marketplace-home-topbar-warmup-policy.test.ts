import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("marketplace home topbar warmup policy", () => {
  it("consults the shared dev warmup policy before prefetching marketplace routes", () => {
    const source = readSourceFile("src/features/public/marketplace/MarketplaceHomeTopbar.tsx");

    expect(source).toContain("shouldWarmPublicMarketplaceRoutesInDev");
  });
});
