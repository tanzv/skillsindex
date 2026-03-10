import type { AppLocale } from "../../lib/i18n";

import { resolveRecordsSyncViewKind } from "./RecordsSyncCenterPage.helpers";

export interface RecordsSyncCenterCopy {
  title: string;
  subtitle: string;
  eyebrow: string;
  loading: string;
  refresh: string;
  applyFilters: string;
  openJobs: string;
  openPolicy: string;
  openExports: string;
  ownerFilter: string;
  ownerFilterPlaceholder: string;
  limit: string;
  runList: string;
  runListHint: string;
  runDetail: string;
  runDetailHint: string;
  noRuns: string;
  noSelectedRun: string;
  status: string;
  duration: string;
  started: string;
  finished: string;
  trigger: string;
  scope: string;
  owner: string;
  actor: string;
  candidates: string;
  synced: string;
  failed: string;
  lastError: string;
  openDetail: string;
  detailsJSON: string;
  policy: string;
  policyHint: string;
  enabled: string;
  interval: string;
  timeout: string;
  batchSize: string;
  savePolicy: string;
  quickActions: string;
  quickActionImports: string;
  quickActionSyncJobs: string;
  quickActionExports: string;
  quickActionOpsMetrics: string;
  recordsCount: string;
  failedCount: string;
  partialCount: string;
  partialBadge: string;
  policyState: string;
  enabledState: string;
  disabledState: string;
  saveSuccess: string;
  requestFailed: string;
  invalidBatchSize: string;
  unknown: string;
  selectedRun: string;
  intervalPlaceholder: string;
  timeoutPlaceholder: string;
}

const sharedEn = {
  refresh: "Refresh",
  applyFilters: "Apply Filters",
  openJobs: "Open Jobs",
  openExports: "Open Exports",
  ownerFilter: "Owner ID",
  ownerFilterPlaceholder: "Leave empty for every visible owner",
  limit: "Limit",
  runDetail: "Selected Run Detail",
  runDetailHint: "Inspect the normalized payload returned by the sync ledger for the selected run.",
  noSelectedRun: "Select a run to inspect detail.",
  status: "Status",
  duration: "Duration",
  started: "Started",
  finished: "Finished",
  trigger: "Trigger",
  scope: "Scope",
  owner: "Owner",
  actor: "Actor",
  candidates: "Candidates",
  synced: "Synced",
  failed: "Failed",
  lastError: "Last Error",
  openDetail: "Open Detail",
  detailsJSON: "Detail Payload",
  policy: "Repository Sync Policy",
  enabled: "Enabled",
  interval: "Interval",
  timeout: "Timeout",
  batchSize: "Batch Size",
  savePolicy: "Save Policy",
  quickActionImports: "Imports",
  quickActionSyncJobs: "Sync Jobs",
  quickActionExports: "Exports",
  quickActionOpsMetrics: "Ops Metrics",
  failedCount: "Failed Runs",
  partialCount: "Partial Runs",
  partialBadge: "partial",
  policyState: "Policy State",
  enabledState: "Enabled",
  disabledState: "Disabled",
  saveSuccess: "Policy saved",
  requestFailed: "Request failed",
  invalidBatchSize: "Batch size must be a positive number.",
  unknown: "n/a",
  selectedRun: "Selected Run",
  intervalPlaceholder: "30m",
  timeoutPlaceholder: "10m"
} satisfies Omit<
  RecordsSyncCenterCopy,
  | "title"
  | "subtitle"
  | "eyebrow"
  | "loading"
  | "openPolicy"
  | "runList"
  | "runListHint"
  | "noRuns"
  | "policyHint"
  | "quickActions"
  | "recordsCount"
>;

const repositoryEn: RecordsSyncCenterCopy = {
  ...sharedEn,
  title: "Repository Ingestion Control",
  subtitle: "Monitor repository sync runs, inspect failure drift, and tune scheduler policy from the shared skill-management shell.",
  eyebrow: "Repository Ingestion",
  loading: "Loading repository ingestion control",
  openPolicy: "Open Policy",
  runList: "Repository Run Ledger",
  runListHint: "Review recent repository sync attempts, operators, and failure summaries.",
  noRuns: "No repository sync runs were returned.",
  policyHint: "Persist scheduler cadence and throughput guardrails used by repository ingestion.",
  quickActions: "Repository Shortcuts",
  recordsCount: "Repository Runs"
};

