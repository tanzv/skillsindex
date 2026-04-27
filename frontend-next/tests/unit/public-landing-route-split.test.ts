import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public landing route split", () => {
  it("keeps the landing page focused on render composition and delegates derivation to the page model", () => {
    const pageSource = readRepoFile("src/features/public/PublicLanding.tsx");

    expect(pageSource).toContain('from "./publicLandingPageModel"');
    expect(pageSource).toContain('from "./marketplace/MarketplaceEntrySearchPanel"');
    expect(pageSource).not.toContain("useMemo");
    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).not.toContain('from "./marketplace/MarketplaceSearchPanel"');
    expect(pageSource).not.toContain('from "./marketplace/publicSkillBatchWarmup"');
  });
});
