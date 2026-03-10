import type { MarketplaceCategory, MarketplaceQueryParams, MarketplaceSkill } from "../../lib/api";
import { prototypeLightThemeCoverURLs } from "./MarketplaceHomePage.cardTheme";

export interface MarketplaceFilterForm {
  q: string;
  tags: string;
  category: string;
  subcategory: string;
  sort: string;
  mode: string;
}

export const defaultFilterForm: MarketplaceFilterForm = {
  q: "",
  tags: "",
  category: "",
  subcategory: "",
  sort: "recent",
  mode: "keyword"
};

export function parseQueryState(search: string): MarketplaceQueryParams {
  const params = new URLSearchParams(search);
  const page = Number(params.get("page") || "1");
  return {
    q: (params.get("q") || "").trim(),
    tags: (params.get("tags") || "").trim(),
    category: (params.get("category") || "").trim(),
    subcategory: (params.get("subcategory") || "").trim(),
    sort: (params.get("sort") || "recent").trim().toLowerCase(),
    mode: (params.get("mode") || "keyword").trim().toLowerCase(),
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.replace(/\/+$/, "");
}

export function buildMarketplacePath(query: MarketplaceQueryParams, basePath = "/"): string {
  const normalizedBase = normalizeBasePath(basePath);
  const params = new URLSearchParams();
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.tags) {
    params.set("tags", query.tags);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.subcategory) {
    params.set("subcategory", query.subcategory);
  }
  if (query.sort && query.sort !== "recent") {
    params.set("sort", query.sort);
  }
  if (query.mode && query.mode !== "keyword") {
    params.set("mode", query.mode);
  }
  const page = Number(query.page || "1");
  if (Number.isFinite(page) && page > 1) {
    params.set("page", String(page));
  }
  const encoded = params.toString();
  return encoded ? `${normalizedBase}?${encoded}` : normalizedBase;
}

export function resolveStateClass(item: MarketplaceSkill): string {
  if (item.quality_score >= 9) {
    return "is-stable";
  }
  if (item.quality_score >= 8) {
    return "is-growing";
  }
  return "is-risk";
}

export function resolveStateLabel(item: MarketplaceSkill, locale: "en" | "zh" = "en"): string {
  if (item.quality_score >= 9) {
    return locale === "zh" ? "\u7a33\u5b9a" : "Stable";
  }
  if (item.quality_score >= 8) {
    return locale === "zh" ? "\u589e\u957f" : "Growing";
  }
  return locale === "zh" ? "\u98ce\u9669" : "Risk";
}

export function categoryLabel(categories: MarketplaceCategory[], slug: string): string {
  if (!slug) {
    return "All categories";
  }
  const matched = categories.find((item) => item.slug === slug);
  return matched?.name || slug;
}

export function subcategoryLabel(categories: MarketplaceCategory[], slug: string): string {
  if (!slug) {
    return "All subcategories";
  }
  for (const category of categories) {
    const matched = category.subcategories.find((item) => item.slug === slug);
    if (matched) {
      return matched.name;
    }
  }
  return slug;
}

export function dedupeSubcategories(categories: MarketplaceCategory[]): { label: string; value: string }[] {
  const seen = new Map<string, string>();
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      if (!seen.has(subcategory.slug)) {
        seen.set(subcategory.slug, subcategory.name);
      }
    }
  }
  return Array.from(seen.entries()).map(([value, label]) => ({ label, value }));
}

export function formatSource(sourceType: string): string {
  return sourceType.toUpperCase().replaceAll("_", " ");
}

export function buildPageWindow(current: number, total: number): number[] {
  if (total <= 1) {
    return [1];
  }

  if (total <= 6) {
    return Array.from(new Set([1, 2, 3, 4, 5, 6].filter((page) => page >= 1 && page <= total)));
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, total];
  }

  if (current >= total - 2) {
    return [1, total - 4, total - 3, total - 2, total - 1, total];
  }

  return Array.from(new Set([1, current - 1, current, current + 1, current + 2, total].filter((page) => page >= 1 && page <= total)));
}

