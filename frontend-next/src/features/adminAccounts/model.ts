import { asArray, asBoolean, asNumber, asObject, asString, formatDateTime } from "../adminGovernance/shared";

export type AdminAccountsRoute = "/admin/accounts" | "/admin/accounts/new" | "/admin/roles" | "/admin/roles/new";
export type AccountStatusFilter = "all" | "active" | "disabled";

export interface AdminAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  forceLogoutAt: string;
}

export interface AdminAccountsPayload {
  total: number;
  items: AdminAccountItem[];
}

export interface RegistrationPayload {
  allowRegistration: boolean;
  marketplacePublicAccess: boolean;
}

export interface AuthProvidersPayload {
  authProviders: string[];
  availableAuthProviders: string[];
}

export interface AccountsOverview {
  metrics: Array<{ label: string; value: string }>;
  roleSummary: Array<{ role: string; count: number }>;
}

export const adminAccountRouteMeta: Record<AdminAccountsRoute, { title: string; description: string }> = {
  "/admin/accounts": {
    title: "Accounts",
    description: "Inspect account inventory, update access state, force sign-out, and rotate credentials from a dedicated governance page."
  },
  "/admin/accounts/new": {
    title: "Account Provisioning",
    description: "Control registration posture and enabled login providers while monitoring recent account inventory."
  },
  "/admin/roles": {
    title: "Roles",
    description: "Review role distribution across the account directory and apply targeted role changes."
  },
  "/admin/roles/new": {
    title: "Role Configuration",
    description: "Stage targeted role changes while keeping directory-wide role distribution visible."
  }
};

export function normalizeAccountsPayload(payload: unknown): AdminAccountsPayload {
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

export function normalizeRegistrationPayload(payload: unknown): RegistrationPayload {
  const record = asObject(payload);
  return {
    allowRegistration: asBoolean(record.allow_registration),
    marketplacePublicAccess: record.marketplace_public_access !== false
  };
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

export function normalizeAuthProvidersPayload(payload: unknown): AuthProvidersPayload {
  const record = asObject(payload);
  const authProviders = dedupeStringList(asArray(record.auth_providers));
  const availableAuthProviders = dedupeStringList(asArray(record.available_auth_providers));
  return {
    authProviders,
    availableAuthProviders: availableAuthProviders.length ? availableAuthProviders : authProviders
  };
}

export function normalizeAccountStatus(value: string): string {
  return asString(value).toLowerCase() || "unknown";
}

export function normalizeRoleName(value: string): string {
  return asString(value).toLowerCase() || "member";
}

export function sortAccountsByUpdatedAt<TAccount extends AdminAccountItem>(accounts: TAccount[]): TAccount[] {
  return [...accounts].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt);
    const rightTime = Date.parse(right.updatedAt);
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  });
}

export function filterAccounts<TAccount extends AdminAccountItem>(accounts: TAccount[], searchQuery: string, statusFilter: AccountStatusFilter): TAccount[] {
  const normalizedQuery = asString(searchQuery).toLowerCase();
  return accounts.filter((account) => {
    const status = normalizeAccountStatus(account.status);
    if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return `${account.username} ${account.role} ${account.status} ${account.id}`.toLowerCase().includes(normalizedQuery);
  });
}

export function buildRoleSummary(accounts: AdminAccountItem[]): Array<{ role: string; count: number }> {
  const roleMap = accounts.reduce<Map<string, number>>((accumulator, account) => {
    const role = normalizeRoleName(account.role);
    accumulator.set(role, (accumulator.get(role) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return Array.from(roleMap.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role));
}

export function buildAccountsOverview(accounts: AdminAccountsPayload): AccountsOverview {
  const disabledCount = accounts.items.filter((account) => normalizeAccountStatus(account.status) === "disabled").length;
  const activeCount = accounts.items.filter((account) => normalizeAccountStatus(account.status) === "active").length;
  return {
    metrics: [
      { label: "Total Accounts", value: String(accounts.total) },
      { label: "Loaded Accounts", value: String(accounts.items.length) },
      { label: "Active Accounts", value: String(activeCount) },
      { label: "Disabled Accounts", value: String(disabledCount) }
    ],
    roleSummary: buildRoleSummary(accounts.items)
  };
}

export function buildAccountTableMeta(account: AdminAccountItem): string[] {
  return [
    `created ${formatDateTime(account.createdAt)}`,
    `updated ${formatDateTime(account.updatedAt)}`,
    account.forceLogoutAt ? `force sign-out ${formatDateTime(account.forceLogoutAt)}` : "no pending sign-out"
  ];
}
