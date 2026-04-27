import type {
  AdminSourceAnalysis,
  AdminSourceDependency,
  AdminSkillItem,
  AsyncJobItem,
  JobsPayload,
  RepositorySyncPolicy,
  SkillsPayload,
  SyncJobRunItem,
  SyncJobsPayload,
} from "./model.types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function asString(value: unknown): string {
  return String(value || "").trim();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(asString).filter(Boolean);
}

function normalizeSourceDependency(value: unknown): AdminSourceDependency {
  const record = asRecord(value);

  return {
    kind: asString(record.kind),
    target: asString(record.target),
  };
}

function normalizeSourceAnalysis(value: unknown): AdminSourceAnalysis {
  const record = asRecord(value);

  return {
    entryFile: asString(record.entry_file),
    mechanism: asString(record.mechanism),
    metadataSources: asStringArray(record.metadata_sources),
    referencePaths: asStringArray(record.reference_paths),
    dependencies: Array.isArray(record.dependencies)
      ? record.dependencies.map(normalizeSourceDependency)
      : [],
  };
}

function normalizeCollectionPayload<T>(
  payload: unknown,
  normalizeItem: (item: unknown) => T,
) {
  const record = asRecord(payload);
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeItem)
    : [];
  const limit = Math.max(asNumber(record.limit) || items.length || 20, 1);
  const page = Math.max(asNumber(record.page) || 1, 1);

  return {
    total: asNumber(record.total) || items.length,
    page,
    limit,
    items,
  };
}

function normalizeSkillItem(item: unknown): AdminSkillItem {
  const entry = asRecord(item);

  return {
    id: asNumber(entry.id),
    name: asString(entry.name),
    category: asString(entry.category),
    sourceType: asString(entry.source_type),
    visibility: asString(entry.visibility),
    ownerUsername: asString(entry.owner_username),
    starCount: asNumber(entry.star_count),
    qualityScore: asNumber(entry.quality_score),
    updatedAt: asString(entry.updated_at),
    sourceAnalysis: normalizeSourceAnalysis(entry.source_analysis),
  };
}

function normalizeJobItem(item: unknown): AsyncJobItem {
  const entry = asRecord(item);

  return {
    id: asNumber(entry.id),
    jobType: asString(entry.job_type),
    status: asString(entry.status),
    ownerUserId: asNumber(entry.owner_user_id),
    actorUserId: asNumber(entry.actor_user_id),
    targetSkillId: asNumber(entry.target_skill_id),
    errorMessage: asString(entry.error_message),
    attempt: asNumber(entry.attempt),
    maxAttempts: asNumber(entry.max_attempts),
    createdAt: asString(entry.created_at),
    updatedAt: asString(entry.updated_at),
  };
}

function normalizeSyncJobRunItem(item: unknown): SyncJobRunItem {
  const entry = asRecord(item);

  return {
    id: asNumber(entry.id),
    trigger: asString(entry.trigger),
    scope: asString(entry.scope),
    status: asString(entry.status),
    candidates: asNumber(entry.candidates),
    synced: asNumber(entry.synced),
    failed: asNumber(entry.failed),
    durationMs: asNumber(entry.duration_ms),
    startedAt: asString(entry.started_at),
    finishedAt: asString(entry.finished_at),
  };
}

export function normalizeSkillsPayload(payload: unknown): SkillsPayload {
  return normalizeCollectionPayload(payload, normalizeSkillItem);
}

export function normalizeJobsPayload(payload: unknown): JobsPayload {
  return normalizeCollectionPayload(payload, normalizeJobItem);
}

export function normalizeSyncJobsPayload(payload: unknown): SyncJobsPayload {
  return normalizeCollectionPayload(payload, normalizeSyncJobRunItem);
}

export function normalizeSyncPolicyPayload(
  payload: unknown,
): RepositorySyncPolicy {
  const record = asRecord(payload);

  return {
    enabled: Boolean(record.enabled),
    interval: asString(record.interval) || "30m",
    timeout: asString(record.timeout) || "10m",
    batchSize: asNumber(record.batch_size) || 20,
  };
}
