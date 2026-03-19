import type { PublicLocale } from "@/src/lib/i18n/publicLocale";

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

interface AccountsMetricLabels {
  totalAccounts: string;
  loadedAccounts: string;
  activeAccounts: string;
  disabledAccounts: string;
}

interface AccountTableMetaLabels {
  notAvailable: string;
  createdPrefix: string;
  updatedPrefix: string;
  forceSignOutPrefix: string;
  noPendingSignOut: string;
}

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

export function resolveRoleTargetUserId(roleEditorUserId: string, selectedAccountId: number | null): number | null {
  const explicitUserId = asString(roleEditorUserId).trim();
  if (explicitUserId) {
    const parsedUserId = Number(explicitUserId);
    return Number.isFinite(parsedUserId) && parsedUserId > 0 ? parsedUserId : null;
  }

  return Number.isFinite(selectedAccountId) && selectedAccountId !== null && selectedAccountId > 0 ? selectedAccountId : null;
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

export function buildAccountsOverview(
  accounts: AdminAccountsPayload,
  labels: AccountsMetricLabels = {
    totalAccounts: "Total Accounts",
    loadedAccounts: "Loaded Accounts",
    activeAccounts: "Active Accounts",
    disabledAccounts: "Disabled Accounts"
  }
): AccountsOverview {
  const disabledCount = accounts.items.filter((account) => normalizeAccountStatus(account.status) === "disabled").length;
  const activeCount = accounts.items.filter((account) => normalizeAccountStatus(account.status) === "active").length;
  return {
    metrics: [
      { label: labels.totalAccounts, value: String(accounts.total) },
      { label: labels.loadedAccounts, value: String(accounts.items.length) },
      { label: labels.activeAccounts, value: String(activeCount) },
      { label: labels.disabledAccounts, value: String(disabledCount) }
    ],
    roleSummary: buildRoleSummary(accounts.items)
  };
}

export function buildAccountTableMeta(
  account: AdminAccountItem,
  locale: PublicLocale = "en",
  labels: AccountTableMetaLabels = {
    notAvailable: "n/a",
    createdPrefix: "created",
    updatedPrefix: "updated",
    forceSignOutPrefix: "force sign-out",
    noPendingSignOut: "no pending sign-out"
  }
): string[] {
  return [
    `${labels.createdPrefix} ${formatDateTime(account.createdAt, locale, labels.notAvailable)}`,
    `${labels.updatedPrefix} ${formatDateTime(account.updatedAt, locale, labels.notAvailable)}`,
    account.forceLogoutAt
      ? `${labels.forceSignOutPrefix} ${formatDateTime(account.forceLogoutAt, locale, labels.notAvailable)}`
      : labels.noPendingSignOut
  ];
}
