export type AdminCatalogRoute = "/admin/skills" | "/admin/jobs" | "/admin/sync-jobs" | "/admin/sync-policy/repository";

export interface AdminSkillItem {
  id: number;
  name: string;
  category: string;
  sourceType: string;
  visibility: string;
  ownerUsername: string;
  starCount: number;
  qualityScore: number;
  updatedAt: string;
}

export interface AsyncJobItem {
  id: number;
  jobType: string;
  status: string;
  ownerUserId: number;
  actorUserId: number;
  targetSkillId: number;
  errorMessage: string;
  attempt: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncJobRunItem {
  id: number;
  trigger: string;
  scope: string;
  status: string;
  candidates: number;
  synced: number;
  failed: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
}

export interface RepositorySyncPolicy {
  enabled: boolean;
  interval: string;
  timeout: string;
  batchSize: number;
}

export interface AdminCatalogMetric {
  label: string;
  value: string;
}

export interface AdminCatalogSidePanel {
  title: string;
  items: Array<{ label: string; value: string }>;
}

export interface AdminCatalogRow {
  id: number;
  name: string;
  summary: string;
  meta: string[];
  status: string;
  detail?: string;
  syncable?: boolean;
}

export interface AdminCatalogViewModel {
  metrics: AdminCatalogMetric[];
  sidePanel: AdminCatalogSidePanel[];
  table: {
    title: string;
    rows: AdminCatalogRow[];
  } | null;
  editor: RepositorySyncPolicy | null;
}

export interface SkillsPayload {
  total: number;
  items: AdminSkillItem[];
}

export interface JobsPayload {
  total: number;
  items: AsyncJobItem[];
}

export interface SyncJobsPayload {
  total: number;
  items: SyncJobRunItem[];
}

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return "n/a";
  }
  return new Date(parsed).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "n/a";
  }
  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }
  return `${(durationMs / 1000).toFixed(1)} s`;
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function asString(value: unknown): string {
  return String(value || "").trim();
}

export function normalizeSkillsPayload(payload: unknown): SkillsPayload {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? record.items : [];

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => {
      const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        id: asNumber(entry.id),
        name: asString(entry.name) || "Unnamed skill",
        category: asString(entry.category) || "general",
        sourceType: asString(entry.source_type) || "manual",
        visibility: asString(entry.visibility) || "private",
        ownerUsername: asString(entry.owner_username) || "n/a",
        starCount: asNumber(entry.star_count),
        qualityScore: asNumber(entry.quality_score),
        updatedAt: asString(entry.updated_at)
      };
    })
  };
}

export function normalizeJobsPayload(payload: unknown): JobsPayload {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? record.items : [];

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => {
      const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        id: asNumber(entry.id),
        jobType: asString(entry.job_type) || "unknown",
        status: asString(entry.status) || "unknown",
        ownerUserId: asNumber(entry.owner_user_id),
        actorUserId: asNumber(entry.actor_user_id),
        targetSkillId: asNumber(entry.target_skill_id),
        errorMessage: asString(entry.error_message),
        attempt: asNumber(entry.attempt),
        maxAttempts: asNumber(entry.max_attempts),
        createdAt: asString(entry.created_at),
        updatedAt: asString(entry.updated_at)
      };
    })
  };
}

export function normalizeSyncJobsPayload(payload: unknown): SyncJobsPayload {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? record.items : [];

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => {
      const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        id: asNumber(entry.id),
        trigger: asString(entry.trigger) || "manual",
        scope: asString(entry.scope) || "repository",
        status: asString(entry.status) || "unknown",
        candidates: asNumber(entry.candidates),
        synced: asNumber(entry.synced),
        failed: asNumber(entry.failed),
        durationMs: asNumber(entry.duration_ms),
        startedAt: asString(entry.started_at),
        finishedAt: asString(entry.finished_at)
      };
    })
  };
}

export function normalizeSyncPolicyPayload(payload: unknown): RepositorySyncPolicy {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  return {
    enabled: Boolean(record.enabled),
    interval: asString(record.interval) || "30m",
    timeout: asString(record.timeout) || "10m",
    batchSize: asNumber(record.batch_size) || 20
  };
}

function buildSkillsViewModel(payload: SkillsPayload): AdminCatalogViewModel {
  const publicCount = payload.items.filter((item) => item.visibility.toLowerCase() === "public").length;
  const repositoryCount = payload.items.filter((item) => item.sourceType.toLowerCase() === "repository").length;
  const averageQuality =
    payload.items.length > 0 ? (payload.items.reduce((sum, item) => sum + item.qualityScore, 0) / payload.items.length).toFixed(1) : "0.0";

  return {
    metrics: [
      { label: "Total Skills", value: String(payload.total) },
      { label: "Listed Rows", value: String(payload.items.length) },
      { label: "Public Skills", value: String(publicCount) },
      { label: "Average Quality", value: averageQuality }
    ],
    sidePanel: [
      {
        title: "Catalog Signals",
        items: [
          { label: "Repository-backed", value: String(repositoryCount) },
          { label: "Manual or other", value: String(payload.items.length - repositoryCount) }
        ]
      }
    ],
    table: {
      title: "Skill Inventory",
      rows: payload.items.map((item) => ({
        id: item.id,
        name: item.name,
        summary: `${item.category} · ${item.sourceType} · ${item.ownerUsername}`,
        meta: [`${item.starCount} stars`, `${item.qualityScore.toFixed(1)} quality`, formatDateTime(item.updatedAt)],
        status: item.visibility,
        syncable: item.sourceType.toLowerCase() === "repository"
      }))
    },
    editor: null
  };
}

