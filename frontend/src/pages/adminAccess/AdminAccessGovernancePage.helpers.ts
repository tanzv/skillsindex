import type { AdminAccessGovernanceData, MetricItem } from "./AdminAccessGovernancePage.types";

export type ConsoleJSONFetcher = (path: string) => Promise<unknown>;

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function readField(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }
  return undefined;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter((item) => item.trim() !== "");
  }

  const raw = asString(value).trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function fetchAdminAccessGovernanceData(fetchJSON: ConsoleJSONFetcher): Promise<AdminAccessGovernanceData> {
  const [accountsPayload, registrationPayload, authProvidersPayload] = await Promise.all([
    fetchJSON("/api/v1/admin/accounts"),
    fetchJSON("/api/v1/admin/settings/registration"),
    fetchJSON("/api/v1/admin/settings/auth-providers")
  ]);

  const accountsSource = asObject(accountsPayload);
  const registrationSource = asObject(registrationPayload);
  const providersSource = asObject(authProvidersPayload);
  const accounts = asArray<Record<string, unknown>>(readField(accountsSource, ["items", "Items"])).map((item) => ({
    id: asNumber(readField(item, ["id", "ID"])),
    username: asString(readField(item, ["username", "Username"])) || "unknown",
    role: asString(readField(item, ["role", "Role"])) || "member",
    status: asString(readField(item, ["status", "Status"])) || "unknown",
    createdAt: asString(readField(item, ["created_at", "createdAt", "CreatedAt"])),
    updatedAt: asString(readField(item, ["updated_at", "updatedAt", "UpdatedAt"])),
    forceLogoutAt: asString(readField(item, ["force_logout_at", "forceLogoutAt", "ForceLogoutAt"]))
  }));

  return {
    accounts,
    accountsTotal: asNumber(readField(accountsSource, ["total", "Total"]), accounts.length),
    allowRegistration: asBoolean(
      readField(registrationSource, ["allow_registration", "allowRegistration", "AllowRegistration"]),
      false
    ),
    enabledProviders: toStringArray(readField(providersSource, ["auth_providers", "authProviders", "AuthProviders"])),
    availableProviders: toStringArray(
      readField(providersSource, ["available_auth_providers", "availableAuthProviders", "AvailableAuthProviders"])
    )
  };
}

export function isAdminAccessGovernanceEmpty(data: AdminAccessGovernanceData | null): boolean {
  if (!data) {
    return true;
  }
  return data.accounts.length === 0;
}

export function buildAdminAccessGovernanceMetrics(data: AdminAccessGovernanceData | null): MetricItem[] {
  if (!data) {
    return [];
  }

  const disabledAccounts = data.accounts.filter((item) => item.status.toLowerCase() === "disabled").length;
  return [
    { label: "Accounts", value: data.accountsTotal },
    { label: "Disabled", value: disabledAccounts },
    { label: "Enabled Auth Providers", value: data.enabledProviders.length }
  ];
}

export const adminAccessGovernanceCopy = {
  title: "Access Governance",
  subtitle: "Monitor account status, registration policy, and auth providers."
} as const;
