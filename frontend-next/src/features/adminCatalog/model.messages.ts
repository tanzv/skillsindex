import type {
  AdminCatalogModelMessages,
  AdminCatalogPageMessages,
  AdminCatalogRoute,
  AdminCatalogRouteMeta,
  AdminCatalogViewModelOptions
} from "./model.types";

const defaultAdminCatalogModelMessages: AdminCatalogModelMessages = {
  metricTotalSkills: "Total Skills",
  metricListedRows: "Listed Rows",
  metricPublicSkills: "Public Skills",
  metricAverageQuality: "Average Quality",
  metricQueuedJobs: "Queued Jobs",
  metricRunningJobs: "Running Jobs",
  metricFailedJobs: "Failed Jobs",
  metricRetryPressure: "Retry Pressure",
  metricSyncRuns: "Sync Runs",
  metricSyncedItems: "Synced Items",
  metricFailedItems: "Failed Items",
  metricLatestDuration: "Latest Duration",
  metricSchedulerEnabled: "Scheduler Enabled",
  metricInterval: "Interval",
  metricTimeout: "Timeout",
  metricBatchSize: "Batch Size",
  panelCatalogSignalsTitle: "Catalog Signals",
  panelCatalogSignalsRepositoryBacked: "Repository-backed",
  panelCatalogSignalsManualOther: "Manual or other",
  panelExecutionSignalsTitle: "Execution Signals",
  panelExecutionSignalsLatestRunning: "Latest running",
  panelExecutionSignalsMaxRetrySpan: "Max retry span",
  panelRunDistributionTitle: "Run Distribution",
  panelRunDistributionScheduledRuns: "Scheduled runs",
  panelRunDistributionManualRuns: "Manual runs",
  panelPolicyNotesTitle: "Policy Notes",
  panelPolicyExecutionMode: "Execution mode",
  panelPolicyRecommendedPosture: "Recommended posture",
  summarySkillPrefix: "Skill",
  summaryOwnerPrefix: "owner",
  summaryActorPrefix: "actor",
  attemptTemplate: "Attempt {attempt}/{maxAttempts}",
  starsSuffix: "stars",
  qualitySuffix: "quality",
  syncedSummarySuffix: "synced",
  failedSummarySuffix: "failed",
  candidatesSummarySuffix: "candidates",
  valueNotAvailable: "n/a",
  valueYes: "Yes",
  valueNo: "No",
  valueScheduledSyncEnabled: "Scheduled sync enabled",
  valueManualExecutionOnly: "Manual execution only",
  valueHighThroughput: "High throughput",
  valueControlledThroughput: "Controlled throughput"
};

const defaultAdminCatalogPageMessages: AdminCatalogPageMessages = {
  routeSkillsTitle: "Skill Governance",
  routeSkillsDescription: "Inspect governed skill inventory with stronger structure than the generic JSON workbench.",
  routeJobsTitle: "Asynchronous Jobs",
  routeJobsDescription: "Track active queue pressure, failed runs, and targeted retry or cancel actions.",
  routeSyncJobsTitle: "Repository Sync Jobs",
  routeSyncJobsDescription: "Review sync run throughput, failures, and latest execution timing.",
  routePolicyTitle: "Repository Sync Policy",
  routePolicyDescription: "Manage scheduler policy for repository synchronization from a dedicated control surface.",
  loadError: "Request failed",
  actionError: "Action failed",
  retryJobSuccess: "Job {id} retry requested.",
  cancelJobSuccess: "Job {id} cancel requested.",
  skillSyncSuccess: "Repository skill updated.",
  policySaveSuccess: "Policy saved."
};

const routeMetaResolvers: Record<AdminCatalogRoute, (messages: AdminCatalogPageMessages) => AdminCatalogRouteMeta> = {
  "/admin/skills": (messages) => ({
    title: messages.routeSkillsTitle,
    description: messages.routeSkillsDescription,
    endpoint: "/api/bff/admin/skills"
  }),
  "/admin/jobs": (messages) => ({
    title: messages.routeJobsTitle,
    description: messages.routeJobsDescription,
    endpoint: "/api/bff/admin/jobs"
  }),
  "/admin/sync-jobs": (messages) => ({
    title: messages.routeSyncJobsTitle,
    description: messages.routeSyncJobsDescription,
    endpoint: "/api/bff/admin/sync-jobs"
  }),
  "/admin/sync-policy/repository": (messages) => ({
    title: messages.routePolicyTitle,
    description: messages.routePolicyDescription,
    endpoint: "/api/bff/admin/sync-policy/repository"
  })
};

export function resolveModelMessages(options?: AdminCatalogViewModelOptions): AdminCatalogModelMessages {
  return options?.messages || defaultAdminCatalogModelMessages;
}

export function resolveAdminCatalogRouteMeta(
  route: AdminCatalogRoute,
  messages: AdminCatalogPageMessages = defaultAdminCatalogPageMessages
): AdminCatalogRouteMeta {
  return routeMetaResolvers[route](messages);
}
