import type {
  AdminCatalogModelMessages,
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

export function resolveModelMessages(options?: AdminCatalogViewModelOptions): AdminCatalogModelMessages {
  return options?.messages || defaultAdminCatalogModelMessages;
}
