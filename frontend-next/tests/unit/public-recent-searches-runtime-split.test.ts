import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public recent searches runtime split", () => {
  it("keeps runtime recent-search cards free of fallback links", () => {
    const rankingPageSource = readRepoFile("src/features/public/PublicRankingPage.tsx");
    const searchPageSource = readRepoFile("src/features/public/PublicSearchPage.tsx");
    const categoryDetailSource = readRepoFile("src/features/public/PublicCategoryDetailPage.tsx");
    const sidebarSource = readRepoFile("src/features/public/marketplace/MarketplaceDiscoverySidebar.tsx");
    const cardSource = readRepoFile("src/features/public/marketplace/MarketplaceRecentSearchesCard.tsx");

    expect(rankingPageSource).not.toContain("recentSearchFallbackLinks");
    expect(searchPageSource).not.toContain("fallbackLinks");
    expect(categoryDetailSource).not.toContain("fallbackLinks");
    expect(sidebarSource).not.toContain("fallbackLinks");
    expect(cardSource).not.toContain("fallbackLinks");
  });
});
