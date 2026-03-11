import type { AppLocale } from "../../lib/i18n";
import { getSkillOperationsCopy } from "./SkillOperationsPage.copy";
import type {
  ImportJobItem,
  SkillInventoryItem,
  SkillOperationsRoute,
  SkillOperationsRouteMeta,
  SkillOperationsViewKind
} from "./SkillOperationsPage.types";
import type { SyncPolicyRecord, SyncRunRecord } from "../recordsSyncCenter/RecordsSyncCenterPage.types";
import type { WorkspaceSidebarGroup } from "../workspace/WorkspaceCenterPage.navigation";

export const skillOperationsRouteOrder: SkillOperationsRoute[] = [
  "/admin/ingestion/manual",
  "/admin/ingestion/repository",
  "/admin/records/imports",
  "/admin/sync-jobs"
];

export const defaultSkillOperationsPolicy: SyncPolicyRecord = {
  enabled: false,
  interval: "30m",
  timeout: "10m",
  batch_size: 20
};

export function isSkillOperationsRoute(route: string): route is SkillOperationsRoute {
  return skillOperationsRouteOrder.includes(route as SkillOperationsRoute);
}

function normalizeSkillOperationsPath(pathname: string): string {
  if (pathname === "/mobile/light" || pathname.startsWith("/mobile/light/")) {
    return pathname.slice("/mobile/light".length) || "/";
  }
  if (pathname === "/mobile" || pathname.startsWith("/mobile/")) {
    return pathname.slice("/mobile".length) || "/";
  }
  if (pathname === "/light" || pathname.startsWith("/light/")) {
    return pathname.slice("/light".length) || "/";
  }
  return pathname;
}

export function resolveSkillOperationsActiveMenuID(pathname: string): string {
  const normalizedPath = normalizeSkillOperationsPath(pathname);
  if (
    normalizedPath === "/admin/ingestion/manual" ||
    normalizedPath.startsWith("/admin/ingestion/manual/") ||
    normalizedPath === "/admin/ingestion/repository" ||
    normalizedPath.startsWith("/admin/ingestion/repository/")
  ) {
    return "skill-code-repository";
  }

  return "skill-sync-records";
}

export function resolveSkillOperationsSidebarGroups(groups: WorkspaceSidebarGroup[]): WorkspaceSidebarGroup[] {
  const skillManagementGroup = groups.find((group) => group.id === "skill-management");
  return skillManagementGroup ? [skillManagementGroup] : groups;
}

export function resolveSkillOperationsViewKind(route: SkillOperationsRoute): SkillOperationsViewKind {
  if (route === "/admin/ingestion/manual") {
    return "manual";
  }
  if (route === "/admin/ingestion/repository") {
    return "repository";
  }
  if (route === "/admin/records/imports") {
    return "imports";
  }
  return "sync-runs";
}

export function getSkillOperationsRouteMeta(locale: AppLocale, route: SkillOperationsRoute): SkillOperationsRouteMeta {
  const text = getSkillOperationsCopy(locale);
  switch (route) {
    case "/admin/ingestion/manual":
      return text.manual;
    case "/admin/ingestion/repository":
      return text.repository;
    case "/admin/records/imports":
      return text.imports;
    default:
      return text.syncRuns;
  }
}

export function normalizeSkillInventoryItem(raw: Record<string, unknown>): SkillInventoryItem {
  return {
    id: Number(raw.id || 0),
    name: String(raw.name || ""),
    description: String(raw.description || ""),
    source_type: String(raw.source_type || ""),
    visibility: String(raw.visibility || ""),
    owner_username: String(raw.owner_username || ""),
    updated_at: String(raw.updated_at || "")
  };
}