export function averageQuality(items: MarketplaceSkill[]): number {
  if (items.length === 0) {
    return 0;
  }
  const total = items.reduce((sum, item) => sum + item.quality_score, 0);
  return Number((total / items.length).toFixed(1));
}

export function computePrototypeScale(
  viewportWidth: number,
  viewportHeight: number,
  canvasWidth = 1440,
  canvasHeight = 900,
  safeInset = 8
): number {
  const usableWidth = Math.max(1, viewportWidth - safeInset);
  const usableHeight = Math.max(1, viewportHeight - safeInset);
  const widthScale = usableWidth / canvasWidth;
  const heightScale = usableHeight / canvasHeight;
  const scale = Math.min(widthScale, heightScale);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

export interface PrototypeCardContent {
  code: string;
  chips: [string, string];
  coverImageURL: string;
  title: string;
  subtitle: string;
  meta: string;
}

export interface PrototypeCardEntry extends PrototypeCardContent {
  skillID: number | null;
}

export interface PrototypeCardGroups {
  featured: PrototypeCardEntry[];
  latest: PrototypeCardEntry[];
}

interface PrototypeCardTemplateGroups {
  featured: PrototypeCardContent[];
  latest: PrototypeCardContent[];
}

type PrototypeCardLocale = "en" | "zh";
type PrototypeCardTheme = "dark" | "light";

interface BuildPrototypeCardGroupOptions {
  theme?: PrototypeCardTheme;
  useSkillPayload?: boolean;
}

const prototypeCardTemplates: Record<PrototypeCardLocale, PrototypeCardTemplateGroups> = {
  en: {
    featured: [
      {
        code: "PL",
        chips: ["Automation", "E2E"],
        coverImageURL:
          "https://images.unsplash.com/photo-1583674392456-1f2830df8e69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDR8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Playwright Flow Guardian",
        subtitle: "Reason: stable regression flow and high script reuse.",
        meta: "View details · Add to queue"
      },
      {
        code: "SK",
        chips: ["Sync", "Audit"],
        coverImageURL:
          "https://images.unsplash.com/photo-1746562280575-9aca53a0d989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDR8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Skill Sync Auditor",
        subtitle: "Reason: auditable sync chain and traceable failure path.",
        meta: "View details · Add to queue"
      },
      {
        code: "PR",
        chips: ["Policy", "Lint"],
        coverImageURL:
          "https://images.unsplash.com/photo-1514906637995-8c8032a3bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDV8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Prompt Policy Linter",
        subtitle: "Reason: consistent standards and lower rollout risk.",
        meta: "View details · Add to queue"
      }
    ],
    latest: [
      {
        code: "RE",
        chips: ["Repo", "Diff"],
        coverImageURL:
          "https://images.unsplash.com/photo-1615753620051-dc53d91acbdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Repository Diff Sentinel",
        subtitle: "Tags: repository / diff",
        meta: "Details | Install | Queue"
      },
      {
        code: "OD",
        chips: ["Odoo", "UI"],
        coverImageURL:
          "https://images.unsplash.com/photo-1514906637995-8c8032a3bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDd8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Odoo UI Inspector",
        subtitle: "Tags: Odoo / review",
        meta: "Details | Install | Queue"
      },
      {
        code: "WO",
        chips: ["Workflow", "Assert"],
        coverImageURL:
          "https://images.unsplash.com/photo-1678988498674-958509e12591?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDh8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Workflow Assertion Pack",
        subtitle: "Tags: workflow / assertion",
        meta: "Details | Install | Queue"
      },
      {
        code: "BR",
        chips: ["Browser", "Runner"],
        coverImageURL:
          "https://images.unsplash.com/photo-1743404318518-32d963f26501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjV8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Browser Task Runner",
        subtitle: "Tags: browser / task",
        meta: "Details | Install | Queue"
      },
      {
        code: "TE",
        chips: ["Testing", "Matrix"],
        coverImageURL:
          "https://images.unsplash.com/photo-1599974816500-b7c5c6641b2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Test Matrix Builder",
        subtitle: "Tags: testing / matrix",
        meta: "Details | Install | Queue"
      },
      {
        code: "RE",
        chips: ["Release", "Docs"],
        coverImageURL:
          "https://images.unsplash.com/photo-1698333259599-c47ccc5908e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjd8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Release Notes Composer",
        subtitle: "Tags: release / change",
        meta: "Details | Install | Queue"
      },
      {
        code: "BR",
        chips: ["Browser", "Runner"],
        coverImageURL:
          "https://images.unsplash.com/photo-1763013373616-2d81a44ab7ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjh8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Browser Task Runner",
        subtitle: "Tags: browser / task",
        meta: "Details | Install | Queue"
      },
      {
        code: "TE",
        chips: ["Testing", "Matrix"],
        coverImageURL:
          "https://images.unsplash.com/photo-1542979666-fbcbcd5ffed1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjl8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Test Matrix Builder",
        subtitle: "Tags: testing / matrix",
        meta: "Details | Install | Queue"
      },
      {
        code: "RE",
        chips: ["Release", "Docs"],
        coverImageURL:
          "https://images.unsplash.com/photo-1725887150031-d353e5c4ce3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjl8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Release Notes Composer",
        subtitle: "Tags: release / change",
        meta: "Details | Install | Queue"
      },
      {
        code: "BR",
        chips: ["Browser", "Runner"],
        coverImageURL:
          "https://images.unsplash.com/photo-1669199145926-7dad570f3c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwNDZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Browser Task Runner",
        subtitle: "Tags: browser / task",
        meta: "Details | Install | Queue"
      },
      {
        code: "TE",
        chips: ["Testing", "Matrix"],
        coverImageURL:
          "https://images.unsplash.com/photo-1708962188322-0e9a5e40c101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwNDZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Test Matrix Builder",
        subtitle: "Tags: testing / matrix",
        meta: "Details | Install | Queue"
      },
      {
        code: "RE",
        chips: ["Release", "Docs"],
        coverImageURL:
          "https://images.unsplash.com/photo-1670012896865-f531c5fb65d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwNDd8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Release Notes Composer",
        subtitle: "Tags: release / change",
        meta: "Details | Install | Queue"
      }
    ]
  },
  zh: {
    featured: [
      {
        code: "PL",
        chips: ["Automation", "E2E"],
        coverImageURL:
          "https://images.unsplash.com/photo-1583674392456-1f2830df8e69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDR8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Playwright Flow Guardian",
        subtitle: "\u63a8\u8350\u7406\u7531\uff1a\u56de\u5f52\u7a33\u5b9a\u3001\u811a\u672c\u590d\u7528\u7387\u9ad8",
        meta: "View details \u00b7 Add to queue"
      },
      {
        code: "SK",
        chips: ["Sync", "Audit"],
        coverImageURL:
          "https://images.unsplash.com/photo-1746562280575-9aca53a0d989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDR8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Skill Sync Auditor",
        subtitle: "\u63a8\u8350\u7406\u7531\uff1a\u540c\u6b65\u94fe\u8def\u53ef\u5ba1\u8ba1\u3001\u5931\u8d25\u53ef\u8ffd\u8e2a",
        meta: "View details \u00b7 Add to queue"
      },
      {
        code: "PR",
        chips: ["Policy", "Lint"],
        coverImageURL:
          "https://images.unsplash.com/photo-1514906637995-8c8032a3bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDV8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Prompt Policy Linter",
        subtitle: "\u63a8\u8350\u7406\u7531\uff1a\u56e2\u961f\u89c4\u8303\u4e00\u81f4\u3001\u53d1\u5e03\u98ce\u9669\u66f4\u4f4e",
        meta: "View details \u00b7 Add to queue"
      }
    ],
    latest: [
      {
        code: "RE",
        chips: ["Repo", "Diff"],
        coverImageURL:
          "https://images.unsplash.com/photo-1615753620051-dc53d91acbdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Repository Diff Sentinel",
        subtitle: "\u6807\u7b7e\uff1a\u4ed3\u5e93 / \u5dee\u5f02",
        meta: "Details | Install | Queue"
      },
      {
        code: "OD",
        chips: ["Odoo", "UI"],
        coverImageURL:
          "https://images.unsplash.com/photo-1514906637995-8c8032a3bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDd8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Odoo UI Inspector",
        subtitle: "\u6807\u7b7e\uff1aOdoo / \u5ba1\u6838",
        meta: "Details | Install | Queue"
      },
      {
        code: "WO",
        chips: ["Workflow", "Assert"],
        coverImageURL:
          "https://images.unsplash.com/photo-1678988498674-958509e12591?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMDh8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Workflow Assertion Pack",
        subtitle: "\u6807\u7b7e\uff1a\u5de5\u4f5c\u6d41 / \u65ad\u8a00",
        meta: "Details | Install | Queue"
      },
      {
        code: "BR",
        chips: ["Browser", "Runner"],
        coverImageURL:
          "https://images.unsplash.com/photo-1743404318518-32d963f26501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjV8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Browser Task Runner",
        subtitle: "\u6807\u7b7e\uff1a\u6d4f\u89c8\u5668 / \u4efb\u52a1",
        meta: "Details | Install | Queue"
      },
      {
        code: "TE",
        chips: ["Testing", "Matrix"],
        coverImageURL:
          "https://images.unsplash.com/photo-1599974816500-b7c5c6641b2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Test Matrix Builder",
        subtitle: "\u6807\u7b7e\uff1a\u6d4b\u8bd5 / \u77e9\u9635",
        meta: "Details | Install | Queue"
      },
      {
        code: "RE",
        chips: ["Release", "Docs"],
        coverImageURL:
          "https://images.unsplash.com/photo-1698333259599-c47ccc5908e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjd8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Release Notes Composer",
        subtitle: "\u6807\u7b7e\uff1a\u53d1\u5e03 / \u53d8\u66f4",
        meta: "Details | Install | Queue"
      },
      {
        code: "BR",
        chips: ["Browser", "Runner"],
        coverImageURL:
          "https://images.unsplash.com/photo-1763013373616-2d81a44ab7ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjh8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Browser Task Runner",
        subtitle: "\u6807\u7b7e\uff1a\u6d4f\u89c8\u5668 / \u4efb\u52a1",
        meta: "Details | Install | Queue"
      },
      {
        code: "TE",
        chips: ["Testing", "Matrix"],
        coverImageURL:
          "https://images.unsplash.com/photo-1542979666-fbcbcd5ffed1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjl8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Test Matrix Builder",
        subtitle: "\u6807\u7b7e\uff1a\u6d4b\u8bd5 / \u77e9\u9635",
        meta: "Details | Install | Queue"
      },
      {
        code: "RE",
        chips: ["Release", "Docs"],
        coverImageURL:
          "https://images.unsplash.com/photo-1725887150031-d353e5c4ce3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwMjl8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Release Notes Composer",
        subtitle: "\u6807\u7b7e\uff1a\u53d1\u5e03 / \u53d8\u66f4",
        meta: "Details | Install | Queue"
      },
      {
        code: "BR",
        chips: ["Browser", "Runner"],
        coverImageURL:
          "https://images.unsplash.com/photo-1669199145926-7dad570f3c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwNDZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Browser Task Runner",
        subtitle: "\u6807\u7b7e\uff1a\u6d4f\u89c8\u5668 / \u4efb\u52a1",
        meta: "Details | Install | Queue"
      },
      {
        code: "TE",
        chips: ["Testing", "Matrix"],
        coverImageURL:
          "https://images.unsplash.com/photo-1708962188322-0e9a5e40c101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwNDZ8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Test Matrix Builder",
        subtitle: "\u6807\u7b7e\uff1a\u6d4b\u8bd5 / \u77e9\u9635",
        meta: "Details | Install | Queue"
      },
      {
        code: "RE",
        chips: ["Release", "Docs"],
        coverImageURL:
          "https://images.unsplash.com/photo-1670012896865-f531c5fb65d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NDUwNDd8&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Release Notes Composer",
        subtitle: "\u6807\u7b7e\uff1a\u53d1\u5e03 / \u53d8\u66f4",
        meta: "Details | Install | Queue"
      }
    ]
  }
};

function applyThemeCoverURLs(
  templates: PrototypeCardContent[],
  themeCoverURLs: string[]
): PrototypeCardContent[] {
  return templates.map((template, index) => ({
    ...template,
    coverImageURL: themeCoverURLs[index] || template.coverImageURL
  }));
}

function resolveSkillID(items: MarketplaceSkill[], index: number): number | null {
  if (items.length === 0) {
    return null;
  }
  const picked = items[index % items.length];
  return picked?.id || null;
}

function normalizeChipLabel(raw: string): string {
  const normalized = raw.replace(/[_-]+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  const [first] = normalized.split(/\s+/);
  if (!first) {
    return "";
  }
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function resolveCardChips(template: PrototypeCardContent, skill: MarketplaceSkill | null): [string, string] {
  if (!skill || skill.tags.length === 0) {
    return template.chips;
  }
  const primary = normalizeChipLabel(skill.tags[0] || "");
  const secondary = normalizeChipLabel(skill.tags[1] || "");
  return [
    primary || template.chips[0],
    secondary || template.chips[1]
  ];
}

function resolveCardSubtitle(template: PrototypeCardContent, skill: MarketplaceSkill | null, locale: PrototypeCardLocale): string {
  if (!skill) {
    return template.subtitle;
  }
  if (locale === "zh") {
    return template.subtitle;
  }
  const description = String(skill.description || "").trim();
  if (description) {
    return description;
  }
  if (skill.tags.length > 0) {
    return `Tags: ${skill.tags.slice(0, 2).join(" / ")}`;
  }
  return template.subtitle;
}

function attachSkillPayloads(
  templates: PrototypeCardContent[],
  items: MarketplaceSkill[],
  locale: PrototypeCardLocale,
  startOffset: number,
  useSkillPayload: boolean
): PrototypeCardEntry[] {
  return templates.map((template, index) => {
    const sourceIndex = startOffset + index;
    const skill = items.length === 0 ? null : items[sourceIndex % items.length];
    return {
      ...template,
      title: useSkillPayload ? skill?.name || template.title : template.title,
      subtitle: useSkillPayload ? resolveCardSubtitle(template, skill, locale) : template.subtitle,
      chips: useSkillPayload ? resolveCardChips(template, skill) : template.chips,
      skillID: resolveSkillID(items, sourceIndex)
    };
  });
}

export function buildPrototypeCardGroups(
  items: MarketplaceSkill[],
  locale: PrototypeCardLocale = "en",
  options: BuildPrototypeCardGroupOptions = {}
): PrototypeCardGroups {
  const templates = prototypeCardTemplates[locale] || prototypeCardTemplates.en;
  const resolvedTheme: PrototypeCardTheme = options.theme === "light" ? "light" : "dark";
  const useSkillPayload = options.useSkillPayload !== false;
  const featuredTemplates =
    resolvedTheme === "light"
      ? applyThemeCoverURLs(templates.featured, prototypeLightThemeCoverURLs.featured)
      : templates.featured;
  const latestTemplates =
    resolvedTheme === "light"
      ? applyThemeCoverURLs(templates.latest, prototypeLightThemeCoverURLs.latest)
      : templates.latest;
  return {
    featured: attachSkillPayloads(featuredTemplates, items, locale, 0, useSkillPayload),
    latest: attachSkillPayloads(latestTemplates, items, locale, featuredTemplates.length, useSkillPayload)
  };
}
