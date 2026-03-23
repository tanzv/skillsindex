import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public landing route split", () => {
  it("keeps the landing page focused on render composition and delegates derivation to the page model", () => {
    const pageSource = readSourceFile("src/features/public/PublicLanding.tsx");

    expect(pageSource).toContain('from "./publicLandingPageModel"');
    expect(pageSource).toContain('from "./marketplace/MarketplaceEntrySearchPanel"');
    expect(pageSource).not.toContain("useMemo");
    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).not.toContain('from "./marketplace/MarketplaceSearchPanel"');
    expect(pageSource).not.toContain('from "./marketplace/publicSkillBatchWarmup"');
  });
});
