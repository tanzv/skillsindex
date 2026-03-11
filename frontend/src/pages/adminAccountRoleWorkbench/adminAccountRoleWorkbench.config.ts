import { fetchConsoleJSON } from "../../lib/api";
import type { AdminAccountRoleWorkbenchMode } from "./AdminAccountRoleWorkbenchPage.types";
import type { AccountStatusFilter } from "./AdminAccountRoleWorkbenchPage.helpers";

interface RegistrationPayload {
  allow_registration?: boolean;
  marketplace_public_access?: boolean;
}

interface AuthProvidersPayload {
  auth_providers?: string[];
  available_auth_providers?: string[];
}

export interface AdminAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AdminAccountsPayload {
  items?: AdminAccountItem[];
  total?: number;
}

export interface AccountRoleWorkbenchData {
  accounts: AdminAccountsPayload;
  registration: RegistrationPayload;
  authProviders: AuthProvidersPayload | null;
}

interface AuthProviderDraft {
  enabled: string[];
  available: string[];
}

export const modeTitle: Record<AdminAccountRoleWorkbenchMode, string> = {
  account_management_list: "Account Management List",
  account_configuration_form: "Account Configuration Form",
  role_management_list: "Role Management List",
  role_configuration_form: "Role Configuration Form"
};

export const accountStatusFilters: Array<{ value: AccountStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" }
];

const fallbackAuthProviderOptions = ["password", "github", "google", "wecom", "dingtalk", "microsoft", "oidc"];

export function dedupeStringList(values: string[]): string[] {
  const seen = new Set<string>();
  const normalizedValues: string[] = [];
  values.forEach((value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    normalizedValues.push(normalized);
  });
  return normalizedValues;
}

export function resolveAuthProviderDraft(payload: AuthProvidersPayload | null): AuthProviderDraft {
  const enabledProviders = dedupeStringList(payload?.auth_providers || []);
  const availableProviders = dedupeStringList(payload?.available_auth_providers || []);
  const available =
    availableProviders.length > 0 ? availableProviders : dedupeStringList([...enabledProviders, ...fallbackAuthProviderOptions]);
  const enabled = enabledProviders.filter((provider) => available.includes(provider));
  return { enabled, available };
}

export function isRoleMode(mode: AdminAccountRoleWorkbenchMode): boolean {
  return mode === "role_management_list" || mode === "role_configuration_form";
}

export async function fetchAccountRoleWorkbenchData(mode: AdminAccountRoleWorkbenchMode): Promise<AccountRoleWorkbenchData> {
  const includeAuthProviders = mode === "account_configuration_form";
  const [accounts, registration, authProviders] = await Promise.all([
    fetchConsoleJSON<AdminAccountsPayload>("/api/v1/admin/accounts"),
    fetchConsoleJSON<RegistrationPayload>("/api/v1/admin/settings/registration"),
    includeAuthProviders
      ? fetchConsoleJSON<AuthProvidersPayload>("/api/v1/admin/settings/auth-providers")
      : Promise.resolve(null)
  ]);

  return { accounts, registration, authProviders };
}

export const defaultRoleOptions = ["super_admin", "admin", "auditor", "member", "viewer"];