const recordsEn: RecordsSyncCenterCopy = {
  ...sharedEn,
  title: "Records Governance and Remote Sync",
  subtitle: "Track sync run history, inspect one run detail, and update scheduler policy from the workspace command surface.",
  eyebrow: "Records Sync",
  loading: "Loading sync records",
  openPolicy: "Open Sync Policy",
  runList: "Sync Run List",
  runListHint: "Review recent sync runs, owners, and failure summaries.",
  noRuns: "No sync run records were returned.",
  policyHint: "Update scheduler configuration used by repository synchronization.",
  quickActions: "Quick Actions",
  recordsCount: "Run Records"
};

const sharedZh = {
  refresh: "\u5237\u65b0",
  applyFilters: "\u5e94\u7528\u7b5b\u9009",
  openJobs: "\u6253\u5f00\u4efb\u52a1\u961f\u5217",
  openExports: "\u6253\u5f00\u5bfc\u51fa",
  ownerFilter: "\u6240\u6709\u8005 ID",
  ownerFilterPlaceholder: "\u7559\u7a7a\u8868\u793a\u5f53\u524d\u53ef\u89c1\u8303\u56f4",
  limit: "\u6761\u6570",
  runDetail: "\u6240\u9009\u8fd0\u884c\u8be6\u60c5",
  runDetailHint: "\u67e5\u770b\u6240\u9009\u8fd0\u884c\u7684\u6807\u51c6\u5316\u8fd4\u56de\u8f7d\u8377\u3002",
  noSelectedRun: "\u8bf7\u9009\u62e9\u4e00\u6761\u8fd0\u884c\u8bb0\u5f55\u67e5\u770b\u8be6\u60c5\u3002",
  status: "\u72b6\u6001",
  duration: "\u8017\u65f6",
  started: "\u5f00\u59cb\u65f6\u95f4",
  finished: "\u5b8c\u6210\u65f6\u95f4",
  trigger: "\u89e6\u53d1\u65b9\u5f0f",
  scope: "\u8303\u56f4",
  owner: "\u6240\u6709\u8005",
  actor: "\u64cd\u4f5c\u8005",
  candidates: "\u5019\u9009\u9879",
  synced: "\u5df2\u540c\u6b65",
  failed: "\u5931\u8d25",
  lastError: "\u6700\u540e\u9519\u8bef",
  openDetail: "\u67e5\u770b\u8be6\u60c5",
  detailsJSON: "\u8be6\u60c5\u8f7d\u8377",
  policy: "\u4ed3\u5e93\u540c\u6b65\u7b56\u7565",
  enabled: "\u542f\u7528",
  interval: "\u5468\u671f",
  timeout: "\u8d85\u65f6",
  batchSize: "\u6279\u91cf\u5927\u5c0f",
  savePolicy: "\u4fdd\u5b58\u7b56\u7565",
  quickActionImports: "\u5bfc\u5165\u8bb0\u5f55",
  quickActionSyncJobs: "\u540c\u6b65\u4efb\u52a1",
  quickActionExports: "\u5bfc\u51fa\u8bb0\u5f55",
  quickActionOpsMetrics: "\u8fd0\u7ef4\u6307\u6807",
  failedCount: "\u5931\u8d25\u8fd0\u884c",
  partialCount: "\u90e8\u5206\u5931\u8d25",
  partialBadge: "\u90e8\u5206\u5931\u8d25",
  policyState: "\u7b56\u7565\u72b6\u6001",
  enabledState: "\u5df2\u542f\u7528",
  disabledState: "\u5df2\u505c\u7528",
  saveSuccess: "\u7b56\u7565\u5df2\u4fdd\u5b58",
  requestFailed: "\u8bf7\u6c42\u5931\u8d25",
  invalidBatchSize: "\u6279\u91cf\u5927\u5c0f\u5fc5\u987b\u4e3a\u6b63\u6570\u3002",
  unknown: "\u6682\u65e0",
  selectedRun: "\u5df2\u9009\u8fd0\u884c",
  intervalPlaceholder: "30m",
  timeoutPlaceholder: "10m"
} satisfies Omit<
  RecordsSyncCenterCopy,
  | "title"
  | "subtitle"
  | "eyebrow"
  | "loading"
  | "openPolicy"
  | "runList"
  | "runListHint"
  | "noRuns"
  | "policyHint"
  | "quickActions"
  | "recordsCount"
