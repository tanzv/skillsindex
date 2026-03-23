import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public skill detail fallback split", () => {
  it("keeps the skill detail fallback decoupled from marketplace presentation builders", () => {
    const fallbackSource = readSourceFile("src/features/public/publicSkillDetailFallback.ts");

    expect(fallbackSource).not.toContain('from "./publicMarketplaceFallback"');
    expect(fallbackSource).not.toContain("from './publicMarketplaceFallback'");
    expect(fallbackSource).not.toContain('from "./publicMarketplaceFallbackCatalog"');
    expect(fallbackSource).not.toContain("from './publicMarketplaceFallbackCatalog'");
    expect(fallbackSource).not.toContain("marketplaceViewModel");
    expect(fallbackSource).not.toContain("marketplaceTaxonomy");
  });
});
