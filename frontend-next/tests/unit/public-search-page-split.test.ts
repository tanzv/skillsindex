import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public search page split", () => {
  it("lazy-loads the results search panel and discovery sidebar", () => {
    const source = readSourceFile("src/features/public/PublicSearchPage.tsx");

    expect(source).toContain('dynamic(() =>');
    expect(source).toContain('import("./marketplace/MarketplaceSearchPanel")');
    expect(source).toContain('import("./marketplace/MarketplaceDiscoverySidebar")');
    expect(source).not.toContain('from "./marketplace/MarketplaceSearchPanel"');
    expect(source).not.toContain('from "./marketplace/MarketplaceDiscoverySidebar"');
  });
});
