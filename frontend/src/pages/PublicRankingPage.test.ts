import { describe, expect, it } from "vitest";
import type { MarketplaceSkill, PublicMarketplaceResponse } from "../lib/api";
import {
  buildRankingCategoriesPath,
  buildRankingSkillPath,
  resolveRankingSourceItems,
  sortRankingItems,
  type RankingSortKey
} from "./PublicRankingPage";

function createSkill(input: {
  id: number;
  starCount: number;
  qualityScore: number;
}): MarketplaceSkill {
  return {
    id: input.id,
    name: `Skill ${input.id}`,
    description: "Test skill",
    content: "",
    category: "Automation",
    subcategory: "Flow",
    tags: [],
    source_type: "official",
    source_url: "",
    star_count: input.starCount,
    quality_score: input.qualityScore,
    install_command: "skills install test",
    updated_at: "2026-03-01T00:00:00Z"
  };
}

function sortedIDs(sortKey: RankingSortKey): number[] {
  const items = [
    createSkill({ id: 1001, starCount: 220, qualityScore: 8.1 }),
    createSkill({ id: 1002, starCount: 180, qualityScore: 9.6 }),
    createSkill({ id: 1003, starCount: 220, qualityScore: 9.4 })
  ];
  return sortRankingItems(items, sortKey).map((item) => item.id);
}

function createPayload(items: MarketplaceSkill[]): PublicMarketplaceResponse {
  return {
    filters: {
      q: "",
      tags: "",
      category: "",
      subcategory: "",
      sort: "stars",
      mode: "keyword"
    },
    stats: {
      total_skills: items.length,
      matching_skills: items.length
    },
    pagination: {
      page: 1,
      page_size: 24,
      total_items: items.length,
      total_pages: 1,
      prev_page: 0,
      next_page: 0
    },
    categories: [],
    top_tags: [],
    items,
    session_user: null,
    can_access_dashboard: false
  };
}

describe("PublicRankingPage helpers", () => {
  it("sorts by stars first and falls back to quality", () => {
    expect(sortedIDs("stars")).toEqual([1003, 1001, 1002]);
  });

  it("sorts by quality first and falls back to stars", () => {
    expect(sortedIDs("quality")).toEqual([1002, 1003, 1001]);
  });

  it("keeps prefix when navigating to categories", () => {
    expect(buildRankingCategoriesPath("/light/rankings")).toBe("/light/categories");
    expect(buildRankingCategoriesPath("/mobile/light/rankings")).toBe("/mobile/light/categories");
  });

  it("builds prefixed skill detail path for ranking item navigation", () => {
    expect(buildRankingSkillPath("/rankings", 912)).toBe("/skills/912");
    expect(buildRankingSkillPath("/light/rankings", 912)).toBe("/light/skills/912");
    expect(buildRankingSkillPath("/mobile/light/rankings", 912)).toBe("/mobile/light/skills/912");
  });

  it("prefers live payload items and falls back when live payload is empty", () => {
    const fallbackItems = [createSkill({ id: 201, starCount: 10, qualityScore: 7.1 })];
    const liveItems = [createSkill({ id: 301, starCount: 20, qualityScore: 8.3 })];
    const fallbackPayload = createPayload(fallbackItems);

    expect(resolveRankingSourceItems(createPayload(liveItems), fallbackPayload).map((item) => item.id)).toEqual([301]);
    expect(resolveRankingSourceItems(createPayload([]), fallbackPayload).map((item) => item.id)).toEqual([201]);
    expect(resolveRankingSourceItems(null, fallbackPayload).map((item) => item.id)).toEqual([201]);
  });
});
