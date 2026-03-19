import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { AdminIngestionMessages } from "@/src/lib/i18n/protectedPageMessages.ingestion";

export type AdminIngestionRoute = "/admin/ingestion/manual" | "/admin/ingestion/repository" | "/admin/records/imports";

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

export interface AdminIngestionMetricMessages {
  metricManualSkills: string;
  metricPublicSkills: string;
  metricPrivateSkills: string;
  metricRepositorySkills: string;
  metricSyncRuns: string;
  metricFailedRuns: string;
  metricScheduler: string;
  metricArchiveImports: string;
  metricSkillmpImports: string;
  metricImportJobs: string;
  metricFailedJobs: string;
  valueEnabled: string;
  valueDisabled: string;
}

export interface AdminIngestionMetricOptions {
  messages?: AdminIngestionMetricMessages;
}

const defaultAdminIngestionMetricMessages: AdminIngestionMetricMessages = {
  metricManualSkills: "Manual Skills",
  metricPublicSkills: "Public Skills",
  metricPrivateSkills: "Private Skills",
  metricRepositorySkills: "Repository Skills",
  metricSyncRuns: "Sync Runs",
  metricFailedRuns: "Failed Runs",
  metricScheduler: "Scheduler",
  metricArchiveImports: "Archive Imports",
  metricSkillmpImports: "SkillMP Imports",
  metricImportJobs: "Import Jobs",
  metricFailedJobs: "Failed Jobs",
  valueEnabled: "Enabled",
  valueDisabled: "Disabled"
};

export type AdminIngestionPageMessages = Pick<
  AdminIngestionMessages,
  | "routeManualTitle"
  | "routeManualDescription"
  | "routeRepositoryTitle"
  | "routeRepositoryDescription"
  | "routeImportsTitle"
  | "routeImportsDescription"
>;

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
        name: asString(entry.name),
        description: asString(entry.description),
        sourceType: asString(entry.source_type),
        visibility: asString(entry.visibility),
        ownerUsername: asString(entry.owner_username),
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
          jobType: asString(entry.job_type),
          status: asString(entry.status),
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
        trigger: asString(entry.trigger),
        scope: asString(entry.scope),
        status: asString(entry.status),
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

export function formatAdminIngestionDate(
  value: string,
  locale: PublicLocale = "en",
  notAvailable = "n/a"
): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return notAvailable;
  }

  return new Date(parsed).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
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
  },
  options?: AdminIngestionMetricOptions
) {
  const messages = options?.messages || defaultAdminIngestionMetricMessages;

  if (route === "/admin/ingestion/manual") {
    const manualSkills = input.skills.filter((item) => item.sourceType === "manual");
    const publicCount = manualSkills.filter((item) => item.visibility.toLowerCase() === "public").length;
    return [
      { label: messages.metricManualSkills, value: String(manualSkills.length) },
      { label: messages.metricPublicSkills, value: String(publicCount) },
      { label: messages.metricPrivateSkills, value: String(Math.max(manualSkills.length - publicCount, 0)) }
    ];
  }

  if (route === "/admin/ingestion/repository") {
    const repositorySkills = input.skills.filter((item) => item.sourceType === "repository");
    const failedRuns = input.syncRuns.filter((item) => item.status.toLowerCase() === "failed" || item.failed > 0).length;
    return [
      { label: messages.metricRepositorySkills, value: String(repositorySkills.length) },
      { label: messages.metricSyncRuns, value: String(input.syncRuns.length) },
      { label: messages.metricFailedRuns, value: String(failedRuns) },
      { label: messages.metricScheduler, value: input.policy.enabled ? messages.valueEnabled : messages.valueDisabled }
    ];
  }

  const importedSkills = input.skills.filter((item) => item.sourceType === "upload" || item.sourceType === "skillmp");
  const archiveCount = importedSkills.filter((item) => item.sourceType === "upload").length;
  const skillMPCount = importedSkills.filter((item) => item.sourceType === "skillmp").length;
  return [
    { label: messages.metricArchiveImports, value: String(archiveCount) },
    { label: messages.metricSkillmpImports, value: String(skillMPCount) },
    { label: messages.metricImportJobs, value: String(input.importJobs.length) },
    {
      label: messages.metricFailedJobs,
      value: String(input.importJobs.filter((item) => item.status.toLowerCase() === "failed").length)
    }
  ];
}

export function resolveAdminIngestionRouteMeta(route: AdminIngestionRoute, messages: AdminIngestionPageMessages) {
  if (route === "/admin/ingestion/manual") {
    return {
      title: messages.routeManualTitle,
      description: messages.routeManualDescription
    };
  }

  if (route === "/admin/ingestion/repository") {
    return {
      title: messages.routeRepositoryTitle,
      description: messages.routeRepositoryDescription
    };
  }

  return {
    title: messages.routeImportsTitle,
    description: messages.routeImportsDescription
  };
}

export function canRetryImportJob(job: ImportJobItem): boolean {
  const status = job.status.toLowerCase();
  return status === "failed" || status === "canceled";
}

export function canCancelImportJob(job: ImportJobItem): boolean {
  const status = job.status.toLowerCase();
  return status === "pending" || status === "running";
}