function buildJobsViewModel(payload: JobsPayload): AdminCatalogViewModel {
  const runningCount = payload.items.filter((item) => item.status.toLowerCase() === "running").length;
  const failedCount = payload.items.filter((item) => item.status.toLowerCase() === "failed").length;
  const retryPressure = payload.items.filter((item) => item.attempt > 1).length;

  return {
    metrics: [
      { label: "Queued Jobs", value: String(payload.total) },
      { label: "Running Jobs", value: String(runningCount) },
      { label: "Failed Jobs", value: String(failedCount) },
      { label: "Retry Pressure", value: String(retryPressure) }
    ],
    sidePanel: [
      {
        title: "Execution Signals",
        items: [
          { label: "Latest running", value: payload.items.find((item) => item.status.toLowerCase() === "running")?.jobType || "n/a" },
          { label: "Max retry span", value: String(Math.max(...payload.items.map((item) => item.maxAttempts || 0), 0)) }
        ]
      }
    ],
    table: {
      title: "Async Job Queue",
      rows: payload.items.map((item) => ({
        id: item.id,
        name: `${item.jobType} #${item.id}`,
        summary: `Skill ${item.targetSkillId || "n/a"} · owner ${item.ownerUserId || "n/a"} · actor ${item.actorUserId || "n/a"}`,
        meta: [`Attempt ${item.attempt}/${item.maxAttempts}`, formatDateTime(item.updatedAt)],
        status: item.status,
        detail: item.errorMessage || undefined
      }))
    },
    editor: null
  };
}

function buildSyncJobsViewModel(payload: SyncJobsPayload): AdminCatalogViewModel {
  const failedItems = payload.items.reduce((sum, item) => sum + item.failed, 0);
  const syncedItems = payload.items.reduce((sum, item) => sum + item.synced, 0);

  return {
    metrics: [
      { label: "Sync Runs", value: String(payload.total) },
      { label: "Synced Items", value: String(syncedItems) },
      { label: "Failed Items", value: String(failedItems) },
      { label: "Latest Duration", value: payload.items[0] ? formatDuration(payload.items[0].durationMs) : "n/a" }
    ],
    sidePanel: [
      {
        title: "Run Distribution",
        items: [
          { label: "Scheduled runs", value: String(payload.items.filter((item) => item.trigger === "schedule").length) },
          { label: "Manual runs", value: String(payload.items.filter((item) => item.trigger !== "schedule").length) }
        ]
      }
    ],
    table: {
      title: "Repository Sync Runs",
      rows: payload.items.map((item) => ({
        id: item.id,
        name: `${item.trigger} · ${item.scope}`,
        summary: `${item.synced} synced / ${item.failed} failed / ${item.candidates} candidates`,
        meta: [formatDuration(item.durationMs), formatDateTime(item.finishedAt || item.startedAt)],
        status: item.status
      }))
    },
    editor: null
  };
}

function buildSyncPolicyViewModel(payload: RepositorySyncPolicy): AdminCatalogViewModel {
  return {
    metrics: [
      { label: "Scheduler Enabled", value: payload.enabled ? "Yes" : "No" },
      { label: "Interval", value: payload.interval },
      { label: "Timeout", value: payload.timeout },
      { label: "Batch Size", value: String(payload.batchSize) }
    ],
    sidePanel: [
      {
        title: "Policy Notes",
        items: [
          { label: "Execution mode", value: payload.enabled ? "Scheduled sync enabled" : "Manual execution only" },
          { label: "Recommended posture", value: payload.batchSize >= 100 ? "High throughput" : "Controlled throughput" }
        ]
      }
    ],
    table: null,
    editor: payload
  };
}

export function buildAdminCatalogViewModel(
  route: AdminCatalogRoute,
  payload: SkillsPayload | JobsPayload | SyncJobsPayload | RepositorySyncPolicy
): AdminCatalogViewModel {
  if (route === "/admin/skills") {
    return buildSkillsViewModel(payload as SkillsPayload);
  }
  if (route === "/admin/jobs") {
    return buildJobsViewModel(payload as JobsPayload);
  }
  if (route === "/admin/sync-jobs") {
    return buildSyncJobsViewModel(payload as SyncJobsPayload);
  }
  return buildSyncPolicyViewModel(payload as RepositorySyncPolicy);
}
