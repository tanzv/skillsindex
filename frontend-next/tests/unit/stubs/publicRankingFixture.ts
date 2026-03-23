import type { MarketplaceSkill, PublicRankingResponse } from "@/src/lib/schemas/public";

type FixtureSortKey = "stars" | "quality";

const baseFixtureSkills = [
  {
    id: 101,
    name: "Next.js UX Audit Agent",
    description: "Audits interface quality, hierarchy, and accessibility regressions.",
    content: "Audit workflow content.",
    category: "programming-development",
    subcategory: "coding-agents-ides",
    tags: ["audit", "nextjs", "ux"],
    source_type: "repository",
    source_url: "https://example.com/skills/101",
    star_count: 214,
    quality_score: 9.8,
    install_command: "npx skillsindex install nextjs-ux-audit-agent",
    updated_at: "2026-03-20T09:00:00Z"
  },
  {
    id: 102,
    name: "Prompt Safety Gatekeeper",
    description: "Reviews prompt changes for safety and policy drift before release.",
    content: "Safety workflow content.",
    category: "programming-development",
    subcategory: "coding-agents-ides",
    tags: ["safety", "review", "prompts"],
    source_type: "repository",
    source_url: "https://example.com/skills/102",
    star_count: 172,
    quality_score: 9.1,
    install_command: "npx skillsindex install prompt-safety-gatekeeper",
    updated_at: "2026-03-17T09:00:00Z"
  },
  {
    id: 103,
    name: "Repo Refactor Planner",
    description: "Builds staged refactor plans for large repositories.",
    content: "Refactor planner content.",
    category: "programming-development",
    subcategory: "coding-agents-ides",
    tags: ["refactor", "planning", "architecture"],
    source_type: "repository",
    source_url: "https://example.com/skills/103",
    star_count: 166,
    quality_score: 8.9,
    install_command: "npx skillsindex install repo-refactor-planner",
    updated_at: "2026-03-16T09:00:00Z"
  },
  {
    id: 104,
    name: "Release Pipeline Sentinel",
    description: "Tracks release readiness across checks, rollout windows, and risks.",
    content: "Release pipeline content.",
    category: "research-analysis",
    subcategory: "data-analytics",
    tags: ["release", "analytics", "ops"],
    source_type: "repository",
    source_url: "https://example.com/skills/104",
    star_count: 198,
    quality_score: 9.6,
    install_command: "npx skillsindex install release-pipeline-sentinel",
    updated_at: "2026-03-19T09:00:00Z"
  },
  {
    id: 105,
    name: "Docs Localization Assistant",
    description: "Coordinates translation QA for product docs and release notes.",
    content: "Localization workflow content.",
    category: "productivity-writing",
    subcategory: "pdf-documents",
    tags: ["docs", "translation", "qa"],
    source_type: "repository",
    source_url: "https://example.com/skills/105",
    star_count: 176,
    quality_score: 8.7,
    install_command: "npx skillsindex install docs-localization-assistant",
    updated_at: "2026-03-18T09:00:00Z"
  },
  {
    id: 111,
    name: "Incident Timeline Analyst",
    description: "Summarizes incidents into response-ready timelines and takeaways.",
    content: "Incident analysis content.",
    category: "programming-development",
    subcategory: "coding-agents-ides",
    tags: ["incident", "analysis", "timeline"],
    source_type: "repository",
    source_url: "https://example.com/skills/111",
    star_count: 160,
    quality_score: 9.4,
    install_command: "npx skillsindex install incident-timeline-analyst",
    updated_at: "2026-03-15T09:00:00Z"
  }
] satisfies MarketplaceSkill[];

const skillById = new Map(baseFixtureSkills.map((skill) => [skill.id, skill]));

function resolveSkill(id: number): MarketplaceSkill {
  const skill = skillById.get(id);

  if (!skill) {
    throw new Error(`Missing ranking fixture skill: ${id}`);
  }

  return skill;
}

function cloneSkill(skill: MarketplaceSkill): MarketplaceSkill {
  return {
    ...skill,
    tags: [...skill.tags]
  };
}

function cloneSkillList(ids: number[]): MarketplaceSkill[] {
  return ids.map((id) => cloneSkill(resolveSkill(id)));
}

export const publicRankingFixtureUnsortedItems: MarketplaceSkill[] = cloneSkillList([103, 105, 111, 102, 104, 101]);

const rankingFixtureDefinitions: Record<FixtureSortKey, number[]> = {
  stars: [101, 104, 105, 102, 103, 111],
  quality: [101, 104, 111, 102, 103, 105]
};

const rankingSummary = {
  total_compared: 6,
  top_stars: 214,
  top_quality: 9.8,
  average_quality: 9.3
} as const;

export function buildPublicRankingResponseFixture(sortKey: FixtureSortKey): PublicRankingResponse {
  const rankedItems = cloneSkillList(rankingFixtureDefinitions[sortKey]);
  const programmingLeader = rankedItems.find((item) => item.id === 101);
  const researchLeader = rankedItems.find((item) => item.id === 104);
  const writingLeader = rankedItems.find((item) => item.id === 105);

  if (!programmingLeader || !researchLeader || !writingLeader) {
    throw new Error("Invalid ranking fixture configuration.");
  }

  return {
    sort: sortKey,
    ranked_items: rankedItems,
    highlights: rankedItems.slice(0, 3),
    list_items: rankedItems.slice(3),
    summary: { ...rankingSummary },
    category_leaders: [
      {
        category_slug: "programming-development",
        count: 4,
        average_quality: 9.3,
        leading_skill: programmingLeader
      },
      {
        category_slug: "research-analysis",
        count: 1,
        average_quality: 9.6,
        leading_skill: researchLeader
      },
      {
        category_slug: "productivity-writing",
        count: 1,
        average_quality: 8.7,
        leading_skill: writingLeader
      }
    ]
  };
}
