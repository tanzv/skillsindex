export interface SessionUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
  status: string;
}

export interface IntegrationConnector {
  id: number;
  name: string;
  provider: string;
  description: string;
  base_url: string;
  enabled: boolean;
  updated_at: string;
}

export interface WebhookLog {
  id: number;
  connector_id: number;
  event_type: string;
  outcome: string;
  status_code: number;
  endpoint: string;
  delivered_at: string;
}

export interface AdminIntegrationsResponse {
  items: IntegrationConnector[];
  total: number;
  webhook_logs: WebhookLog[];
  webhook_total: number;
}

export interface OpsMetrics {
  open_incidents: number;
  pending_moderation_cases: number;
  unresolved_jobs: number;
  failed_sync_runs_24h: number;
  disabled_accounts: number;
  stale_integrations: number;
}

export interface AdminOpsMetricsResponse {
  item: OpsMetrics;
}

export interface MarketplaceSubcategory {
  slug: string;
  name: string;
  count: number;
}

export interface MarketplaceCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
  subcategories: MarketplaceSubcategory[];
}

export interface MarketplaceTag {
  name: string;
  count: number;
}

export interface MarketplaceSkill {
  id: number;
  name: string;
  description: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  source_type: string;
  source_url: string;
  star_count: number;
  quality_score: number;
  install_command: string;
  updated_at: string;
}

export interface MarketplaceFilters {
  q: string;
  tags: string;
  category: string;
  subcategory: string;
  sort: string;
  mode: string;
}

export interface MarketplaceFilterOption {
  value: string;
  label?: string;
}

export interface MarketplaceCategoryFilterOptions {
  category_slug: string;
  sort?: MarketplaceFilterOption[];
  mode?: MarketplaceFilterOption[];
}

export interface MarketplaceFilterOptions {
  sort?: MarketplaceFilterOption[];
  mode?: MarketplaceFilterOption[];
  category_overrides?: MarketplaceCategoryFilterOptions[];
}

export interface MarketplaceStats {
  total_skills: number;
  matching_skills: number;
}

export interface MarketplacePagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  prev_page: number;
  next_page: number;
}

export interface PublicMarketplaceResponse {
  filters: MarketplaceFilters;
  stats: MarketplaceStats;
  pagination: MarketplacePagination;
  categories: MarketplaceCategory[];
  top_tags: MarketplaceTag[];
  filter_options?: MarketplaceFilterOptions;
  items: MarketplaceSkill[];
  session_user: SessionUser | null;
  can_access_dashboard: boolean;
}

export interface SkillInteractionStats {
  favorite_count: number;
  rating_count: number;
  rating_average: number;
  comment_count: number;
}

export interface PublicSkillDetailViewerState {
  can_interact: boolean;
  favorited: boolean;
  rated: boolean;
  rating: number;
}

export interface PublicSkillDetailComment {
  id: number;
  skill_id: number;
  user_id: number;
  username: string;
  display_name: string;
  content: string;
  created_at: string;
  can_delete: boolean;
}

export interface PublicSkillDetailResponse {
  skill: MarketplaceSkill;
  stats: SkillInteractionStats;
  viewer_state: PublicSkillDetailViewerState;
  comments: PublicSkillDetailComment[];
  comments_limit: number;
}

export interface SkillFavoriteMutationResponse {
  ok: boolean;
  favorited: boolean;
  stats?: SkillInteractionStats;
}

export interface SkillRatingMutationResponse {
  ok: boolean;
  score: number;
  stats?: SkillInteractionStats;
}

export interface SkillCommentCreateMutationResponse {
  ok: boolean;
  comment: {
    id: number;
    skill_id: number;
    user_id: number;
    content: string;
    created_at: string;
  };
}

export interface SkillCommentDeleteMutationResponse {
  ok: boolean;
  comment_id: number;
}

export interface MarketplaceQueryParams extends Partial<MarketplaceFilters> {
  page?: number | string;
}

export interface AuthProviderEntry {
  key: string;
  start_path: string;
}

export interface AuthProvidersResponse {
  ok: boolean;
  auth_providers: string[];
  items: AuthProviderEntry[];
}

interface ErrorPayload {
  error?: string;
  message?: string;
}

interface APIRequestError extends Error {
  status?: number;
}

type AuthProvidersFetchMode = "auto" | "always" | "never";

const localeStorageKey = "skillsindex.locale";
const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const serverOriginURL = (() => {
  try {
    return new URL(apiBaseURL).origin;
  } catch {
    return "http://localhost:8080";
  }
})();

export const serverBaseURL = serverOriginURL;

