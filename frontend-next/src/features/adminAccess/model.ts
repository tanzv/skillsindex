import { asArray, asBoolean, asNumber, asObject, asString } from "../adminGovernance/shared";

export interface AccessAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  forceLogoutAt: string;
}

export interface AdminAccessGovernanceData {
  accounts: AccessAccountItem[];
  accountsTotal: number;
  allowRegistration: boolean;
  marketplacePublicAccess: boolean;
  enabledProviders: string[];
  availableProviders: string[];
}

export interface AccessOverview {
  metrics: Array<{ label: string; value: string }>;
  roleSummary: Array<{ role: string; count: number }>;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }

  const raw = asString(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildAdminAccessGovernanceData(payloads: {
  accounts: unknown;
  registration: unknown;
  authProviders: unknown;
}): AdminAccessGovernanceData {
  const accountsSource = asObject(payloads.accounts);
  const registrationSource = asObject(payloads.registration);
  const providersSource = asObject(payloads.authProviders);
  const accountItems = asArray<Record<string, unknown>>(accountsSource.items);

  return {
    accounts: accountItems.map((item) => ({
      id: asNumber(item.id),
      username: asString(item.username) || "unknown",
      role: asString(item.role) || "member",
      status: asString(item.status) || "unknown",
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at),
      forceLogoutAt: asString(item.force_logout_at)
    })),
    accountsTotal: asNumber(accountsSource.total) || accountItems.length,
    allowRegistration: asBoolean(registrationSource.allow_registration),
    marketplacePublicAccess: asBoolean(registrationSource.marketplace_public_access),
    enabledProviders: toStringArray(providersSource.auth_providers),
    availableProviders: toStringArray(providersSource.available_auth_providers)
  };
}

export function buildAccessOverview(data: AdminAccessGovernanceData): AccessOverview {
  const disabledAccounts = data.accounts.filter((item) => item.status.toLowerCase() === "disabled").length;
  const forceLogoutPending = data.accounts.filter((item) => item.forceLogoutAt).length;
  const roleMap = data.accounts.reduce<Map<string, number>>((accumulator, item) => {
    const role = item.role || "member";
    accumulator.set(role, (accumulator.get(role) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return {
    metrics: [
      { label: "Accounts", value: String(data.accountsTotal) },
      { label: "Disabled", value: String(disabledAccounts) },
      { label: "Enabled Providers", value: String(data.enabledProviders.length) },
      { label: "Pending Sign-out", value: String(forceLogoutPending) }
    ],
    roleSummary: Array.from(roleMap.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role))
  };
}
