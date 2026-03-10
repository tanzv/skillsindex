import type { AppLocale } from "../../lib/i18n";
import type { SyncPolicyRecord, SyncRunDetailSummary, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import type { WorkspaceSidebarGroup } from "../workspace/WorkspaceCenterPage.navigation";

export type RecordsSyncViewKind = "repository" | "records";

function pick(value: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in value) {
      return value[key];
    }
  }
  return undefined;
}

function pickString(value: Record<string, unknown>, keys: string[], fallback = ""): string {
  const raw = pick(value, keys);
  const text = String(raw || "").trim();
  return text || fallback;
}

function pickNumber(value: Record<string, unknown>, keys: string[], fallback = 0): number {
  const raw = pick(value, keys);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePrototypeAdminPath(pathname: string): string {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/mobile/light" || normalizedPath.startsWith("/mobile/light/")) {
    return normalizedPath.slice("/mobile/light".length) || "/";
  }
  if (normalizedPath === "/mobile" || normalizedPath.startsWith("/mobile/")) {
    return normalizedPath.slice("/mobile".length) || "/";
  }
  if (normalizedPath === "/light" || normalizedPath.startsWith("/light/")) {
    return normalizedPath.slice("/light".length) || "/";
  }
  return normalizedPath;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function parseDate(value: string, locale: AppLocale, fallback: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return fallback;
  }
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}

export function statusColor(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (["failed", "error"].includes(normalized)) {
    return "red";
  }
  if (["partial", "warning"].includes(normalized)) {
    return "orange";
  }
  if (["running", "processing", "in_progress"].includes(normalized)) {
    return "blue";
  }
  if (["queued", "pending", "waiting"].includes(normalized)) {
    return "gold";
  }
  if (["canceled", "cancelled"].includes(normalized)) {
    return "default";
  }
  return "green";
}

export function parseSyncRun(raw: unknown): SyncRunRecord {
  const item = asRecord(raw);
  const owner = asRecord(pick(item, ["owner_user", "OwnerUser"]));
  const actor = asRecord(pick(item, ["actor_user", "ActorUser"]));
  const ownerUsername =
    pickString(owner, ["username", "Username"]) ||
    pickString(item, ["owner_username", "OwnerUsername"]) ||
    String(pick(item, ["owner_user_id", "OwnerUserID"]) || "-");
  const actorUsername =
    pickString(actor, ["username", "Username"]) ||
    pickString(item, ["actor_username", "ActorUsername"]) ||
    String(pick(item, ["actor_user_id", "ActorUserID"]) || "-");

  return {
    id: pickNumber(item, ["id", "ID"]),
    trigger: pickString(item, ["trigger", "Trigger"]),
    scope: pickString(item, ["scope", "Scope"]),
    status: pickString(item, ["status", "Status"]),
    candidates: pickNumber(item, ["candidates", "Candidates"]),
    synced: pickNumber(item, ["synced", "Synced"]),
    failed: pickNumber(item, ["failed", "Failed"]),
    duration_ms: pickNumber(item, ["duration_ms", "DurationMs"]),
    started_at: pickString(item, ["started_at", "StartedAt"]),
    finished_at: pickString(item, ["finished_at", "FinishedAt"]),
    error_summary: pickString(item, ["error_summary", "ErrorSummary"]),
    owner_username: ownerUsername,
    actor_username: actorUsername
  };
}

export function resolveSyncPolicyPayload(payload: unknown): unknown {
  const record = asRecord(payload);
  if ("enabled" in record || "interval" in record || "timeout" in record || "batch_size" in record) {
    return record;
  }
  if ("item" in record) {
    return record.item;
  }
  return payload;
}

export function parseSyncPolicy(payload: unknown): SyncPolicyRecord {
  const item = asRecord(resolveSyncPolicyPayload(payload));
  return {
    enabled: Boolean(item.enabled),
    interval: String(item.interval || "30m"),
    timeout: String(item.timeout || "10m"),
    batch_size: Number(item.batch_size || 20)
  };
}

export function buildSyncRunsQuery(input: { ownerFilter: string; limit: string }): string {
  const query = new URLSearchParams();
  const normalizedOwner = String(input.ownerFilter || "").trim();
  if (normalizedOwner) {
    query.set("owner_id", normalizedOwner);
  }

  const parsedLimit = Number(input.limit);
  const normalizedLimit = Math.max(1, Math.min(200, Number.isFinite(parsedLimit) ? parsedLimit : 80));
  query.set("limit", String(Math.round(normalizedLimit)));
  return query.toString();
}

export function buildSyncRunDetailSummary(
  detailPayload: Record<string, unknown> | null,
  locale: AppLocale,
  fallback: string
): SyncRunDetailSummary {
  const detail = asRecord(detailPayload || {});
  return {
    status: String(detail.status || detail.Status || fallback),
    durationMs: String(detail.duration_ms || detail.DurationMs || fallback),
    started: parseDate(String(detail.started_at || detail.StartedAt || ""), locale, fallback),
    finished: parseDate(String(detail.finished_at || detail.FinishedAt || ""), locale, fallback)
  };
}

export function resolveAdminBase(pathname: string): string {
  if (pathname.startsWith("/mobile/light/admin")) {
    return "/mobile/light/admin";
  }
  if (pathname.startsWith("/mobile/admin")) {
    return "/mobile/admin";
  }
  if (pathname.startsWith("/light/admin")) {
    return "/light/admin";
  }
  return "/admin";
}

export function resolveRecordsSyncViewKind(pathname: string): RecordsSyncViewKind {
  const normalizedPath = normalizePrototypeAdminPath(pathname);
  return normalizedPath.startsWith("/admin/ingestion") ? "repository" : "records";
}

export function resolveRecordsSyncActiveMenuID(pathname: string): string {
  if (resolveRecordsSyncViewKind(pathname) === "repository") {
    return "skill-code-repository";
  }

  return "skill-sync-records";
}

export function resolveRecordsSyncSidebarGroups(groups: WorkspaceSidebarGroup[]): WorkspaceSidebarGroup[] {
  const skillManagementGroup = groups.find((group) => group.id === "skill-management");
  return skillManagementGroup ? [skillManagementGroup] : groups;
}
