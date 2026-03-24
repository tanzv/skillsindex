export interface AdminNormalizedAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  forceLogoutAt: string;
}

export interface AdminNormalizedAccountsPayload {
  total: number;
  items: AdminNormalizedAccountItem[];
}

export interface AdminNormalizedRegistrationPayload {
  allowRegistration: boolean;
  marketplacePublicAccess: boolean;
}

export interface AdminNormalizedMarketplaceRankingPayload {
  defaultSort: "stars" | "quality";
  rankingLimit: number;
  highlightLimit: number;
  categoryLeaderLimit: number;
}

export interface AdminNormalizedAuthProvidersPayload {
  authProviders: string[];
  availableAuthProviders: string[];
}

export interface AdminNormalizedCategoryCatalogSubcategory {
  slug: string;
  name: string;
  enabled: boolean;
  sortOrder: number;
}

export interface AdminNormalizedCategoryCatalogItem {
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
  subcategories: AdminNormalizedCategoryCatalogSubcategory[];
}

export interface AdminNormalizedCategoryCatalogPayload {
  items: AdminNormalizedCategoryCatalogItem[];
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string {
  return String(value ?? "").trim();
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return false;
}

function dedupeStringList(values: unknown[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  values.forEach((value) => {
    const nextValue = asString(value).toLowerCase();
    if (!nextValue || seen.has(nextValue)) {
      return;
    }

    seen.add(nextValue);
    normalized.push(nextValue);
  });

  return normalized;
}

export function normalizeAdminAccountStatus(value: string): string {
  return asString(value).toLowerCase() || "unknown";
}

export function normalizeAdminRoleName(value: string): string {
  return asString(value).toLowerCase() || "member";
}

export function normalizeAdminAccountsPayload(payload: unknown): AdminNormalizedAccountsPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      username: asString(item.username) || "unknown",
      role: asString(item.role) || "member",
      status: asString(item.status) || "unknown",
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at),
      forceLogoutAt: asString(item.force_logout_at)
    }))
  };
}

export function normalizeAdminRegistrationPayload(payload: unknown): AdminNormalizedRegistrationPayload {
  const record = asObject(payload);

  return {
    allowRegistration: asBoolean(record.allow_registration),
    marketplacePublicAccess: record.marketplace_public_access !== false
  };
}

export function normalizeAdminMarketplaceRankingPayload(payload: unknown): AdminNormalizedMarketplaceRankingPayload {
  const record = asObject(payload);
  const defaultSort = asString(record.default_sort).toLowerCase() === "quality" ? "quality" : "stars";
  const rankingLimit = Math.max(1, asNumber(record.ranking_limit) || 12);
  const highlightLimit = Math.min(rankingLimit, Math.max(1, asNumber(record.highlight_limit) || 3));
  const categoryLeaderLimit = Math.max(1, asNumber(record.category_leader_limit) || 5);

  return {
    defaultSort,
    rankingLimit,
    highlightLimit,
    categoryLeaderLimit
  };
}

export function normalizeAdminAuthProvidersPayload(payload: unknown): AdminNormalizedAuthProvidersPayload {
  const record = asObject(payload);
  const authProviders = dedupeStringList(asArray(record.auth_providers));
  const availableAuthProviders = dedupeStringList(asArray(record.available_auth_providers));

  return {
    authProviders,
    availableAuthProviders: availableAuthProviders.length ? availableAuthProviders : authProviders
  };
}

export function normalizeAdminCategoryCatalogPayload(payload: unknown): AdminNormalizedCategoryCatalogPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items)
    .map((item, index) => {
      const subcategories = asArray<Record<string, unknown>>(item.subcategories)
        .map((subcategory, subcategoryIndex) => ({
          slug: asString(subcategory.slug),
          name: asString(subcategory.name),
          enabled: subcategory.enabled !== false,
          sortOrder: Math.max(1, asNumber(subcategory.sort_order) || (subcategoryIndex + 1) * 10)
        }))
        .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));

      return {
        slug: asString(item.slug),
        name: asString(item.name),
        description: asString(item.description),
        enabled: item.enabled !== false,
        sortOrder: Math.max(1, asNumber(item.sort_order) || (index + 1) * 10),
        subcategories
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));

  return { items };
}

export function buildAdminRoleSummary<TAccount extends { role: string }>(accounts: TAccount[]): Array<{ role: string; count: number }> {
  const roleMap = accounts.reduce<Map<string, number>>((accumulator, account) => {
    const role = normalizeAdminRoleName(account.role);
    accumulator.set(role, (accumulator.get(role) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return Array.from(roleMap.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role));
}