>;

const repositoryZh: RecordsSyncCenterCopy = {
  ...sharedZh,
  title: "\u4ed3\u5e93\u63a5\u5165\u63a7\u5236\u53f0",
  subtitle: "\u5728\u7edf\u4e00\u6280\u80fd\u7ba1\u7406\u58f3\u5c42\u4e2d\u67e5\u770b\u4ed3\u5e93\u540c\u6b65\u8fd0\u884c\u3001\u6392\u67e5\u5931\u8d25\u6f02\u79fb\u5e76\u8c03\u6574\u8c03\u5ea6\u7b56\u7565\u3002",
  eyebrow: "\u4ed3\u5e93\u63a5\u5165",
  loading: "\u6b63\u5728\u52a0\u8f7d\u4ed3\u5e93\u63a5\u5165\u63a7\u5236\u53f0",
  openPolicy: "\u6253\u5f00\u7b56\u7565",
  runList: "\u4ed3\u5e93\u8fd0\u884c\u8d26\u672c",
  runListHint: "\u67e5\u770b\u6700\u8fd1\u7684\u4ed3\u5e93\u540c\u6b65\u5c1d\u8bd5\u3001\u64cd\u4f5c\u8005\u4e0e\u5931\u8d25\u6458\u8981\u3002",
  noRuns: "\u5f53\u524d\u6ca1\u6709\u8fd4\u56de\u4ed3\u5e93\u540c\u6b65\u8fd0\u884c\u8bb0\u5f55\u3002",
  policyHint: "\u6301\u4e45\u5316\u4ed3\u5e93\u63a5\u5165\u4f7f\u7528\u7684\u8c03\u5ea6\u5468\u671f\u4e0e\u541e\u5410\u4fdd\u62a4\u680f\u3002",
  quickActions: "\u4ed3\u5e93\u5feb\u6377\u5165\u53e3",
  recordsCount: "\u4ed3\u5e93\u8fd0\u884c"
};

const recordsZh: RecordsSyncCenterCopy = {
  ...sharedZh,
  title: "\u8bb0\u5f55\u6cbb\u7406\u4e0e\u8fdc\u7a0b\u540c\u6b65",
  subtitle: "\u8ddf\u8e2a\u540c\u6b65\u8fd0\u884c\u5386\u53f2\u3001\u68c0\u67e5\u5355\u6b21\u8fd0\u884c\u8be6\u60c5\uff0c\u5e76\u5728\u5de5\u4f5c\u53f0\u547d\u4ee4\u9762\u677f\u4e2d\u66f4\u65b0\u8c03\u5ea6\u7b56\u7565\u3002",
  eyebrow: "\u8bb0\u5f55\u540c\u6b65",
  loading: "\u6b63\u5728\u52a0\u8f7d\u8bb0\u5f55\u540c\u6b65\u4e2d\u5fc3",
  openPolicy: "\u6253\u5f00\u540c\u6b65\u7b56\u7565",
  runList: "\u540c\u6b65\u8fd0\u884c\u5217\u8868",
  runListHint: "\u67e5\u770b\u6700\u8fd1\u7684\u540c\u6b65\u8fd0\u884c\u3001\u8d1f\u8d23\u4eba\u548c\u5931\u8d25\u6458\u8981\u3002",
  noRuns: "\u5f53\u524d\u6ca1\u6709\u540c\u6b65\u8fd0\u884c\u8bb0\u5f55\u3002",
  policyHint: "\u66f4\u65b0\u4ed3\u5e93\u540c\u6b65\u6240\u4f7f\u7528\u7684\u8c03\u5ea6\u914d\u7f6e\u3002",
  quickActions: "\u5feb\u6377\u64cd\u4f5c",
  recordsCount: "\u8fd0\u884c\u8bb0\u5f55"
};

export function getRecordsSyncCenterCopy(locale: AppLocale, pathname: string): RecordsSyncCenterCopy {
  const viewKind = resolveRecordsSyncViewKind(pathname);
  if (locale === "zh") {
    return viewKind === "repository" ? repositoryZh : recordsZh;
  }
  return viewKind === "repository" ? repositoryEn : recordsEn;
}
