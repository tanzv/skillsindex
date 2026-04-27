import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public search page split", () => {
  it("lazy-loads the results search panel and discovery sidebar", () => {
    const source = readRepoFile("src/features/public/PublicSearchPage.tsx");

    expect(source).toContain('dynamic(() =>');
    expect(source).toContain('import("./marketplace/MarketplaceSearchPanel")');
    expect(source).toContain('import("./marketplace/MarketplaceDiscoverySidebar")');
    expect(source).not.toContain('from "./marketplace/MarketplaceSearchPanel"');
    expect(source).not.toContain('from "./marketplace/MarketplaceDiscoverySidebar"');
  });
});
