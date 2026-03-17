import { describe, expect, it } from "vitest";

import {
  buildMarketplaceCategoryShelves,
  filterMarketplaceItems
} from "@/src/features/public/marketplace/marketplaceViewModel";
import type { MarketplaceCategory, MarketplaceSkill } from "@/src/lib/schemas/public";

const skills: MarketplaceSkill[] = [
  {
    id: 101,
    name: "Release Readiness Checklist",
    description: "Validate release gates before deployment.",
    content: "",
    category: "operations",
    subcategory: "release",
    tags: ["release", "checklist"],
    source_type: "manual",
    source_url: "",
    star_count: 184,
    quality_score: 9.3,
    install_command: "npx one",
    updated_at: "2026-03-10T08:00:00Z"
  },
  {
    id: 103,
    name: "Recovery Drill Planner",
    description: "Coordinate continuity rehearsals.",
    content: "",
    category: "operations",
    subcategory: "recovery",
    tags: ["recovery", "continuity"],
    source_type: "manual",
    source_url: "",
    star_count: 141,
    quality_score: 8.9,
    install_command: "npx two",
    updated_at: "2026-03-07T15:45:00Z"
  },
  {
    id: 104,
    name: "Rollback Command Center",
    description: "Automate fast rollback validation.",
    content: "",
    category: "operations",
    subcategory: "release",
    tags: ["rollback", "release"],
    source_type: "repository",
    source_url: "",
    star_count: 97,
    quality_score: 9.7,
    install_command: "npx three",
    updated_at: "2026-03-14T05:45:00Z"
  }
];

const categories: MarketplaceCategory[] = [
  {
    slug: "programming-development",
    name: "Programming & Development",
    description: "Coding workflows, agents, infra, security, and applied software delivery tracks.",
    count: 3,
    subcategories: [
      {
        slug: "web-frontend-development",
        name: "Web & Frontend Development",
        count: 2
      },
      {
        slug: "browser-automation",
        name: "Browser & Automation",
        count: 1
      }
    ]
  }
];

describe("marketplace view model", () => {
  it("sorts by recent timestamps when requested", () => {
    const visibleItems = filterMarketplaceItems(skills, {
      activeCategory: "operations",
      sort: "recent"
    });

    expect(visibleItems.map((item) => item.id)).toEqual([104, 101, 103]);
  });

  it("sorts by stars and quality when requested", () => {
    expect(
      filterMarketplaceItems(skills, {
        activeCategory: "operations",
        sort: "stars"
      }).map((item) => item.id)
    ).toEqual([101, 103, 104]);

    expect(
      filterMarketplaceItems(skills, {
        activeCategory: "operations",
        sort: "quality"
      }).map((item) => item.id)
    ).toEqual([104, 101, 103]);
  });

  it("builds marketplace category shelves with anchor ids, preview subcategories, and featured skills", () => {
    const shelves = buildMarketplaceCategoryShelves(categories, [
      {
        ...skills[0],
        category: "development",
        subcategory: "frontend",
        tags: ["nextjs", "react", "ux"],
        star_count: 214,
        quality_score: 9.6
      },
      {
        ...skills[1],
        id: 203,
        name: "Browser Flow Runner",
        category: "tools",
        subcategory: "automation-tools",
        tags: ["browser", "automation", "playwright"],
        star_count: 189,
        quality_score: 9.0
      },
      {
        ...skills[2],
        id: 204,
        name: "Prompt Evaluation Lab",
        category: "data-ai",
        subcategory: "llm-ai",
        tags: ["llm", "evaluation", "prompt"],
        star_count: 201,
        quality_score: 9.5
      }
    ]);

    expect(shelves).toHaveLength(1);
    expect(shelves[0]?.anchorId).toBe("category-shelf-programming-development");
    expect(shelves[0]?.primarySubcategories.map((entry) => entry.subcategory.slug)).toEqual([
      "web-frontend-development",
      "browser-automation"
    ]);
    expect(shelves[0]?.primarySubcategories[0]?.previewSkills.map((item) => item.name)).toEqual([
      "Release Readiness Checklist"
    ]);
    expect(shelves[0]?.featuredSkills.map((item) => item.name)).toEqual([
      "Release Readiness Checklist",
      "Prompt Evaluation Lab",
      "Browser Flow Runner"
    ]);
  });
});
