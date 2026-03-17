import { asArray, asNumber, asObject, asString, formatDateTime } from "../adminGovernance/shared";

export interface AdminAPIKeyItem {
  id: number;
  userId: number;
  createdBy: number;
  ownerUsername: string;
  name: string;
  purpose: string;
  prefix: string;
  scopes: string[];
  status: string;
  revokedAt: string;
  expiresAt: string;
  lastRotatedAt: string;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAPIKeysPayload {
  total: number;
  items: AdminAPIKeyItem[];
}

export interface AdminAPIKeyOverview {
  metrics: Array<{ label: string; value: string }>;
  ownerSummary: Array<{ owner: string; count: number }>;
}

export function normalizeAdminAPIKeysPayload(payload: unknown): AdminAPIKeysPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      userId: asNumber(item.user_id),
      createdBy: asNumber(item.created_by),
      ownerUsername: asString(item.owner_username) || "unknown",
      name: asString(item.name) || "Unnamed key",
      purpose: asString(item.purpose),
      prefix: asString(item.prefix) || "n/a",
      scopes: asArray(item.scopes).map((scope) => asString(scope)).filter(Boolean),
      status: asString(item.status) || "unknown",
      revokedAt: asString(item.revoked_at),
      expiresAt: asString(item.expires_at),
      lastRotatedAt: asString(item.last_rotated_at),
      lastUsedAt: asString(item.last_used_at),
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at)
    }))
  };
}

export function buildAdminAPIKeyOverview(payload: AdminAPIKeysPayload): AdminAPIKeyOverview {
  const activeCount = payload.items.filter((item) => item.status.toLowerCase() === "active").length;
  const revokedCount = payload.items.filter((item) => item.status.toLowerCase() === "revoked").length;
  const expiredCount = payload.items.filter((item) => item.status.toLowerCase() === "expired").length;
  const ownerMap = payload.items.reduce<Map<string, number>>((accumulator, item) => {
    const owner = item.ownerUsername || "unknown";
    accumulator.set(owner, (accumulator.get(owner) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return {
    metrics: [
      { label: "Total Keys", value: String(payload.total) },
      { label: "Active Keys", value: String(activeCount) },
      { label: "Revoked Keys", value: String(revokedCount) },
      { label: "Expired Keys", value: String(expiredCount) }
    ],
    ownerSummary: Array.from(ownerMap.entries())
      .map(([owner, count]) => ({ owner, count }))
      .sort((left, right) => right.count - left.count || left.owner.localeCompare(right.owner))
  };
}

export function buildKeyMeta(key: AdminAPIKeyItem): string[] {
  return [
    `prefix ${key.prefix}`,
    `created ${formatDateTime(key.createdAt)}`,
    `updated ${formatDateTime(key.updatedAt)}`,
    `last used ${formatDateTime(key.lastUsedAt)}`
  ];
}
