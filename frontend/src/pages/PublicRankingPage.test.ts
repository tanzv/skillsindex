import { describe, expect, it } from "vitest";
import type { MarketplaceSkill } from "../lib/api";
import {
  buildRankingCategoriesPath,
  buildRankingSkillPath,
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
});
