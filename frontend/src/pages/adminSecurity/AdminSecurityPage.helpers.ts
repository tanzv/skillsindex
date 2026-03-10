import type {
  AccessViewData,
  AdminSecurityRoute,
  ApiKeysViewData,
  MetricItem,
  ModerationViewData,
  RouteCopy,
  SecurityViewData
} from "./AdminSecurityPage.types";

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

function normalizeApiKeysPayload(raw: unknown): ApiKeysViewData {
  const payload = asObject(raw);
  const items = asArray<Record<string, unknown>>(readField(payload, ["items", "Items"])).map((item) => ({
    id: asNumber(readField(item, ["id", "ID"])),
    ownerUsername:
      asString(readField(item, ["owner_username", "ownerUsername", "OwnerUsername"])) ||
      asString(readField(item, ["username", "Username"])) ||
      "unknown",
    name: asString(readField(item, ["name", "Name"])) || "Unnamed key",
    status: asString(readField(item, ["status", "Status"])) || "unknown",
    scopes: toStringArray(readField(item, ["scopes", "Scopes"])),
    expiresAt: asString(readField(item, ["expires_at", "expiresAt", "ExpiresAt"])),
    lastUsedAt: asString(readField(item, ["last_used_at", "lastUsedAt", "LastUsedAt"])),
    updatedAt: asString(readField(item, ["updated_at", "updatedAt", "UpdatedAt"]))
  }));

  return {
    items,
    total: asNumber(readField(payload, ["total", "Total"]), items.length)
  };
}

function normalizeAccessPayload(accountsRaw: unknown, registrationRaw: unknown, authProvidersRaw: unknown): AccessViewData {
  const accountsPayload = asObject(accountsRaw);
  const registrationPayload = asObject(registrationRaw);
  const providersPayload = asObject(authProvidersRaw);

  const accounts = asArray<Record<string, unknown>>(readField(accountsPayload, ["items", "Items"])).map((item) => ({
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
    accountsTotal: asNumber(readField(accountsPayload, ["total", "Total"]), accounts.length),
    allowRegistration: asBoolean(
      readField(registrationPayload, ["allow_registration", "allowRegistration", "AllowRegistration"]),
      false
    ),
    enabledProviders: toStringArray(readField(providersPayload, ["auth_providers", "authProviders", "AuthProviders"])),
    availableProviders: toStringArray(
      readField(providersPayload, ["available_auth_providers", "availableAuthProviders", "AvailableAuthProviders"])
    )
  };
}

function normalizeModerationPayload(raw: unknown): ModerationViewData {
  const payload = asObject(raw);
  const items = asArray<Record<string, unknown>>(readField(payload, ["items", "Items"])).map((item) => ({
    id: asNumber(readField(item, ["id", "ID"])),
    targetType: asString(readField(item, ["target_type", "targetType", "TargetType"])) || "unknown",
    reasonCode: asString(readField(item, ["reason_code", "reasonCode", "ReasonCode"])) || "unknown",
    reasonDetail: asString(readField(item, ["reason_detail", "reasonDetail", "ReasonDetail"])),
    status: asString(readField(item, ["status", "Status"])) || "unknown",
    action: asString(readField(item, ["action", "Action"])) || "none",
    createdAt: asString(readField(item, ["created_at", "createdAt", "CreatedAt"])),
    resolvedAt: asString(readField(item, ["resolved_at", "resolvedAt", "ResolvedAt"]))
  }));

  return {
    items,
    total: asNumber(readField(payload, ["total", "Total"]), items.length)
  };
}

export async function fetchSecurityViewData(route: AdminSecurityRoute, fetchJSON: ConsoleJSONFetcher): Promise<SecurityViewData> {
  if (route === "/admin/apikeys") {
    const payload = await fetchJSON("/api/v1/admin/apikeys");
    return normalizeApiKeysPayload(payload);
  }

  if (route === "/admin/access") {
    const [accountsPayload, registrationPayload, authProvidersPayload] = await Promise.all([
      fetchJSON("/api/v1/admin/accounts"),
      fetchJSON("/api/v1/admin/settings/registration"),
      fetchJSON("/api/v1/admin/settings/auth-providers")
    ]);
    return normalizeAccessPayload(accountsPayload, registrationPayload, authProvidersPayload);
  }

  const payload = await fetchJSON("/api/v1/admin/moderation");
  return normalizeModerationPayload(payload);
}

export function formatDateTime(value: string): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
}

export function statusColorStyle(status: string): { color: string; background: string } {
  const normalized = status.trim().toLowerCase();

  if (["active", "enabled", "open", "resolved"].includes(normalized)) {
    return {
      color: "var(--si-color-success-text)",
      background: "color-mix(in srgb, var(--si-color-success-bg) 82%, transparent)"
    };
  }

  if (["warning", "pending", "expired"].includes(normalized)) {
    return {
      color: "var(--si-color-warning-text)",
      background: "color-mix(in srgb, var(--si-color-warning-bg) 78%, transparent)"
    };
  }

  return {
    color: "var(--si-color-danger-text)",
    background: "color-mix(in srgb, var(--si-color-danger-bg) 78%, transparent)"
  };
}

export function isEmptyData(route: AdminSecurityRoute, data: SecurityViewData | null): boolean {
  if (!data) {
    return true;
  }

  if (route === "/admin/apikeys") {
    return (data as ApiKeysViewData).items.length === 0;
  }

  if (route === "/admin/access") {
    return (data as AccessViewData).accounts.length === 0;
  }

  return (data as ModerationViewData).items.length === 0;
}

export function buildRouteCopy(route: AdminSecurityRoute): RouteCopy {
  if (route === "/admin/apikeys") {
    return {
      title: "API Key Management",
      subtitle: "Track key lifecycle, ownership, and token safety posture."
    };
  }

  if (route === "/admin/access") {
    return {
      title: "Access Governance",
      subtitle: "Monitor account status, registration policy, and auth providers."
    };
  }

  return {
    title: "Moderation Workspace",
    subtitle: "Review case queue health, status mix, and response throughput."
  };
}

export function computeMetrics(route: AdminSecurityRoute, data: SecurityViewData | null): MetricItem[] {
  if (!data) {
    return [];
  }

  if (route === "/admin/apikeys") {
    const payload = data as ApiKeysViewData;
    const activeCount = payload.items.filter((item) => item.status.toLowerCase() === "active").length;
    const revokedOrExpired = payload.items.filter((item) => ["revoked", "expired"].includes(item.status.toLowerCase())).length;
    return [
      { label: "Total Keys", value: payload.total },
      { label: "Active", value: activeCount },
      { label: "Revoked or Expired", value: revokedOrExpired }
    ];
  }

  if (route === "/admin/access") {
    const payload = data as AccessViewData;
    const disabledAccounts = payload.accounts.filter((item) => item.status.toLowerCase() === "disabled").length;
    return [
      { label: "Accounts", value: payload.accountsTotal },
      { label: "Disabled", value: disabledAccounts },
      { label: "Enabled Auth Providers", value: payload.enabledProviders.length }
    ];
  }

  const payload = data as ModerationViewData;
  const openCases = payload.items.filter((item) => item.status.toLowerCase() === "open").length;
  const resolvedCases = payload.items.filter((item) => item.status.toLowerCase() === "resolved").length;
  return [
    { label: "Cases", value: payload.total },
    { label: "Open", value: openCases },
    { label: "Resolved", value: resolvedCases }
  ];
}
