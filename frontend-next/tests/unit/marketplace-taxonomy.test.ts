import { describe, expect, it } from "vitest";

import {
  buildMarketplacePresentationCategories,
  resolveMarketplaceCategorySummary,
  resolveMarketplaceSkillCategoryLabel,
  resolveMarketplaceSkillSubcategoryLabel
} from "@/src/features/public/marketplace/marketplaceTaxonomy";
import { filterMarketplaceItems } from "@/src/features/public/marketplace/marketplaceViewModel";
import type { MarketplaceCategory, MarketplaceSkill } from "@/src/lib/schemas/public";

const rawCategories: MarketplaceCategory[] = [
  {
    slug: "development",
    name: "Development",
    description: "Development workflows.",
    count: 4,
    subcategories: [
      { slug: "frontend", name: "Frontend", count: 2 },
      { slug: "backend", name: "Backend", count: 2 }
    ]
  },
  {
    slug: "devops",
    name: "DevOps",
    description: "Operations pipelines.",
    count: 3,
    subcategories: [
      { slug: "cloud", name: "Cloud", count: 2 },
      { slug: "git-workflows", name: "Git Workflows", count: 1 }
    ]
  },
  {
    slug: "documentation",
    name: "Documentation",
    description: "Knowledge workflows.",
    count: 2,
    subcategories: [{ slug: "technical-docs", name: "Technical Docs", count: 2 }]
  }
];

const skills: MarketplaceSkill[] = [
  {
    id: 101,
    name: "Next.js UX Audit Agent",
    description: "Review React layouts and accessibility hotspots.",
    content: "",
    category: "development",
    subcategory: "frontend",
    tags: ["nextjs", "react", "ux"],
    source_type: "repository",
    source_url: "",
    star_count: 180,
    quality_score: 9.4,
    install_command: "npx skill nextjs-ux-audit",
    updated_at: "2026-03-12T08:00:00Z"
  },
  {
    id: 102,
    name: "PDF Contract Extractor",
    description: "Extract clauses and checklist metadata from long PDFs.",
    content: "",
    category: "documentation",
    subcategory: "technical-docs",
    tags: ["pdf", "docs"],
    source_type: "manual",
    source_url: "",
    star_count: 97,
    quality_score: 8.8,
    install_command: "npx skill pdf-contract-extractor",
    updated_at: "2026-03-10T10:00:00Z"
  },
  {
    id: 103,
    name: "Cloud Rollout Runbook",
    description: "Coordinate rollout, rollback, and release evidence for cloud changes.",
    content: "",
    category: "operations",
    subcategory: "release",
    tags: ["release", "rollback", "cloud"],
    source_type: "manual",
    source_url: "",
    star_count: 141,
    quality_score: 8.9,
    install_command: "npx skill cloud-rollout-runbook",
    updated_at: "2026-03-07T15:45:00Z"
  }
];

describe("marketplace taxonomy", () => {
  it("groups raw marketplace categories into Lobehub-inspired top-level taxonomy", () => {
    const categories = buildMarketplacePresentationCategories(rawCategories);

    expect(categories.map((category) => category.slug)).toEqual([
      "productivity-writing",
      "programming-development"
    ]);
    expect(categories[0]).toMatchObject({
      name: "Productivity & Writing",
      count: 2
    });
    expect(categories[0]?.subcategories).toEqual([
      { slug: "pdf-documents", name: "PDF & Documents", count: 2 }
    ]);
    expect(categories[1]).toMatchObject({
      name: "Programming & Development",
      count: 7
    });
    expect(categories[1]?.subcategories).toEqual([
      { slug: "web-frontend-development", name: "Web & Frontend Development", count: 4 },
      { slug: "devops-cloud", name: "DevOps & Cloud", count: 2 },
      { slug: "git-github", name: "Git & GitHub", count: 1 }
    ]);
  });

  it("resolves grouped category and subcategory display labels from legacy skill metadata", () => {
    expect(resolveMarketplaceSkillCategoryLabel(skills[0])).toBe("Programming & Development");
    expect(resolveMarketplaceSkillSubcategoryLabel(skills[0])).toBe("Web & Frontend Development");
    expect(resolveMarketplaceSkillCategoryLabel(skills[1])).toBe("Productivity & Writing");
    expect(resolveMarketplaceSkillSubcategoryLabel(skills[1])).toBe("PDF & Documents");
  });

  it("prefers explicit legacy repository taxonomy over incidental keyword matches in descriptions", () => {
    const repositorySkill: MarketplaceSkill = {
      id: 104,
      name: "Repository Sync Auditor",
      description: "Review repository sync drift, queue health, and owner mappings for catalog intake.",
      content: "",
      category: "engineering",
      subcategory: "repository",
      tags: ["sync"],
      source_type: "repository",
      source_url: "https://github.com/skillsindex/repository-sync-auditor",
      star_count: 163,
      quality_score: 9.1,
      install_command: "uvx skillsindex sync-auditor",
      updated_at: "2026-03-16T12:50:47.641682+08:00"
    };

    expect(resolveMarketplaceSkillCategoryLabel(repositorySkill)).toBe("Programming & Development");
    expect(resolveMarketplaceSkillSubcategoryLabel(repositorySkill)).toBe("Git & GitHub");
  });

  it("filters raw skill payloads by grouped route category and grouped subcategory", () => {
    expect(
      filterMarketplaceItems(skills, {
        activeCategory: "programming-development"
      }).map((item) => item.id)
    ).toEqual([101, 103]);

    expect(
      filterMarketplaceItems(skills, {
        activeCategory: "programming-development",
        activeSubcategory: "web-frontend-development"
      }).map((item) => item.id)
    ).toEqual([101]);
  });

  it("keeps legacy category routes readable when a grouped category summary does not exist", () => {
    const groupedCategories = buildMarketplacePresentationCategories(rawCategories);
    const legacySummary = resolveMarketplaceCategorySummary(groupedCategories, "operations", skills);

    expect(legacySummary).toMatchObject({
      slug: "operations",
      name: "Operations",
      count: 1,
      subcategories: [{ slug: "release", name: "Release", count: 1 }]
    });
  });
});
