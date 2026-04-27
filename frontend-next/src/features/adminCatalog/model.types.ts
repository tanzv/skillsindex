import type { PublicLocale } from "@/src/lib/i18n/publicLocale";

export type { AdminCatalogRoute } from "@/src/lib/routing/adminRouteRegistry";

export interface AdminSourceDependency {
  kind: string;
  target: string;
}

export interface AdminSourceAnalysis {
  entryFile: string;
  mechanism: string;
  metadataSources: string[];
  referencePaths: string[];
  dependencies: AdminSourceDependency[];
}

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
  sourceAnalysis: AdminSourceAnalysis;
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

export interface AdminCatalogDetailSectionItem {
  label?: string;
  value: string;
  href?: string;
}

export interface AdminCatalogDetailSection {
  title: string;
  items: AdminCatalogDetailSectionItem[];
}

export interface AdminCatalogTopologyNode {
  label?: string;
  value: string;
  href?: string;
}

export interface AdminCatalogTopologyLane {
  title: string;
  nodes: AdminCatalogTopologyNode[];
  emptyValue: string;
}

export interface AdminCatalogDetailTopology {
  title: string;
  rootLabel: string;
  rootValue: string;
  rootMetaLabel: string;
  rootMetaValue: string;
  lanes: AdminCatalogTopologyLane[];
}

export interface AdminCatalogRow {
  id: number;
  name: string;
  summary: string;
  meta: string[];
  status: string;
  statusLabel?: string;
  detail?: string;
  detailTopology?: AdminCatalogDetailTopology;
  detailSections?: AdminCatalogDetailSection[];
  syncable?: boolean;
}

export interface AdminCatalogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminCatalogViewModel {
  metrics: AdminCatalogMetric[];
  sidePanel: AdminCatalogSidePanel[];
  table: {
    title: string;
    rows: AdminCatalogRow[];
    pagination?: AdminCatalogPagination | null;
  } | null;
  editor: RepositorySyncPolicy | null;
}

export interface CollectionPayload<TItem> {
  total: number;
  page: number;
  limit: number;
  items: TItem[];
}

export type SkillsPayload = CollectionPayload<AdminSkillItem>;

export type JobsPayload = CollectionPayload<AsyncJobItem>;

export type SyncJobsPayload = CollectionPayload<SyncJobRunItem>;

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
  detailSourceAnalysisTitle: string;
  detailEntryFileLabel: string;
  detailMechanismLabel: string;
  detailMetadataSourcesTitle: string;
  detailReferencePathsTitle: string;
  detailDependenciesTitle: string;
  detailTopologyTitle: string;
  detailTopologyRootTitle: string;
  detailNoMetadataSources: string;
  detailNoReferencePaths: string;
  detailNoDependencies: string;
}

export interface AdminCatalogViewModelOptions {
  locale?: PublicLocale;
  messages?: AdminCatalogModelMessages;
}
