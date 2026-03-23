import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public recent searches runtime split", () => {
  it("keeps runtime recent-search cards free of fallback links", () => {
    const rankingPageSource = readSourceFile("src/features/public/PublicRankingPage.tsx");
    const searchPageSource = readSourceFile("src/features/public/PublicSearchPage.tsx");
    const categoryDetailSource = readSourceFile("src/features/public/PublicCategoryDetailPage.tsx");
    const sidebarSource = readSourceFile("src/features/public/marketplace/MarketplaceDiscoverySidebar.tsx");
    const cardSource = readSourceFile("src/features/public/marketplace/MarketplaceRecentSearchesCard.tsx");

    expect(rankingPageSource).not.toContain("recentSearchFallbackLinks");
    expect(searchPageSource).not.toContain("fallbackLinks");
    expect(categoryDetailSource).not.toContain("fallbackLinks");
    expect(sidebarSource).not.toContain("fallbackLinks");
    expect(cardSource).not.toContain("fallbackLinks");
  });
});
