export type AdminIngestionRoute = "/admin/ingestion/manual" | "/admin/ingestion/repository" | "/admin/records/imports";

export const adminIngestionRouteMeta: Record<AdminIngestionRoute, { title: string; description: string }> = {
  "/admin/ingestion/manual": {
    title: "Manual Intake",
    description: "Create manually-authored skills and keep the manual inventory visible beside the form."
  },
  "/admin/ingestion/repository": {
    title: "Repository Intake",
    description: "Onboard repository-backed skills while keeping scheduler policy and recent runs in the same surface."
  },
  "/admin/records/imports": {
    title: "Import Records",
    description: "Operate archive and SkillMP imports with recent job evidence and imported inventory in one page."
  }
};

export interface ManualDraft {
  name: string;
  description: string;
  content: string;
  tags: string;
  visibility: string;
  install_command: string;
}

export interface RepositoryDraft {
  repo_url: string;
  repo_branch: string;
  repo_path: string;
  tags: string;
  visibility: string;
  install_command: string;
}

export interface ImportsDraft {
  archive_tags: string;
  archive_visibility: string;
  archive_install_command: string;
  skillmp_url: string;
  skillmp_id: string;
  skillmp_token: string;
  skillmp_tags: string;
  skillmp_visibility: string;
  skillmp_install_command: string;
}

export interface SkillInventoryItem {
  id: number;
  name: string;
  description: string;
  sourceType: string;
  visibility: string;
  ownerUsername: string;
  updatedAt: string;
}

export interface ImportJobItem {
  id: number;
  jobType: string;
  status: string;
  targetSkillId: number;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRunItem {
  id: number;
  trigger: string;
  scope: string;
  status: string;
  failed: number;
  synced: number;
  startedAt: string;
}

export interface RepositorySyncPolicy {
  enabled: boolean;
  interval: string;
  timeout: string;
  batchSize: number;
}

const repositorySyncPolicyDefaults: RepositorySyncPolicy = {
  enabled: false,
  interval: "30m",
  timeout: "10m",
  batchSize: 20
};

export const initialRepositorySyncPolicy: RepositorySyncPolicy = repositorySyncPolicyDefaults;

export function createManualDraft(): ManualDraft {
  return {
    name: "",
    description: "",
    content: "",
    tags: "",
    visibility: "private",
    install_command: ""
  };
}

export function createRepositoryDraft(): RepositoryDraft {
  return {
    repo_url: "",
    repo_branch: "main",
    repo_path: "",
    tags: "",
    visibility: "private",
    install_command: ""
  };
}

export function createImportsDraft(): ImportsDraft {
  return {
    archive_tags: "",
    archive_visibility: "private",
    archive_install_command: "",
    skillmp_url: "",
    skillmp_id: "",
    skillmp_token: "",
    skillmp_tags: "",
    skillmp_visibility: "private",
    skillmp_install_command: ""
  };
}

export function createRepositorySyncPolicy(): RepositorySyncPolicy {
  return { ...repositorySyncPolicyDefaults };
}

export interface SkillInventoryPayload {
  total: number;
  items: SkillInventoryItem[];
}

export interface ImportJobsPayload {
  total: number;
  items: ImportJobItem[];
}

export interface SyncRunsPayload {
  total: number;
  items: SyncRunItem[];
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function asString(value: unknown): string {
  return String(value || "").trim();
}

export function normalizeSkillInventoryPayload(payload: unknown): SkillInventoryPayload {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? record.items : [];

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => {
      const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        id: asNumber(entry.id),
        name: asString(entry.name) || "Unnamed skill",
        description: asString(entry.description) || "No description available.",
        sourceType: asString(entry.source_type) || "manual",
        visibility: asString(entry.visibility) || "private",
        ownerUsername: asString(entry.owner_username) || "n/a",
        updatedAt: asString(entry.updated_at)
      };
    })
  };
}

export function normalizeImportJobsPayload(payload: unknown): ImportJobsPayload {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? record.items : [];

  return {
    total: asNumber(record.total) || items.length,
    items: items
      .map((item) => {
        const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          id: asNumber(entry.id),
          jobType: asString(entry.job_type) || "unknown",
          status: asString(entry.status) || "unknown",
          targetSkillId: asNumber(entry.target_skill_id),
          errorMessage: asString(entry.error_message),
          createdAt: asString(entry.created_at),
          updatedAt: asString(entry.updated_at)
        };
      })
      .filter((item) => item.jobType.startsWith("import_"))
  };
}

export function normalizeSyncRunsPayload(payload: unknown): SyncRunsPayload {
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
        failed: asNumber(entry.failed),
        synced: asNumber(entry.synced),
        startedAt: asString(entry.started_at)
      };
    })
  };
}

export function normalizeRepositorySyncPolicyPayload(payload: unknown): RepositorySyncPolicy {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  return {
    enabled: Boolean(record.enabled),
    interval: asString(record.interval) || repositorySyncPolicyDefaults.interval,
    timeout: asString(record.timeout) || repositorySyncPolicyDefaults.timeout,
    batchSize: asNumber(record.batch_size) || repositorySyncPolicyDefaults.batchSize
  };
}

export function formatAdminIngestionDate(value: string): string {
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

export function buildAdminIngestionMetrics(
  route: AdminIngestionRoute,
  input: {
    skills: SkillInventoryItem[];
    importJobs: ImportJobItem[];
    syncRuns: SyncRunItem[];
    policy: RepositorySyncPolicy;
  }
) {
  if (route === "/admin/ingestion/manual") {
    const manualSkills = input.skills.filter((item) => item.sourceType === "manual");
    const publicCount = manualSkills.filter((item) => item.visibility.toLowerCase() === "public").length;
    return [
      { label: "Manual Skills", value: String(manualSkills.length) },
      { label: "Public Skills", value: String(publicCount) },
      { label: "Private Skills", value: String(Math.max(manualSkills.length - publicCount, 0)) }
    ];
  }

  if (route === "/admin/ingestion/repository") {
    const repositorySkills = input.skills.filter((item) => item.sourceType === "repository");
    const failedRuns = input.syncRuns.filter((item) => item.status.toLowerCase() === "failed" || item.failed > 0).length;
    return [
      { label: "Repository Skills", value: String(repositorySkills.length) },
      { label: "Sync Runs", value: String(input.syncRuns.length) },
      { label: "Failed Runs", value: String(failedRuns) },
      { label: "Scheduler", value: input.policy.enabled ? "Enabled" : "Disabled" }
    ];
  }

  const importedSkills = input.skills.filter((item) => item.sourceType === "upload" || item.sourceType === "skillmp");
  const archiveCount = importedSkills.filter((item) => item.sourceType === "upload").length;
  const skillMPCount = importedSkills.filter((item) => item.sourceType === "skillmp").length;
  return [
    { label: "Archive Imports", value: String(archiveCount) },
    { label: "SkillMP Imports", value: String(skillMPCount) },
    { label: "Import Jobs", value: String(input.importJobs.length) },
    { label: "Failed Jobs", value: String(input.importJobs.filter((item) => item.status.toLowerCase() === "failed").length) }
  ];
}

export function canRetryImportJob(job: ImportJobItem): boolean {
  const status = job.status.toLowerCase();
  return status === "failed" || status === "canceled";
}

export function canCancelImportJob(job: ImportJobItem): boolean {
  const status = job.status.toLowerCase();
  return status === "pending" || status === "running";
}
