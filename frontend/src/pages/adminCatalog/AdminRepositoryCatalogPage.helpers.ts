import type { AppLocale } from "../../lib/i18n";
import { getAdminRepositoryCatalogCopy } from "./AdminRepositoryCatalogPage.copy";

export type AdminRepositoryCatalogRoute = "/admin/jobs" | "/admin/sync-jobs" | "/admin/sync-policy/repository";

export interface AsyncJobItem {
  id: number;
  job_type: string;
  status: string;
  owner_user_id: number;
  actor_user_id: number;
  target_skill_id: number;
  attempt: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface SyncJobRunItem {
  id: number;
  trigger: string;
  scope: string;
  status: string;
  candidates: number;
  synced: number;
  failed: number;
  duration_ms: number;
  started_at: string;
  finished_at: string;
}

export interface RepositorySyncPolicy {
  enabled: boolean;
  interval: string;
  timeout: string;
  batch_size: number;
}

export interface RepositoryRouteMeta {
  route: AdminRepositoryCatalogRoute;
  navLabel: string;
  navHint: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  endpoint: string;
}

export interface RepositorySummaryMetric {
  id: string;
  label: string;
  value: string | number;
  help?: string;
}

export const repositoryRouteOrder: AdminRepositoryCatalogRoute[] = [
  "/admin/jobs",
  "/admin/sync-jobs",
  "/admin/sync-policy/repository"
];

export function isAdminRepositoryCatalogRoute(route: string): route is AdminRepositoryCatalogRoute {
  return repositoryRouteOrder.includes(route as AdminRepositoryCatalogRoute);
}

export function getRepositoryRouteMeta(locale: AppLocale): Record<AdminRepositoryCatalogRoute, RepositoryRouteMeta> {
  return getAdminRepositoryCatalogCopy(locale).routeMeta;
}

export function formatDateTime(value: string, locale: AppLocale): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  const language = locale === "zh" ? "zh-CN" : "en-US";
  return parsed.toLocaleString(language);
}

export function formatRepositoryStatus(status: string, locale: AppLocale): string {
  const normalized = status.trim().toLowerCase();
  const text = getAdminRepositoryCatalogCopy(locale);

  if (!normalized) {
    return text.unknownState;
  }

  return text.statusLabels[normalized] || status;
}

export function formatRepositoryTrigger(trigger: string, locale: AppLocale): string {
  const normalized = trigger.trim().toLowerCase();
  const text = getAdminRepositoryCatalogCopy(locale);

  if (!normalized) {
    return text.triggerLabels.unknown;
  }

  return text.triggerLabels[normalized] || trigger;
}

export function resolveRepositoryStatusColor(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (["failed", "error", "canceled", "cancelled"].includes(normalized)) {
    return "red";
  }
  if (["partial", "warning"].includes(normalized)) {
    return "orange";
  }
  if (["running", "in_progress", "processing"].includes(normalized)) {
    return "blue";
  }
  if (["pending", "queued", "waiting"].includes(normalized)) {
    return "gold";
  }
  if (["enabled", "active", "success", "succeeded", "completed", "done"].includes(normalized)) {
    return "green";
  }
  return "default";
}

export function buildRepositorySummaryMetrics(input: {
  locale: AppLocale;
  route: AdminRepositoryCatalogRoute;
  jobs: AsyncJobItem[];
  jobsTotal: number;
  syncJobs: SyncJobRunItem[];
  syncJobsTotal: number;
  policy: RepositorySyncPolicy | null;
}): RepositorySummaryMetric[] {
  const { locale, route, jobs, jobsTotal, syncJobs, syncJobsTotal, policy } = input;
  const text = getAdminRepositoryCatalogCopy(locale);

  if (route === "/admin/jobs") {
    const runningCount = jobs.filter((item) => item.status.trim().toLowerCase() === "running").length;
    const failedCount = jobs.filter((item) => item.status.trim().toLowerCase() === "failed").length;
    return [
      { id: "jobs-total", label: text.summaryMetrics.totalJobs, value: jobsTotal },
      { id: "jobs-listed", label: text.summaryMetrics.listedRows, value: jobs.length },
      { id: "jobs-running", label: text.summaryMetrics.running, value: runningCount },
      { id: "jobs-failed", label: text.summaryMetrics.failed, value: failedCount }
    ];
  }

  if (route === "/admin/sync-jobs") {
    const failedRuns = syncJobs.filter((item) => item.failed > 0 || item.status.trim().toLowerCase() === "failed").length;
    const totalSynced = syncJobs.reduce((sum, item) => sum + Number(item.synced || 0), 0);
    return [
      { id: "sync-total", label: text.summaryMetrics.totalSyncRuns, value: syncJobsTotal },
      { id: "sync-listed", label: text.summaryMetrics.listedRows, value: syncJobs.length },
      { id: "sync-failed", label: text.summaryMetrics.runsWithFailures, value: failedRuns },
      { id: "sync-items", label: text.summaryMetrics.totalSyncedItems, value: totalSynced }
    ];
  }

  return [
    { id: "policy-enabled", label: text.summaryMetrics.schedulerState, value: policy?.enabled ? text.enabledState : text.disabledState },
    { id: "policy-interval", label: text.summaryMetrics.interval, value: policy?.interval || "-" },
    { id: "policy-timeout", label: text.summaryMetrics.timeout, value: policy?.timeout || "-" },
    { id: "policy-batch-size", label: text.summaryMetrics.batchSize, value: policy?.batch_size ?? 0 }
  ];
}

export function buildRepositoryRouteNotes(route: AdminRepositoryCatalogRoute, locale: AppLocale): string[] {
  return getAdminRepositoryCatalogCopy(locale).routeNotes[route];
}

export function buildRepositoryLatestActivityLabel(
  route: AdminRepositoryCatalogRoute,
  jobs: AsyncJobItem[],
  syncJobs: SyncJobRunItem[],
  locale: AppLocale
): string {
  const text = getAdminRepositoryCatalogCopy(locale);

  if (route === "/admin/jobs") {
    return formatDateTime(jobs[0]?.updated_at || jobs[0]?.created_at || "", locale);
  }
  if (route === "/admin/sync-jobs") {
    return formatDateTime(syncJobs[0]?.started_at || syncJobs[0]?.finished_at || "", locale);
  }
  return text.policyBacked;
}
