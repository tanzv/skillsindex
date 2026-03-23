import {
  buildAdminRoleSummary,
  normalizeAdminAccountsPayload,
  normalizeAdminAccountStatus,
  normalizeAdminAuthProvidersPayload,
  normalizeAdminRegistrationPayload,
  type AdminNormalizedAccountItem
} from "@/src/lib/admin/adminAccountSettingsModel";

export type AccessAccountItem = AdminNormalizedAccountItem;

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

export function resolveSelectedAccessAccount(
  accounts: AccessAccountItem[],
  selectedAccountId: number | null
): AccessAccountItem | null {
  if (selectedAccountId === null) {
    return null;
  }

  return accounts.find((account) => account.id === selectedAccountId) || null;
}

interface AccessMetricLabels {
  accounts: string;
  disabled: string;
  enabledProviders: string;
  pendingSignOut: string;
}

export function buildAdminAccessGovernanceData(payloads: {
  accounts: unknown;
  registration: unknown;
  authProviders: unknown;
}): AdminAccessGovernanceData {
  const accounts = normalizeAdminAccountsPayload(payloads.accounts);
  const registration = normalizeAdminRegistrationPayload(payloads.registration);
  const authProviders = normalizeAdminAuthProvidersPayload(payloads.authProviders);

  return {
    accounts: accounts.items,
    accountsTotal: accounts.total,
    allowRegistration: registration.allowRegistration,
    marketplacePublicAccess: registration.marketplacePublicAccess,
    enabledProviders: authProviders.authProviders,
    availableProviders: authProviders.availableAuthProviders
  };
}

export function buildAccessOverview(
  data: AdminAccessGovernanceData,
  labels: AccessMetricLabels = {
    accounts: "Accounts",
    disabled: "Disabled",
    enabledProviders: "Enabled Providers",
    pendingSignOut: "Pending Sign-out"
  }
): AccessOverview {
  const disabledAccounts = data.accounts.filter((item) => normalizeAdminAccountStatus(item.status) === "disabled").length;
  const forceLogoutPending = data.accounts.filter((item) => item.forceLogoutAt).length;

  return {
    metrics: [
      { label: labels.accounts, value: String(data.accountsTotal) },
      { label: labels.disabled, value: String(disabledAccounts) },
      { label: labels.enabledProviders, value: String(data.enabledProviders.length) },
      { label: labels.pendingSignOut, value: String(forceLogoutPending) }
    ],
    roleSummary: buildAdminRoleSummary(data.accounts)
  };
}