export function normalizeImportJobItem(raw: Record<string, unknown>): ImportJobItem {
  return {
    id: Number(raw.id || 0),
    job_type: String(raw.job_type || ""),
    status: String(raw.status || ""),
    owner_user_id: Number(raw.owner_user_id || 0),
    actor_user_id: Number(raw.actor_user_id || 0),
    target_skill_id: Number(raw.target_skill_id || 0),
    error_message: String(raw.error_message || ""),
    created_at: String(raw.created_at || ""),
    updated_at: String(raw.updated_at || "")
  };
}

export function filterImportJobs(items: ImportJobItem[]): ImportJobItem[] {
  return items.filter((item) => item.job_type.startsWith("import_"));
}

export function canRetryImportJob(item: ImportJobItem): boolean {
  return item.status === "failed" || item.status === "canceled";
}

export function canCancelImportJob(item: ImportJobItem): boolean {
  return item.status === "pending" || item.status === "running";
}

export function filterSkillsForRoute(skills: SkillInventoryItem[], route: SkillOperationsRoute): SkillInventoryItem[] {
  if (route === "/admin/ingestion/manual") {
    return skills.filter((item) => item.source_type === "manual");
  }
  if (route === "/admin/ingestion/repository") {
    return skills.filter((item) => item.source_type === "repository");
  }
  if (route === "/admin/records/imports") {
    return skills.filter((item) => item.source_type === "upload" || item.source_type === "skillmp");
  }
  return skills;
}

export function formatSkillOperationsDateTime(value: string, locale: AppLocale): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}

export function buildSkillOperationsMetrics(input: {
  route: SkillOperationsRoute;
  locale: AppLocale;
  skills: SkillInventoryItem[];
  syncRuns: SyncRunRecord[];
  policy: SyncPolicyRecord;
}) {
  const { route, locale, skills, syncRuns, policy } = input;
  const text = getSkillOperationsCopy(locale);
  const filteredSkills = filterSkillsForRoute(skills, route);

  if (route === "/admin/ingestion/manual") {
    const publicCount = filteredSkills.filter((item) => item.visibility === "public").length;
    return [
      { id: "manual-total", label: "Manual Skills", value: filteredSkills.length },
      { id: "manual-public", label: "Public", value: publicCount },
      {
        id: "manual-latest",
        label: "Latest Update",
        value: formatSkillOperationsDateTime(filteredSkills[0]?.updated_at || "", locale)
      }
    ];
  }

  if (route === "/admin/ingestion/repository") {
    const failedRuns = syncRuns.filter((item) => item.status.toLowerCase() === "failed" || item.failed > 0).length;
    return [
      { id: "repo-total", label: "Repository Skills", value: filteredSkills.length },
      { id: "repo-runs", label: "Listed Runs", value: syncRuns.length },
      { id: "repo-failed", label: "Failure-bearing Runs", value: failedRuns },
      { id: "repo-policy", label: "Scheduler", value: policy.enabled ? text.schedulerEnabled : text.schedulerDisabled }
    ];
  }

  if (route === "/admin/records/imports") {
    const archiveCount = filteredSkills.filter((item) => item.source_type === "upload").length;
    const skillMPCount = filteredSkills.filter((item) => item.source_type === "skillmp").length;
    return [
      { id: "imports-total", label: "Imported Skills", value: filteredSkills.length },
      { id: "imports-archive", label: "Archive Imports", value: archiveCount },
      { id: "imports-skillmp", label: "SkillMP Imports", value: skillMPCount }
    ];
  }

  const failedRuns = syncRuns.filter((item) => item.status.toLowerCase() === "failed" || item.failed > 0).length;
  const partialRuns = syncRuns.filter((item) => item.status.toLowerCase() === "partial").length;
  return [
    { id: "sync-total", label: "Sync Runs", value: syncRuns.length },
    { id: "sync-failed", label: "Failure-bearing Runs", value: failedRuns },
    { id: "sync-partial", label: "Partial Runs", value: partialRuns },
    { id: "sync-policy", label: "Scheduler", value: policy.enabled ? text.schedulerEnabled : text.schedulerDisabled }
  ];
}
