import { describe, expect, it } from "vitest";

import type { MarketplaceSkill, PublicMarketplaceResponse, PublicSkillCompareResponse } from "../../lib/api";
import { resolveComparedSkills } from "./PublicComparePage.data";

function createSkill(id: number, name: string): MarketplaceSkill {
  return {
    id,
    name,
    description: `${name} description`,
    content: `${name} content`,
    category: "development",
    subcategory: "automation",
    tags: ["sync"],
    source_type: "repository",
    source_url: `https://example.com/${id}`,
    star_count: id * 10,
    quality_score: 8.5,
    install_command: `install ${name}`,
    updated_at: "2026-03-01T10:00:00.000Z"
  };
}

function createMarketplacePayload(items: MarketplaceSkill[]): PublicMarketplaceResponse {
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

describe("PublicComparePage.data", () => {
  it("prefers compare payload when explicit ids are requested", () => {
    const marketplacePayload = createMarketplacePayload([createSkill(1, "One"), createSkill(2, "Two")]);
    const comparePayload: PublicSkillCompareResponse = {
      left_skill: createSkill(19, "Left Detail"),
      right_skill: createSkill(27, "Right Detail")
    };

    const resolved = resolveComparedSkills(marketplacePayload, comparePayload, {
      left: 19,
      right: 27
    });

    expect(resolved.leftSkill?.id).toBe(19);
    expect(resolved.rightSkill?.id).toBe(27);
  });

  it("falls back to marketplace items when compare payload is unavailable", () => {
    const marketplacePayload = createMarketplacePayload([createSkill(3, "Three"), createSkill(4, "Four"), createSkill(5, "Five")]);

    const resolved = resolveComparedSkills(marketplacePayload, null, {
      left: 0,
      right: 0
    });

    expect(resolved.leftSkill?.id).toBe(3);
    expect(resolved.rightSkill?.id).toBe(4);
  });

  it("does not fake a compare result when explicit ids are missing from compare payload", () => {
    const marketplacePayload = createMarketplacePayload([createSkill(3, "Three"), createSkill(4, "Four"), createSkill(5, "Five")]);

    const resolved = resolveComparedSkills(marketplacePayload, null, {
      left: 31,
      right: 47
    });

    expect(resolved.leftSkill).toBeNull();
    expect(resolved.rightSkill).toBeNull();
  });
});
