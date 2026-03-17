import type { MarketplaceSkill, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { filterMarketplaceItems } from "./marketplace/marketplaceViewModel";
import {
  buildMarketplacePresentationPayload,
  buildRawMarketplaceCategoriesFromItems
} from "./marketplace/marketplaceTaxonomy";

export const fallbackSkills: MarketplaceSkill[] = [
  {
    id: 101,
    name: "Next.js UX Audit Agent",
    description: "Review React surfaces, accessibility hotspots, and responsive layout regressions before shipping.",
    content: "Next.js UX audit agent content.",
    category: "development",
    subcategory: "frontend",
    tags: ["nextjs", "react", "ux"],
    source_type: "repository",
    source_url: "https://github.com/skillsindex/nextjs-ux-audit-agent",
    star_count: 214,
    quality_score: 9.6,
    install_command: "npx skillsindex install nextjs-ux-audit-agent",
    updated_at: "2026-03-12T08:00:00Z"
  },
  {
    id: 102,
    name: "Cloud Rollout Runbook",
    description: "Coordinate rollout, rollback, and release evidence for cloud delivery checkpoints.",
    content: "Cloud rollout runbook content.",
    category: "operations",
    subcategory: "release",
    tags: ["release", "rollback", "cloud"],
    source_type: "manual",
    source_url: "",
    star_count: 183,
    quality_score: 9.2,
    install_command: "npx skillsindex install cloud-rollout-runbook",
    updated_at: "2026-03-11T09:30:00Z"
  },
  {
    id: 103,
    name: "Repository Sync Auditor",
    description: "Track repository drift, owner mappings, and Git-based sync evidence across catalog imports.",
    content: "Repository sync auditor content.",
    category: "engineering",
    subcategory: "repository",
    tags: ["git", "repository", "sync"],
    source_type: "repository",
    source_url: "https://github.com/skillsindex/repository-sync-auditor",
    star_count: 176,
    quality_score: 9.1,
    install_command: "uvx skillsindex sync-auditor",
    updated_at: "2026-03-10T10:30:00Z"
  },
  {
    id: 104,
    name: "Prompt Evaluation Lab",
    description: "Benchmark prompts, score rubric drift, and compare LLM variants with reusable evaluation packs.",
    content: "Prompt evaluation lab content.",
    category: "data-ai",
    subcategory: "llm-ai",
    tags: ["llm", "evaluation", "prompt"],
    source_type: "repository",
    source_url: "https://github.com/skillsindex/prompt-evaluation-lab",
    star_count: 201,
    quality_score: 9.5,
    install_command: "npx skillsindex install prompt-evaluation-lab",
    updated_at: "2026-03-09T07:45:00Z"
  },
  {
    id: 105,
    name: "Browser Flow Runner",
    description: "Automate browser-led workflows, visual checkpoints, and smoke journeys for public web apps.",
    content: "Browser flow runner content.",
    category: "tools",
    subcategory: "automation-tools",
    tags: ["browser", "automation", "playwright"],
    source_type: "repository",
    source_url: "https://github.com/skillsindex/browser-flow-runner",
    star_count: 189,
    quality_score: 9.0,
    install_command: "npx skillsindex install browser-flow-runner",
    updated_at: "2026-03-08T12:20:00Z"
  },
  {
    id: 106,
    name: "CLI Release Doctor",
    description: "Inspect command output, shell contracts, and release tooling drift before operator handoff.",
    content: "CLI release doctor content.",
    category: "tools",
    subcategory: "cli-tools",
    tags: ["cli", "terminal", "release"],
    source_type: "manual",
    source_url: "",
    star_count: 147,
    quality_score: 8.9,
    install_command: "npx skillsindex install cli-release-doctor",
    updated_at: "2026-03-07T18:00:00Z"
  },
  {
    id: 107,
    name: "PDF Contract Extractor",
    description: "Extract clauses, obligations, and audit checkpoints from long-form PDF agreements.",
    content: "PDF contract extractor content.",
    category: "documentation",
    subcategory: "technical-docs",
    tags: ["pdf", "docs", "contracts"],
    source_type: "manual",
    source_url: "",
    star_count: 133,
    quality_score: 8.8,
    install_command: "npx skillsindex install pdf-contract-extractor",
    updated_at: "2026-03-06T14:15:00Z"
  },
  {
    id: 108,
    name: "Research Brief Compiler",
    description: "Aggregate findings, surface evidence, and build fast briefs from search-heavy research tasks.",
    content: "Research brief compiler content.",
    category: "research",
    subcategory: "academic",
    tags: ["research", "brief", "analysis"],
    source_type: "repository",
    source_url: "https://github.com/skillsindex/research-brief-compiler",
    star_count: 118,
    quality_score: 8.7,
    install_command: "npx skillsindex install research-brief-compiler",
    updated_at: "2026-03-05T16:40:00Z"
  },
  {
    id: 109,
    name: "Revenue Forecast Copilot",
    description: "Blend payment, finance, and forecast signals into operator-friendly business outlooks.",
    content: "Revenue forecast copilot content.",
    category: "business",
    subcategory: "finance-investment",
    tags: ["finance", "forecast", "revenue"],
    source_type: "manual",
    source_url: "",
    star_count: 126,
    quality_score: 8.6,
    install_command: "npx skillsindex install revenue-forecast-copilot",
    updated_at: "2026-03-04T11:10:00Z"
  },
  {
    id: 110,
    name: "Campaign Copy Planner",
    description: "Shape launch messaging, SEO content, and sales-facing content packages from a single brief.",
    content: "Campaign copy planner content.",
    category: "content-media",
    subcategory: "content-creation",
    tags: ["marketing", "content", "seo"],
    source_type: "manual",
    source_url: "",
    star_count: 112,
    quality_score: 8.5,
    install_command: "npx skillsindex install campaign-copy-planner",
    updated_at: "2026-03-03T13:05:00Z"
  },
  {
    id: 111,
    name: "Security Policy Sentinel",
    description: "Check authentication flows, password hygiene, and permission regressions against platform policy baselines.",
    content: "Security policy sentinel content.",
    category: "testing-security",
    subcategory: "security",
    tags: ["security", "policy", "password"],
    source_type: "repository",
    source_url: "https://github.com/skillsindex/security-policy-sentinel",
    star_count: 171,
    quality_score: 9.3,
    install_command: "npx skillsindex install security-policy-sentinel",
    updated_at: "2026-03-02T09:55:00Z"
  },
  {
    id: 112,
    name: "Habit Reflection Coach",
    description: "Support daily habit reviews, reflection prompts, and momentum tracking for long-running routines.",
    content: "Habit reflection coach content.",
    category: "lifestyle",
    subcategory: "wellness-health",
    tags: ["habit", "wellness", "journal"],
    source_type: "manual",
    source_url: "",
    star_count: 94,
    quality_score: 8.4,
    install_command: "npx skillsindex install habit-reflection-coach",
    updated_at: "2026-03-01T08:20:00Z"
  }
];

function buildTopTags(items: MarketplaceSkill[]): Array<{ name: string; count: number }> {
  const counter = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counter.set(tag, (counter.get(tag) || 0) + 1);
    }
  }

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

