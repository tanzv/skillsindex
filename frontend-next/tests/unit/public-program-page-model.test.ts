import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import { buildPublicProgramPageModel } from "@/src/features/public/publicProgramPageModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  aboutDescription: "About description",
  aboutTitle: "About SkillsIndex",
  governanceDescription: "Governance description",
  governanceTitle: "Governance",
  landingCategoriesTitle: "Category Coverage",
  landingContinueCategories: "Browse categories",
  landingContinueDescription: "Continue through the marketplace.",
  landingContinueRankings: "Open rankings",
  landingCuratedDescription: "Curated marketplace picks.",
  landingCuratedTitle: "Curated Picks",
  landingLatestDescription: "Recently updated entries.",
  landingLatestTitle: "Latest Updates",
  metricCategoryFamilies: "Category families",
  metricPublicAssets: "Public assets",
  metricTopTagPivots: "Top tag pivots",
  programContinueTitle: "Continue",
  rankingCategoryLeadersDescription: "Category leader board.",
  rankingCategoryLeadersTitle: "Category Leaders",
  rankingTopHighlightsDescription: "Ranking highlight stream.",
  resultsDiscoveryNotesDescription: "Discovery notes.",
  resultsDiscoveryNotesTitle: "Discovery Notes",
  resultsEmptyTitle: "No results",
  resultsCategoryPivotsDescription: "Category pivots.",
  rolloutDescription: "Rollout description",
  rolloutTitle: "Rollout Overview",
  shellCategories: "Categories",
  shellHome: "Home",
  shellRankings: "Rankings",
  shellWorkspace: "Workspace",
  skillCountSuffix: "skills",
  skillQualitySuffix: "quality",
  skillStarsSuffix: "stars",
  skillUpdatedPrefix: "Updated",
  stageAccess: "Access",
  stageLanding: "Landing",
  stageMarketplace: "Marketplace",
  statCategories: "Categories",
  statTopStars: "Top Stars",
  statTopTags: "Top Tags",
  statTotalSkills: "Total Skills",
  timelineDescription: "Timeline description",
  timelineTitle: "Timeline"
} as PublicMarketplaceMessages;

describe("public program page model", () => {
  it("builds narrative sections, signals, and canonical links for rollout pages", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const model = buildPublicProgramPageModel({
      pageKey: "rollout",
      marketplace,
      messages,
      locale: "en",
      resolvePath: (route) => `/light${route}`,
      formatDate: (value) => `formatted:${value}`
    });

    expect(model.descriptor).toEqual({
      title: "Rollout Overview",
      description: "Rollout description",
      route: "/rollout"
    });
    expect(model.stats[0]).toEqual({
      label: "Total Skills",
      value: String(marketplace.stats.total_skills),
      detail: "Public assets"
    });
    expect(model.primarySection.title).toBe("Curated Picks");
    expect(model.primarySection.description).toBe("Ranking highlight stream.");
    expect(model.primarySection.items).toHaveLength(4);
    expect(model.categoriesSection.title).toBe("Category Coverage");
    expect(model.categoriesSection.links[0]?.href).toContain("/light/categories/");
    expect(model.continueLinks).toEqual([
      { key: "rollout-home", href: "/light/", label: "Home", meta: "Landing" },
      { key: "rollout-categories", href: "/light/categories", label: "Browse categories", meta: "Categories" },
      { key: "rollout-rankings", href: "/light/rankings", label: "Open rankings", meta: "Rankings" },
      { key: "rollout-workspace", href: "/workspace", label: "Workspace", meta: "Access" }
    ]);
    expect(model.signalLinks[0]?.href).toContain("/light/results?tags=");
    expect(model.leadingSkillSignal).toMatchObject({
      key: "rollout-leading-skill",
      label: "Updated",
      description: expect.stringContaining("formatted:")
    });
    expect(model.breadcrumbTitle).toBe("Rollout Overview");
  });

  it("switches timeline pages to latest copy and timeline-specific discovery description", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const model = buildPublicProgramPageModel({
      pageKey: "timeline",
      marketplace,
      messages,
      locale: "en",
      resolvePath: (route) => route,
      formatDate: (value) => value
    });

    expect(model.primarySection.title).toBe("Latest Updates");
    expect(model.primarySection.description).toBe("Recently updated entries.");
    expect(model.signalsSectionDescription).toBe("Timeline description");
  });
});
