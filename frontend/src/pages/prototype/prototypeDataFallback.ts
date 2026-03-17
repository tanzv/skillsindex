import { MarketplaceQueryParams, PublicMarketplaceResponse, SessionUser, fetchPublicMarketplace } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import { buildMarketplaceFallback } from "../marketplaceHome/MarketplaceHomePage.fallback";

export type PrototypeDataMode = "prototype" | "live";

export interface MarketplaceFallbackResult {
  payload: PublicMarketplaceResponse;
  degraded: boolean;
  errorMessage: string;
}

export interface MarketplaceFallbackOptions {
  query: MarketplaceQueryParams;
  locale: AppLocale;
  sessionUser: SessionUser | null;
  mode: PrototypeDataMode;
  prototypeDelayMs?: number;
}

export function resolvePrototypeDataMode(rawMode: string | undefined): PrototypeDataMode {
  const normalized = String(rawMode || "").trim().toLowerCase();
  return normalized === "live" ? "live" : "prototype";
}

function canAccessDashboard(sessionUser: SessionUser | null): boolean {
  if (!sessionUser) {
    return false;
  }
  return ["super_admin", "admin", "member"].includes(String(sessionUser.role || "").trim().toLowerCase());
}

function normalizePage(rawPage: number | string | undefined): number {
  const parsed = Number(rawPage || 1);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.max(1, Math.floor(parsed));
}

export function buildEmptyMarketplacePayload(
  query: MarketplaceQueryParams,
  sessionUser: SessionUser | null
): PublicMarketplaceResponse {
  const page = normalizePage(query.page);
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
      total_skills: 0,
      matching_skills: 0
    },
    pagination: {
      page,
      page_size: 24,
      total_items: 0,
      total_pages: Math.max(1, page),
      prev_page: page > 1 ? page - 1 : 0,
      next_page: 0
    },
    categories: [],
    top_tags: [],
    filter_options: undefined,
    items: [],
    session_user: sessionUser,
    can_access_dashboard: canAccessDashboard(sessionUser)
  };
}

function normalizeDelay(delayMs: number | undefined): number {
  if (!Number.isFinite(delayMs)) {
    return 0;
  }
  return Math.max(0, Math.floor(Number(delayMs)));
}

async function waitForDelay(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }
  await new Promise<void>((resolve) => {
    globalThis.setTimeout(() => resolve(), delayMs);
  });
}

export async function loadMarketplaceWithFallback(options: MarketplaceFallbackOptions): Promise<MarketplaceFallbackResult> {
  const fallbackPayload = buildMarketplaceFallback(options.query, options.locale, options.sessionUser);
  if (options.mode === "prototype") {
    const delayMs = normalizeDelay(options.prototypeDelayMs);
    await waitForDelay(delayMs);
    return {
      payload: fallbackPayload,
      degraded: false,
      errorMessage: ""
    };
  }

  try {
    const payload = await fetchPublicMarketplace(options.query);
    return {
      payload,
      degraded: false,
      errorMessage: ""
    };
  } catch (error) {
    return {
      payload: buildEmptyMarketplacePayload(options.query, options.sessionUser),
      degraded: true,
      errorMessage: error instanceof Error ? error.message : "Request failed"
    };
  }
}