export function buildServerURL(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${serverOriginURL}${normalized}`;
}
let csrfTokenCache = "";

function createAPIRequestError(status: number, message: string): APIRequestError {
  const error = new Error(message) as APIRequestError;
  error.status = status;
  return error;
}
function resolveAuthProvidersFetchMode(rawMode: string | undefined): AuthProvidersFetchMode {
  switch (String(rawMode || "").trim().toLowerCase()) {
    case "always":
      return "always";
    case "never":
      return "never";
    default:
      return "auto";
  }
}

function readRuntimeAuthProvidersFetchMode(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return String(
    (
      window as Window & {
        __SKILLSINDEX_LOGIN_AUTH_PROVIDERS_MODE__?: unknown;
      }
    ).__SKILLSINDEX_LOGIN_AUTH_PROVIDERS_MODE__ || ""
  ).trim();
}

export function shouldFetchAuthProviders(currentOrigin?: string): boolean {
  const runtimeMode = readRuntimeAuthProvidersFetchMode();
  const mode = resolveAuthProvidersFetchMode(runtimeMode || import.meta.env.VITE_LOGIN_AUTH_PROVIDERS_MODE);
  if (mode === "always") return true;
  if (mode === "never") return false;
  return String(currentOrigin || "").trim() === serverOriginURL;
}

export function resolveRequestAcceptLanguage(): string {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    if (storedLocale === "en" || storedLocale === "zh") {
      return storedLocale;
    }
  } catch {
    // Ignore localStorage access failures and fallback to navigator language.
  }

  const browserLanguage = String(window.navigator.language || "").trim().toLowerCase();
  if (browserLanguage.startsWith("zh")) {
    return "zh";
  }
  return "en";
}

async function ensureCSRFToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }
  const response = await fetch(`${apiBaseURL}/api/v1/auth/csrf`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Accept-Language": resolveRequestAcceptLanguage()
    },
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Failed to initialize CSRF token");
  }
  const payload = (await response.json()) as { csrf_token?: string };
  const token = String(payload.csrf_token || "").trim();
  if (!token) {
    throw new Error("Invalid CSRF token response");
  }
  csrfTokenCache = token;
  return token;
}

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const headers = new Headers(init?.headers || {});

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", resolveRequestAcceptLanguage());
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await ensureCSRFToken();
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${apiBaseURL}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    let details = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as ErrorPayload;
      details = payload.message || payload.error || details;
    } catch {
      const text = await response.text();
      if (text.trim()) {
        details = text;
      }
    }
    throw createAPIRequestError(response.status, details);
  }

  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
}

export async function login(username: string, password: string): Promise<SessionUser> {
  const payload = await requestJSON<{ user: SessionUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  return payload.user;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const payload = await requestJSON<{ user: SessionUser | null }>("/api/v1/auth/me", {
      method: "GET"
    });
    return payload.user || null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await requestJSON<{ ok: boolean }>("/api/v1/auth/logout", {
    method: "POST"
  });
  csrfTokenCache = "";
}

export async function fetchAuthProviders(): Promise<AuthProvidersResponse> {
  try {
    return await requestJSON<AuthProvidersResponse>("/api/v1/auth/providers", {
      method: "GET"
    });
  } catch (error) {
    if ((error as APIRequestError).status === 404) {
      return {
        ok: true,
        auth_providers: [],
        items: []
      };
    }
    throw error;
  }
}

export async function fetchAdminIntegrations(): Promise<AdminIntegrationsResponse> {
  return requestJSON<AdminIntegrationsResponse>("/api/v1/admin/integrations?limit=20", {
    method: "GET"
  });
}

export async function fetchAdminOpsMetrics(): Promise<AdminOpsMetricsResponse> {
  return requestJSON<AdminOpsMetricsResponse>("/api/v1/admin/ops/metrics", {
    method: "GET"
  });
}

export async function fetchPublicMarketplace(query: MarketplaceQueryParams): Promise<PublicMarketplaceResponse> {
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
  if (query.sort) {
    params.set("sort", query.sort);
  }
  if (query.mode) {
    params.set("mode", query.mode);
  }
  const page = Number(query.page || "");
  if (Number.isFinite(page) && page > 0) {
    params.set("page", String(page));
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return requestJSON<PublicMarketplaceResponse>(`/api/v1/public/marketplace${suffix}`, {
    method: "GET"
  });
}

export async function fetchPublicSkillDetail(skillID: number): Promise<PublicSkillDetailResponse> {
  const resolvedSkillID = Number(skillID);
  if (!Number.isFinite(resolvedSkillID) || resolvedSkillID <= 0) {
    throw new Error("Invalid skill id");
  }
  return requestJSON<PublicSkillDetailResponse>(`/api/v1/public/skills/${Math.trunc(resolvedSkillID)}`, {
    method: "GET"
  });
}

export async function setSkillFavorite(skillID: number, favorite?: boolean): Promise<SkillFavoriteMutationResponse> {
  const payload = typeof favorite === "boolean" ? { favorite } : undefined;
  return postConsoleJSON<SkillFavoriteMutationResponse>(`/api/v1/skills/${skillID}/favorite`, payload);
}

export async function submitSkillRating(skillID: number, score: number): Promise<SkillRatingMutationResponse> {
  return postConsoleJSON<SkillRatingMutationResponse>(`/api/v1/skills/${skillID}/rating`, { score });
}

export async function createSkillComment(skillID: number, content: string): Promise<SkillCommentCreateMutationResponse> {
  return postConsoleJSON<SkillCommentCreateMutationResponse>(`/api/v1/skills/${skillID}/comments`, { content });
}

export async function deleteSkillComment(skillID: number, commentID: number): Promise<SkillCommentDeleteMutationResponse> {
  return postConsoleJSON<SkillCommentDeleteMutationResponse>(`/api/v1/skills/${skillID}/comments/${commentID}/delete`);
}

export async function fetchConsoleJSON<T = Record<string, unknown>>(path: string): Promise<T> {
  return requestJSON<T>(path, { method: "GET" });
}

export async function postConsoleJSON<T = Record<string, unknown>>(
  path: string,
  payload?: Record<string, unknown>
): Promise<T> {
  if (payload && Object.keys(payload).length > 0) {
    return requestJSON<T>(path, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
  return requestJSON<T>(path, {
    method: "POST"
  });
}
