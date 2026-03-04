import {
  MarketplaceCategory,
  MarketplaceQueryParams,
  MarketplaceSkill,
  PublicMarketplaceResponse,
  SessionUser
} from "../lib/api";
import { AppLocale } from "../lib/i18n";

interface PrototypeSkillSeed {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
}

const prototypeSkillSeeds: PrototypeSkillSeed[] = [
  {
    name: "Playwright Flow Guardian",
    description: "Reason: stable regression flow and high script reuse.",
    category: "Testing Automation",
    subcategory: "Workflow Regression",
    tags: ["playwright", "automation"]
  },
  {
    name: "Skill Sync Auditor",
    description: "Reason: auditable sync chain and traceable failure path.",
    category: "Operations",
    subcategory: "Repository Sync",
    tags: ["sync", "audit"]
  },
  {
    name: "Prompt Policy Linter",
    description: "Reason: consistent standards and lower rollout risk.",
    category: "Governance",
    subcategory: "Policy Checks",
    tags: ["policy", "lint"]
  },
  {
    name: "Repository Diff Sentinel",
    description: "Tags: repository / diff",
    category: "Operations",
    subcategory: "Repository Guard",
    tags: ["repo", "diff"]
  },
  {
    name: "Odoo UI Inspector",
    description: "Tags: Odoo / review",
    category: "Odoo",
    subcategory: "UI Review",
    tags: ["odoo", "ui"]
  },
  {
    name: "Workflow Assertion Pack",
    description: "Tags: workflow / assertion",
    category: "Testing Automation",
    subcategory: "Assertion Library",
    tags: ["workflow", "assertion"]
  },
  {
    name: "Browser Task Runner",
    description: "Tags: browser / task",
    category: "Automation",
    subcategory: "Browser Tasks",
    tags: ["browser", "runner"]
  },
  {
    name: "Test Matrix Builder",
    description: "Tags: testing / matrix",
    category: "Testing Automation",
    subcategory: "Coverage Matrix",
    tags: ["testing", "matrix"]
  },
  {
    name: "Release Notes Composer",
    description: "Tags: release / change",
    category: "Operations",
    subcategory: "Release Notes",
    tags: ["release", "docs"]
  },
  {
    name: "Odoo Workflow Automation",
    description: "Template match, retry strategy, and assertion coverage for Odoo workflow tests.",
    category: "Odoo",
    subcategory: "Workflow Regression",
    tags: ["odoo", "workflow"]
  },
  {
    name: "Permission Visual Checker",
    description: "Permission path checks and visual diff verification for role journeys.",
    category: "Security",
    subcategory: "Permission Validation",
    tags: ["security", "visual-compare"]
  },
  {
    name: "Nightly Report Runner",
    description: "High coverage nightly regression and reusable report generation.",
    category: "Operations",
    subcategory: "Report Pipeline",
    tags: ["report", "nightly"]
  }
];

function buildPrototypeSkillPool(total: number): MarketplaceSkill[] {
  const items: MarketplaceSkill[] = [];
  for (let index = 0; index < total; index += 1) {
    const seed = prototypeSkillSeeds[index % prototypeSkillSeeds.length];
    const cycle = Math.floor(index / prototypeSkillSeeds.length);
    const id = 901 + index;
    const suffix = cycle > 0 ? ` ${cycle + 1}` : "";
    const sourceType = index % 3 === 0 ? "official" : "verified_community";
    const starCount = 70 + ((index * 7) % 30);
    const qualityScore = Number((8 + ((index % 20) * 0.1)).toFixed(1));
    const month = String((index % 12) + 1).padStart(2, "0");
    const day = String((index % 27) + 1).padStart(2, "0");

    items.push({
      id,
      name: `${seed.name}${suffix}`,
      description: seed.description,
      content: "",
      category: seed.category,
      subcategory: seed.subcategory,
      tags: seed.tags,
      source_type: sourceType,
      source_url: "",
      star_count: starCount,
      quality_score: qualityScore,
      install_command: `skills install ${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`,
      updated_at: `2026-${month}-${day}T02:10:00Z`
    });
  }
  return items;
}

const prototypeSkillPool = buildPrototypeSkillPool(2616);

const zhCategoryLabelMap: Record<string, string> = {
  "Testing Automation": "\u6d4b\u8bd5\u81ea\u52a8\u5316",
  Operations: "\u8fd0\u7ef4\u8fd0\u8425",
  Governance: "\u6cbb\u7406",
  Odoo: "Odoo",
  Automation: "\u81ea\u52a8\u5316",
  Security: "\u5b89\u5168"
};