export function buildPublicMarketplaceFallback(
  searchParams?: Record<string, string | string[] | undefined>
): PublicMarketplaceResponse {
  const activeCategory = typeof searchParams?.category === "string" ? searchParams.category : "";
  const activeSubcategory = typeof searchParams?.subcategory === "string" ? searchParams.subcategory : "";
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";
  const semanticQuery = typeof searchParams?.tags === "string" ? searchParams.tags : "";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "relevance";

  const items = filterMarketplaceItems(fallbackSkills, {
    activeCategory,
    activeSubcategory,
    query,
    semanticQuery,
    sort
  });
  const rawCategories = buildRawMarketplaceCategoriesFromItems(fallbackSkills);

  return buildMarketplacePresentationPayload({
    filters: Object.fromEntries(
      Object.entries(searchParams || {}).flatMap(([key, value]) => {
        if (typeof value === "string" && value.trim()) {
          return [[key, value]];
        }
        return [];
      })
    ),
    stats: {
      total_skills: fallbackSkills.length,
      matching_skills: items.length
    },
    pagination: {
      page: 1,
      page_size: items.length || fallbackSkills.length,
      total_items: items.length,
      total_pages: 1,
      prev_page: 0,
      next_page: 0
    },
    categories: rawCategories,
    top_tags: buildTopTags(items),
    items,
    session_user: null,
    can_access_dashboard: false
  });
}

export function resolvePublicMarketplaceFallbackSkill(skillId: number): MarketplaceSkill | null {
  return fallbackSkills.find((skill) => skill.id === skillId) || null;
}
