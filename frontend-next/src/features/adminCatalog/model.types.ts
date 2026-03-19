import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { AdminCatalogMessages } from "@/src/lib/i18n/protectedPageMessages.catalog";

export type AdminCatalogRoute =
  | "/admin/skills"
  | "/admin/jobs"
  | "/admin/sync-jobs"
  | "/admin/sync-policy/repository";

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
  statusLabel?: string;
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

export interface AdminCatalogModelMessages {
  metricTotalSkills: string;
  metricListedRows: string;
  metricPublicSkills: string;
  metricAverageQuality: string;
  metricQueuedJobs: string;
  metricRunningJobs: string;
  metricFailedJobs: string;
  metricRetryPressure: string;
  metricSyncRuns: string;
  metricSyncedItems: string;
  metricFailedItems: string;
  metricLatestDuration: string;
  metricSchedulerEnabled: string;
  metricInterval: string;
  metricTimeout: string;
  metricBatchSize: string;
  panelCatalogSignalsTitle: string;
  panelCatalogSignalsRepositoryBacked: string;
  panelCatalogSignalsManualOther: string;
  panelExecutionSignalsTitle: string;
  panelExecutionSignalsLatestRunning: string;
  panelExecutionSignalsMaxRetrySpan: string;
  panelRunDistributionTitle: string;
  panelRunDistributionScheduledRuns: string;
  panelRunDistributionManualRuns: string;
  panelPolicyNotesTitle: string;
  panelPolicyExecutionMode: string;
  panelPolicyRecommendedPosture: string;
  summarySkillPrefix: string;
  summaryOwnerPrefix: string;
  summaryActorPrefix: string;
  attemptTemplate: string;
  starsSuffix: string;
  qualitySuffix: string;
  syncedSummarySuffix: string;
  failedSummarySuffix: string;
  candidatesSummarySuffix: string;
  valueNotAvailable: string;
  valueYes: string;
  valueNo: string;
  valueScheduledSyncEnabled: string;
  valueManualExecutionOnly: string;
  valueHighThroughput: string;
  valueControlledThroughput: string;
}

export interface AdminCatalogViewModelOptions {
  locale?: PublicLocale;
  messages?: AdminCatalogModelMessages;
}

export interface AdminCatalogRouteMeta {
  title: string;
  description: string;
  endpoint: string;
}

export type AdminCatalogPageMessages = Pick<
  AdminCatalogMessages,
  | "routeSkillsTitle"
  | "routeSkillsDescription"
  | "routeJobsTitle"
  | "routeJobsDescription"
  | "routeSyncJobsTitle"
  | "routeSyncJobsDescription"
  | "routePolicyTitle"
  | "routePolicyDescription"
  | "loadError"
  | "actionError"
  | "retryJobSuccess"
  | "cancelJobSuccess"
  | "skillSyncSuccess"
  | "policySaveSuccess"
>;
