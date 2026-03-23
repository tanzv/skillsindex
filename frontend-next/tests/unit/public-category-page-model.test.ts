import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import { buildPublicCategoryPageModel } from "@/src/features/public/publicCategoryPageModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  categoryAllSubcategories: "All Subcategories",
  categoryBrowseDescription: "Browse the full category directory.",
  categoryBrowseTitle: "Browse Categories",
  categoryFeaturedDescription: "Explore curated category collections.",
  categoryFeaturedTitle: "Featured Collections",
  categoryHubAllCategories: "All Categories",
  categoryHubAudienceAgent: "Agent",
  categoryHubAudienceAgentDescription: "Agent-first browsing.",
  categoryHubAudienceHuman: "Human",
  categoryHubAudienceHumanDescription: "Human-first browsing.",
  categoryHubAudienceLabel: "Audience",
  categoryHubBrowseDescription: "Browse the full spotlight stream.",
  categoryHubBrowseTitle: "Browse the Category Stream",
  categoryHubFeaturedDescription: "Featured skills for this audience.",
  categoryHubFeaturedTitle: "Featured",
  categoryHubMostInstalledDescription: "Most installed skills.",
  categoryHubMostInstalledTitle: "Most Installed",
  categoryHubPopularDescription: "Popular public skills.",
  categoryHubPopularTitle: "Popular",
  categoryHubRecentlyUpdatedDescription: "Recently updated skills.",
  categoryHubRecentlyUpdatedTitle: "Recently Updated",
  rankingCategoryLeadersDescription: "Rank distribution by category.",
  rankingCategoryLeadersTitle: "Category Leaders",
  rankingOpenSkillLabel: "Open Skill",
  resultsCategoryPivotsDescription: "Pivot by tags and categories.",
  resultsCategoryPivotsTitle: "Category Pivots",
  shellCategories: "Categories",
  shellRankings: "Rankings",
  shellSearch: "Search",
  skillCountSuffix: "skills",
  skillQualitySuffix: "quality",
  statCategories: "Categories",
  statTopStars: "Top Stars",
  statTopTags: "Top Tags"
} as PublicMarketplaceMessages;

describe("public category page model", () => {
  it("builds hub metrics, directory links, rail links, and render-ready sections for human browsing", () => {
    const marketplace = buildPublicMarketplaceFallback();
    const categoryHubSummary = marketplace.summary?.category_hub;

    const model = buildPublicCategoryPageModel({
      marketplace,
      messages,
      audience: "human",
      query: "release",
      semanticQuery: "ops",
      isAuthenticated: false,
      loginHref: "/login?next=%2Fcategories",
      resolvePath: (route) => `/light${route}`,
      resolveLinkTarget: (route) => ({ href: `/light${route}` })
    });

    expect(model.normalizedAudience).toBe("human");
    expect(model.submitSkillHref).toBe("/login?next=%2Fcategories");
    expect(model.categoryStats).toEqual([
      { key: "categories", label: "Categories", value: String(categoryHubSummary?.total_categories || 0) },
      { key: "skills", label: "skills", value: String(categoryHubSummary?.total_skills || 0) },
      { key: "tags", label: "Top Tags", value: String(categoryHubSummary?.top_tag_count || 0) }
    ]);
    expect(model.directoryItems[0]).toMatchObject({
      key: "all",
      href: "/light/categories?q=release&tags=ops&audience=human",
      secondaryLabel: String(marketplace.stats.total_skills),
      isActive: true
    });
    expect(model.directoryItems[1]?.href).toContain("/light/categories#category-spotlight-");
    expect(model.railItems[0]).toMatchObject({
      slug: "all",
      href: "/light/categories?q=release&tags=ops&audience=human",
      isActive: true
    });
    expect(model.railItems[1]?.href).toContain("/light/categories/");
    expect(model.spotlightCountLabel).toBe(`${categoryHubSummary?.spotlight_category_count || 0} Categories`);
    expect(model.collectionCardsCountLabel).toBe("3 Categories");
    expect(model.collectionCards.map((card) => card.key)).toEqual(["audience-priority", "category-leaders", "top-tags"]);
    expect(model.skillSections[0]).toMatchObject({
      slug: "featured",
      title: "Featured",
      itemCountLabel: "6 skills"
    });
    expect(model.categorySpotlights.length).toBeGreaterThan(0);
  });

  it("routes authenticated submit actions to workspace and defaults audience to agent", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const model = buildPublicCategoryPageModel({
      marketplace,
      messages,
      isAuthenticated: true,
      loginHref: "/login",
      resolvePath: (route) => route,
      resolveLinkTarget: (route) => ({ href: route })
    });

    expect(model.normalizedAudience).toBe("agent");
    expect(model.submitSkillHref).toBe("/workspace");
    expect(model.directoryItems[0]?.href).toBe("/categories");
    expect(model.skillSections[0]).toMatchObject({
      slug: "most-installed",
      title: "Most Installed"
    });
  });
});