const zhSubcategoryLabelMap: Record<string, string> = {
  "Workflow Regression": "\u5de5\u4f5c\u6d41\u56de\u5f52",
  "Repository Sync": "\u4ed3\u5e93\u540c\u6b65",
  "Policy Checks": "\u7b56\u7565\u68c0\u67e5",
  "Repository Guard": "\u4ed3\u5e93\u5b88\u62a4",
  "UI Review": "\u754c\u9762\u5ba1\u67e5",
  "Assertion Library": "\u65ad\u8a00\u5e93",
  "Browser Tasks": "\u6d4f\u89c8\u5668\u4efb\u52a1",
  "Coverage Matrix": "\u8986\u76d6\u77e9\u9635",
  "Release Notes": "\u53d1\u5e03\u8bf4\u660e",
  "Permission Validation": "\u6743\u9650\u6821\u9a8c",
  "Report Pipeline": "\u62a5\u544a\u6d41\u6c34\u7ebf"
};

const zhDescriptionMap: Record<string, string> = {
  "Reason: stable regression flow and high script reuse.": "\u63a8\u8350\u7406\u7531\uff1a\u56de\u5f52\u7a33\u5b9a\uff0c\u811a\u672c\u590d\u7528\u7387\u9ad8\u3002",
  "Reason: auditable sync chain and traceable failure path.": "\u63a8\u8350\u7406\u7531\uff1a\u540c\u6b65\u94fe\u8def\u53ef\u5ba1\u8ba1\uff0c\u6545\u969c\u8def\u5f84\u53ef\u8ffd\u8e2a\u3002",
  "Reason: consistent standards and lower rollout risk.": "\u63a8\u8350\u7406\u7531\uff1a\u89c4\u8303\u4e00\u81f4\uff0c\u53d1\u5e03\u98ce\u9669\u66f4\u4f4e\u3002",
  "Tags: repository / diff": "\u6807\u7b7e\uff1a\u4ed3\u5e93 / \u5dee\u5f02",
  "Tags: Odoo / review": "\u6807\u7b7e\uff1aOdoo / \u5ba1\u67e5",
  "Tags: workflow / assertion": "\u6807\u7b7e\uff1a\u5de5\u4f5c\u6d41 / \u65ad\u8a00",
  "Tags: browser / task": "\u6807\u7b7e\uff1a\u6d4f\u89c8\u5668 / \u4efb\u52a1",
  "Tags: testing / matrix": "\u6807\u7b7e\uff1a\u6d4b\u8bd5 / \u77e9\u9635",
  "Tags: release / change": "\u6807\u7b7e\uff1a\u53d1\u5e03 / \u53d8\u66f4",
  "Template match, retry strategy, and assertion coverage for Odoo workflow tests.": "Odoo \u5de5\u4f5c\u6d41\u6d4b\u8bd5\u7684\u6a21\u677f\u5339\u914d\u3001\u91cd\u8bd5\u7b56\u7565\u4e0e\u65ad\u8a00\u8986\u76d6\u3002",
  "Permission path checks and visual diff verification for role journeys.": "\u89d2\u8272\u94fe\u8def\u7684\u6743\u9650\u8def\u5f84\u68c0\u67e5\u4e0e\u89c6\u89c9\u5dee\u5f02\u6821\u9a8c\u3002",
  "High coverage nightly regression and reusable report generation.": "\u9ad8\u8986\u76d6\u591c\u95f4\u56de\u5f52\u4e0e\u53ef\u590d\u7528\u62a5\u544a\u751f\u6210\u3002"
};

