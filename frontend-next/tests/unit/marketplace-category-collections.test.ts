import { describe, expect, it } from "vitest";

import { buildMarketplaceCategoryCollectionCards } from "@/src/features/public/marketplace/marketplaceCategoryCollections";
import { buildMarketplaceCategoryHubModel } from "@/src/features/public/marketplace/marketplaceCategoryHubModel";
import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  categoryHubAudienceAgent: "I'm an Agent",
  categoryHubAudienceHuman: "I'm a Human",
  categoryHubAudienceAgentDescription: "Agent-first browsing.",
  categoryHubAudienceHumanDescription: "Human-first browsing.",
  categoryHubAudienceLabel: "Audience",
  shellSearch: "Search",
  shellRankings: "Rankings",
  rankingCategoryLeadersTitle: "Category Leaders",
  rankingCategoryLeadersDescription: "Rank distribution by category for focused discovery.",
  rankingOpenSkillLabel: "Open skill",
  resultsCategoryPivotsTitle: "Category Pivots",
  resultsCategoryPivotsDescription: "Jump between public category pivots.",
  categoryAllSubcategories: "All subcategories",
  statTopTags: "Top Tags",
  statTopStars: "Top Stars",
  statCategories: "Categories",
  skillCountSuffix: "skills",
  skillStarsSuffix: "stars",
  skillQualitySuffix: "quality"
} as PublicMarketplaceMessages;

describe("marketplace category collections", () => {
  const payload = buildPublicMarketplaceFallback();

  it("builds audience, leader, and tag collection cards for the category hub", () => {
    const hubModel = buildMarketplaceCategoryHubModel(payload.categories, payload.items, 6, "agent");
    const cards = buildMarketplaceCategoryCollectionCards({
      audience: "agent",
      hubModel,
      messages,
      topTags: payload.top_tags,
      toPublicPath: (route) => route
    });

    expect(cards.map((card) => card.key)).toEqual(["audience-priority", "category-leaders", "top-tags"]);
    expect(cards[0]).toMatchObject({
      title: "I'm an Agent",
      actionHref: "/results?q=Next.js+UX&tags=nextjs+react",
      secondaryAction: {
        href: "/skills/101",
        label: "Open skill"
      },
      highlight: {
        title: "Next.js UX Audit Agent"
      }
    });
    expect(cards[0]?.links[0]).toMatchObject({
      href: "/results?q=Next.js+UX&tags=nextjs+react",
      meta: "Next.js UX Audit Agent"
    });
    expect(cards[1]).toMatchObject({
      actionHref: "/categories/programming-development",
      secondaryAction: {
        href: "/rankings",
        label: "Rankings"
      }
    });
    expect(cards[1]?.links[0]).toMatchObject({
      href: "/categories/programming-development?subcategory=ai-llms"
    });
    expect(cards[2]).toMatchObject({
      actionHref: "/results?q=Cloud+Rollout&tags=release+rollback",
      secondaryAction: {
        href: "/skills/102",
        label: "Open skill"
      },
      highlight: {
        eyebrow: "Release"
      }
    });
    expect(cards[2]?.links[0]?.href).toBe("/results?q=Cloud+Rollout&tags=release+rollback");
  });

  it("switches the audience collection copy and skill prioritization for human browsing", () => {
    const hubModel = buildMarketplaceCategoryHubModel(payload.categories, payload.items, 6, "human");
    const cards = buildMarketplaceCategoryCollectionCards({
      audience: "human",
      hubModel,
      messages,
      topTags: payload.top_tags,
      toPublicPath: (route) => route
    });

    expect(cards[0]).toMatchObject({
      title: "I'm a Human",
      actionHref: "/results?q=Cloud+Rollout&tags=release+rollback",
      secondaryAction: {
        href: "/skills/102",
        label: "Open skill"
      },
      highlight: {
        title: "Cloud Rollout Runbook"
      }
    });
    expect(cards[0]?.links[0]).toMatchObject({
      href: "/results?q=Cloud+Rollout&tags=release+rollback",
      meta: "Cloud Rollout Runbook"
    });
  });

  it("keeps secondary skill actions canonical when non-skill routes are prefixed", () => {
    const hubModel = buildMarketplaceCategoryHubModel(payload.categories, payload.items, 6, "human");
    const cards = buildMarketplaceCategoryCollectionCards({
      audience: "human",
      hubModel,
      messages,
      topTags: payload.top_tags,
      toPublicPath: (route) => `/light${route}`
    });

    expect(cards[0]).toMatchObject({
      actionHref: "/light/results?q=Cloud+Rollout&tags=release+rollback",
      secondaryAction: {
        href: "/skills/102",
        label: "Open skill"
      }
    });
    expect(cards[2]?.secondaryAction?.href).toBe("/skills/102");
  });
});
