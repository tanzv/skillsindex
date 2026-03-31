import type { AdminAccountManagementRoute } from "@/src/lib/routing/adminRouteRegistry";
import {
  buildAdminRoleSummary,
  normalizeAdminAccountsPayload,
  normalizeAdminAccountStatus,
  normalizeAdminAuthProvidersPayload,
  normalizeAdminRegistrationPayload,
  normalizeAdminRoleName,
  type AdminNormalizedAccountItem,
  type AdminNormalizedAccountsPayload,
  type AdminNormalizedAuthProvidersPayload,
  type AdminNormalizedRegistrationPayload
} from "@/src/lib/admin/adminAccountSettingsModel";
import {
  adminAccountsNewRoute,
  adminAccountsRoute,
  adminRolesNewRoute,
  adminRolesRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";

import { asString, formatDateTime } from "../adminGovernance/shared";

export type AdminAccountsRoute = AdminAccountManagementRoute;
export type AdminAccountsDisplayRoute = typeof adminAccountsRoute | typeof adminRolesRoute;
export type AdminAccountsCreateOverlayEntity = "provisioningPolicy" | "rolePlaybook";
export type AccountStatusFilter = "all" | "active" | "disabled";

export type AdminAccountItem = AdminNormalizedAccountItem;
export type AdminAccountsPayload = AdminNormalizedAccountsPayload;
export type RegistrationPayload = AdminNormalizedRegistrationPayload;
export type AuthProvidersPayload = AdminNormalizedAuthProvidersPayload;

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
  return normalizeAdminAccountsPayload(payload);
}

export function normalizeRegistrationPayload(payload: unknown): RegistrationPayload {
  return normalizeAdminRegistrationPayload(payload);
}

export function normalizeAuthProvidersPayload(payload: unknown): AuthProvidersPayload {
  return normalizeAdminAuthProvidersPayload(payload);
}

export function normalizeAccountStatus(value: string): string {
  return normalizeAdminAccountStatus(value);
}

export function normalizeRoleName(value: string): string {
  return normalizeAdminRoleName(value);
}

export function resolveAdminAccountsDisplayRoute(route: AdminAccountsRoute): AdminAccountsDisplayRoute {
  if (route === adminAccountsNewRoute) {
    return adminAccountsRoute;
  }

  if (route === adminRolesNewRoute) {
    return adminRolesRoute;
  }

  return route;
}

export function resolveAdminAccountsCreateOverlayEntity(route: AdminAccountsRoute): AdminAccountsCreateOverlayEntity | null {
  if (route === adminAccountsNewRoute) {
    return "provisioningPolicy";
  }

  if (route === adminRolesNewRoute) {
    return "rolePlaybook";
  }

  return null;
}

export function normalizeAssignableRoleName(value: string): string {
  const role = normalizeRoleName(value);
  if (role === "super_admin" || role === "admin" || role === "member" || role === "viewer") {
    return role;
  }
  return "member";
}

export function resolveRoleTargetUserId(roleEditorUserId: string, selectedAccountId: number | null): number | null {
  const explicitUserId = asString(roleEditorUserId).trim();
  if (explicitUserId) {
    const parsedUserId = Number(explicitUserId);
    return Number.isFinite(parsedUserId) && parsedUserId > 0 ? parsedUserId : null;
  }

  return Number.isFinite(selectedAccountId) && selectedAccountId !== null && selectedAccountId > 0 ? selectedAccountId : null;
}

export function resolveSelectedAdminAccount<TAccount extends AdminAccountItem>(
  allAccounts: TAccount[],
  visibleAccounts: TAccount[],
  selectedAccountId: number | null
): TAccount | null {
  if (!visibleAccounts.length || !allAccounts.length) {
    return null;
  }

  if (selectedAccountId === null) {
    return visibleAccounts[0] || null;
  }

  return visibleAccounts.find((account) => account.id === selectedAccountId) || null;
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
  return buildAdminRoleSummary(accounts);
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