function normalizeText(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function normalizeFacet(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokenizeQuery(value: string): string[] {
  return normalizeText(value)
    .split(/[\s,;|/]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function includesFold(text: string, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }
  return normalizeText(text).includes(normalizedQuery);
}

function includesAllTokens(text: string, query: string): boolean {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return true;
  }
  const normalized = normalizeText(text);
  return tokens.every((token) => normalized.includes(token));
}

function sortPool(items: MarketplaceSkill[], sort: string): MarketplaceSkill[] {
  const normalizedSort = normalizeText(sort);
  if (normalizedSort === "stars") {
    const sorted = [...items];
    sorted.sort(
      (left, right) =>
        right.star_count - left.star_count || right.quality_score - left.quality_score || right.id - left.id
    );
    return sorted;
  }
  if (normalizedSort === "quality") {
    const sorted = [...items];
    sorted.sort(
      (left, right) =>
        right.quality_score - left.quality_score || right.star_count - left.star_count || right.id - left.id
    );
    return sorted;
  }
  return [...items];
}

function localizeCategoryLabel(locale: AppLocale, label: string): string {
  if (locale !== "zh") {
    return label;
  }
  return zhCategoryLabelMap[label] || label;
}

function localizeSubcategoryLabel(locale: AppLocale, label: string): string {
  if (locale !== "zh") {
    return label;
  }
  return zhSubcategoryLabelMap[label] || label;
}

function localizeDescription(locale: AppLocale, value: string): string {
  if (locale !== "zh") {
    return value;
  }
  return zhDescriptionMap[value] || value;
}

function dedupeCategories(items: MarketplaceSkill[], locale: AppLocale): MarketplaceCategory[] {
  const bucket = new Map<string, Map<string, number>>();
  for (const item of items) {
    const category = item.category || "Uncategorized";
    const subcategory = item.subcategory || "General";
    if (!bucket.has(category)) {
      bucket.set(category, new Map<string, number>());
    }
    const subBucket = bucket.get(category)!;
    subBucket.set(subcategory, (subBucket.get(subcategory) || 0) + 1);
  }

  return Array.from(bucket.entries()).map(([category, subBucket]) => {
    const subcategories = Array.from(subBucket.entries()).map(([subcategory, count]) => ({
      slug: subcategory.toLowerCase().replace(/\s+/g, "-"),
      name: localizeSubcategoryLabel(locale, subcategory),
      count
    }));
    return {
      slug: category.toLowerCase().replace(/\s+/g, "-"),
      name: localizeCategoryLabel(locale, category),
      description: "",
      count: subcategories.reduce((total, item) => total + item.count, 0),
      subcategories
    };
  });
}

function canOpenDashboard(user: SessionUser | null): boolean {
  if (!user) {
    return false;
  }
  return ["super_admin", "admin", "member"].includes(String(user.role || "").toLowerCase());
}

function localizeSource(locale: AppLocale, sourceType: string): string {
  if (locale === "zh") {
    if (sourceType === "official") {
      return "\u5b98\u65b9";
    }
    if (sourceType === "verified_community") {
      return "\u5df2\u9a8c\u8bc1\u793e\u533a";
    }
  }
  if (sourceType === "official") {
    return "Official";
  }
  if (sourceType === "verified_community") {
    return "Verified Community";
  }
  return sourceType;
}

export function buildMarketplaceFallback(
  query: MarketplaceQueryParams,
  locale: AppLocale,
  sessionUser: SessionUser | null
): PublicMarketplaceResponse {
  const prototypePageSize = 24;
  const normalizedCategory = normalizeFacet(String(query.category || ""));
  const normalizedSubcategory = normalizeFacet(String(query.subcategory || ""));
  const normalizedKeyword = String(query.q || "");
  const normalizedTags = String(query.tags || "");

  const filtered = prototypeSkillPool.filter((item) => {
    const source = localizeSource(locale, item.source_type);
    const searchable = `${item.name} ${item.description} ${item.tags.join(" ")} ${item.category} ${item.subcategory} ${source}`;
    if (!includesFold(searchable, normalizedKeyword)) {
      return false;
    }
    if (!includesAllTokens(searchable, normalizedTags)) {
      return false;
    }
    if (normalizedCategory && normalizeFacet(item.category) !== normalizedCategory) {
      return false;
    }
    if (normalizedSubcategory && normalizeFacet(item.subcategory) !== normalizedSubcategory) {
      return false;
    }
    return true;
  });

  const effectivePool = sortPool(filtered, String(query.sort || "recent"));
  const prototypeTotalItems = effectivePool.length;
  const prototypeTotalPages = Math.max(1, Math.ceil(prototypeTotalItems / prototypePageSize));
  const page = Math.min(prototypeTotalPages, Math.max(1, Number(query.page || 1) || 1));
  const start = (page - 1) * prototypePageSize;
  const items = effectivePool.slice(start, start + prototypePageSize).map((item) => ({
    ...item,
    description: localizeDescription(locale, item.description),
    category: localizeCategoryLabel(locale, item.category),
    subcategory: localizeSubcategoryLabel(locale, item.subcategory),
    source_type: localizeSource(locale, item.source_type)
  }));

  const tagCounter = new Map<string, number>();
  for (const item of effectivePool) {
    for (const tag of item.tags) {
      tagCounter.set(tag, (tagCounter.get(tag) || 0) + 1);
    }
  }
  const topTags = Array.from(tagCounter.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  return {
    filters: {
      q: String(query.q || ""),
      tags: String(query.tags || ""),
      category: String(query.category || ""),
      subcategory: String(query.subcategory || ""),
      sort: String(query.sort || "recent"),
      mode: String(query.mode || "keyword")
    },
    stats: {
      total_skills: 12480 + prototypeSkillPool.length,
      matching_skills: prototypeTotalItems
    },
    pagination: {
      page,
      page_size: prototypePageSize,
      total_items: prototypeTotalItems,
      total_pages: prototypeTotalPages,
      prev_page: page > 1 ? page - 1 : 0,
      next_page: page < prototypeTotalPages ? page + 1 : 0
    },
    categories: dedupeCategories(prototypeSkillPool, locale),
    top_tags: topTags,
    items,
    session_user: sessionUser,
    can_access_dashboard: canOpenDashboard(sessionUser)
  };
}
