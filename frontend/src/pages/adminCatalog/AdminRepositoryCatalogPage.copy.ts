import type { AppLocale } from "../../lib/i18n";
import type { AdminRepositoryCatalogRoute, RepositoryRouteMeta } from "./AdminRepositoryCatalogPage.helpers";

interface RepositoryJobsColumnsCopy {
  id: string;
  jobType: string;
  status: string;
  attempt: string;
  owner: string;
  actor: string;
  targetSkill: string;
  updated: string;
}

interface RepositorySyncRunsColumnsCopy {
  id: string;
  trigger: string;
  scope: string;
  status: string;
  candidates: string;
  synced: string;
  failed: string;
  durationMs: string;
  started: string;
}

interface RepositorySummaryMetricsCopy {
  totalJobs: string;
  listedRows: string;
  running: string;
  failed: string;
  totalSyncRuns: string;
  runsWithFailures: string;
  totalSyncedItems: string;
  schedulerState: string;
  interval: string;
  timeout: string;
  batchSize: string;
}

interface RepositoryPolicyCopy {
  editorTitle: string;
  editorDescription: string;
  snapshotTitle: string;
  enabled: string;
  batchSize: string;
  interval: string;
  timeout: string;
  savePolicy: string;
}

export interface AdminRepositoryCatalogCopy {
  requestFailed: string;
  batchSizePositive: string;
  policyUpdatedSuccessfully: string;
  refresh: string;
  repositoryAdmin: string;
  totalLabel: string;
  listedLabel: string;
  routeContextTitle: string;
  routeContextSurfaceLabel: string;
  routeContextLatestActivityLabel: string;
  operatorNotesTitle: string;
  repositoryNavigationTitle: string;
  metricsLensTitle: string;
  enabledState: string;
  disabledState: string;
  unknownState: string;
  policyBacked: string;
  jobs: {
    panelTitle: string;
    description: string;
    emptyText: string;
    columns: RepositoryJobsColumnsCopy;
  };
  syncRuns: {
    panelTitle: string;
    description: string;
    emptyText: string;
    columns: RepositorySyncRunsColumnsCopy;
  };
  policy: RepositoryPolicyCopy;
  summaryMetrics: RepositorySummaryMetricsCopy;
  routeMeta: Record<AdminRepositoryCatalogRoute, RepositoryRouteMeta>;
  routeNotes: Record<AdminRepositoryCatalogRoute, string[]>;
  statusLabels: Record<string, string>;
  triggerLabels: Record<string, string>;
}

const enCopy: AdminRepositoryCatalogCopy = {
  requestFailed: "Request failed",
  batchSizePositive: "Batch size must be a positive number",
  policyUpdatedSuccessfully: "Policy updated successfully",
  refresh: "Refresh",
  repositoryAdmin: "Repository Admin",
  totalLabel: "Total",
  listedLabel: "Listed",
  routeContextTitle: "Route Context",
  routeContextSurfaceLabel: "Surface",
  routeContextLatestActivityLabel: "Latest Activity",
  operatorNotesTitle: "Operator Notes",
  repositoryNavigationTitle: "Repository Navigation",
  metricsLensTitle: "Metrics Lens",
  enabledState: "Enabled",
  disabledState: "Disabled",
  unknownState: "Unknown",
  policyBacked: "Policy-backed",
  jobs: {
    panelTitle: "Job Queue",
    description: "Queue depth, execution state, and ownership stay in one stable table layout for repository operations.",
    emptyText: "No asynchronous jobs were returned for the current admin session.",
    columns: {
      id: "ID",
      jobType: "Type",
      status: "Status",
      attempt: "Attempt",
      owner: "Owner",
      actor: "Actor",
      targetSkill: "Target Skill",
      updated: "Updated"
    }
  },
  syncRuns: {
    panelTitle: "Sync Run Timeline",
    description: "Run history now follows the same layout contract as queue and policy pages to improve scan speed across repository operations.",
    emptyText: "No repository sync runs were returned for the current admin session.",
    columns: {
      id: "ID",
      trigger: "Trigger",
      scope: "Scope",
      status: "Status",
      candidates: "Candidates",
      synced: "Synced",
      failed: "Failed",
      durationMs: "Duration (ms)",
      started: "Started"
    }
  },
  policy: {
    editorTitle: "Policy Editor",
    editorDescription: "Update scheduler fields and persist them from the same token-driven surface used by the other repository operation pages.",
    snapshotTitle: "Current Policy Snapshot",
    enabled: "Enabled",
    batchSize: "Batch Size",
    interval: "Interval",
    timeout: "Timeout",
    savePolicy: "Save Policy"
  },
  summaryMetrics: {
    totalJobs: "Total Jobs",
    listedRows: "Listed Rows",
    running: "Running",
    failed: "Failed",
    totalSyncRuns: "Total Sync Runs",
    runsWithFailures: "Runs With Failures",
    totalSyncedItems: "Total Synced Items",
    schedulerState: "Scheduler State",
    interval: "Interval",
    timeout: "Timeout",
    batchSize: "Batch Size"
  },
  routeMeta: {
    "/admin/jobs": {
      route: "/admin/jobs",
      navLabel: "Job Queue",
      navHint: "Orchestration throughput",
      eyebrow: "Repository Operations",
      title: "Asynchronous Jobs",
      subtitle: "Inspect queue health, execution pressure, and recent orchestration movement from one consistent admin surface.",
      endpoint: "GET /api/v1/admin/jobs"
    },
    "/admin/sync-jobs": {
      route: "/admin/sync-jobs",
      navLabel: "Sync Runs",
      navHint: "Repository run ledger",
      eyebrow: "Repository Operations",
      title: "Repository Sync Runs",
      subtitle: "Review run volume, failure posture, and timing signals with the same navigation and hierarchy used across repository admin surfaces.",
      endpoint: "GET /api/v1/admin/sync-jobs"
    },
    "/admin/sync-policy/repository": {
      route: "/admin/sync-policy/repository",
      navLabel: "Sync Policy",
      navHint: "Scheduler controls",
      eyebrow: "Repository Operations",
      title: "Repository Sync Policy",
      subtitle: "Update scheduler cadence and execution guardrails without leaving the standardized repository operations layout.",
      endpoint: "GET/POST /api/v1/admin/sync-policy/repository"
    }
  },
  routeNotes: {
    "/admin/jobs": [
      "Use this surface to monitor orchestration pressure before retrying or canceling downstream work.",
      "Check owner and actor identifiers together so queue actions stay auditable.",
      "Move to sync runs when repository execution failures start to cluster."
    ],
    "/admin/sync-jobs": [
      "Track failure-bearing runs separately from healthy throughput to spot repository ingestion drift.",
      "Use duration and synced counts together when comparing run efficiency across windows.",
      "Open scheduler policy before changing cadence so timing changes remain intentional."
    ],
    "/admin/sync-policy/repository": [
      "Policy changes should preserve operational intent across light and dark admin surfaces.",
      "Keep interval, timeout, and batch size aligned with current repository workload and retry posture.",
      "Refresh after save to confirm backend state rather than relying on local form values alone."
    ]
  },
  statusLabels: {
    unknown: "Unknown",
    failed: "Failed",
    error: "Error",
    canceled: "Canceled",
    cancelled: "Cancelled",
    partial: "Partial",
    warning: "Warning",
    running: "Running",
    in_progress: "In Progress",
    processing: "Processing",
    pending: "Pending",
    queued: "Queued",
    waiting: "Waiting",
    enabled: "Enabled",
    active: "Active",
    success: "Success",
    succeeded: "Succeeded",
    completed: "Completed",
    done: "Done",
    disabled: "Disabled"
  },
  triggerLabels: {
    manual: "Manual",
    schedule: "Scheduled",
    scheduled: "Scheduled",
    unknown: "Unknown"
  }
};

const zhCopy: AdminRepositoryCatalogCopy = {
  requestFailed: "\u8bf7\u6c42\u5931\u8d25",
  batchSizePositive: "\u6279\u91cf\u5927\u5c0f\u5fc5\u987b\u4e3a\u6b63\u6570",
  policyUpdatedSuccessfully: "\u7b56\u7565\u66f4\u65b0\u6210\u529f",
  refresh: "\u5237\u65b0",
  repositoryAdmin: "\u4ed3\u5e93\u7ba1\u7406",
  totalLabel: "\u603b\u8ba1",
  listedLabel: "\u5df2\u5217\u51fa",
  routeContextTitle: "\u8def\u7531\u4e0a\u4e0b\u6587",
  routeContextSurfaceLabel: "\u5f53\u524d\u89c6\u56fe",
  routeContextLatestActivityLabel: "\u6700\u65b0\u6d3b\u52a8",
  operatorNotesTitle: "\u64cd\u4f5c\u63d0\u793a",
  repositoryNavigationTitle: "\u4ed3\u5e93\u5bfc\u822a",
  metricsLensTitle: "\u6307\u6807\u89c6\u89d2",
  enabledState: "\u5df2\u542f\u7528",
  disabledState: "\u5df2\u505c\u7528",
  unknownState: "\u672a\u77e5",
  policyBacked: "\u7b56\u7565\u9a71\u52a8",
  jobs: {
    panelTitle: "\u4efb\u52a1\u961f\u5217",
    description: "\u4ed3\u5e93\u64cd\u4f5c\u7684\u961f\u5217\u6df1\u5ea6\u3001\u6267\u884c\u72b6\u6001\u4e0e\u5f52\u5c5e\u4fe1\u606f\u7edf\u4e00\u653e\u5728\u540c\u4e00\u5f20\u7a33\u5b9a\u8868\u683c\u4e2d\uff0c\u4fbf\u4e8e\u5feb\u901f\u626b\u8bfb\u3002",
    emptyText: "\u5f53\u524d\u7ba1\u7406\u4f1a\u8bdd\u6ca1\u6709\u8fd4\u56de\u5f02\u6b65\u4efb\u52a1\u3002",
    columns: {
      id: "ID",
      jobType: "\u7c7b\u578b",
      status: "\u72b6\u6001",
      attempt: "\u5c1d\u8bd5\u6b21\u6570",
      owner: "\u6240\u6709\u8005",
      actor: "\u64cd\u4f5c\u4eba",
      targetSkill: "\u76ee\u6807\u6280\u80fd",
      updated: "\u66f4\u65b0\u65f6\u95f4"
    }
  },
  syncRuns: {
    panelTitle: "\u540c\u6b65\u8fd0\u884c\u65f6\u95f4\u7ebf",
    description: "\u8fd0\u884c\u5386\u53f2\u4e0e\u961f\u5217\u9875\u3001\u7b56\u7565\u9875\u9075\u5faa\u76f8\u540c\u7684\u5e03\u5c40\u5951\u7ea6\uff0c\u63d0\u5347\u4ed3\u5e93\u64cd\u4f5c\u573a\u666f\u4e0b\u7684\u626b\u8bfb\u901f\u5ea6\u3002",
    emptyText: "\u5f53\u524d\u7ba1\u7406\u4f1a\u8bdd\u6ca1\u6709\u8fd4\u56de\u4ed3\u5e93\u540c\u6b65\u8fd0\u884c\u8bb0\u5f55\u3002",
    columns: {
      id: "ID",
      trigger: "\u89e6\u53d1\u65b9\u5f0f",
      scope: "\u8303\u56f4",
      status: "\u72b6\u6001",
      candidates: "\u5019\u9009\u9879",
      synced: "\u5df2\u540c\u6b65",
      failed: "\u5931\u8d25",
      durationMs: "\u8017\u65f6\uff08\u6beb\u79d2\uff09",
      started: "\u5f00\u59cb\u65f6\u95f4"
    }
  },
  policy: {
    editorTitle: "\u7b56\u7565\u7f16\u8f91\u5668",
    editorDescription: "\u4f7f\u7528\u4e0e\u5176\u5b83\u4ed3\u5e93\u8fd0\u7ef4\u9875\u4e00\u81f4\u7684 token \u9a71\u52a8\u754c\u9762\u66f4\u65b0\u8c03\u5ea6\u5b57\u6bb5\u5e76\u6301\u4e45\u5316\u3002",
    snapshotTitle: "\u5f53\u524d\u7b56\u7565\u5feb\u7167",
    enabled: "\u542f\u7528",
    batchSize: "\u6279\u91cf\u5927\u5c0f",
    interval: "\u5468\u671f",
    timeout: "\u8d85\u65f6",
    savePolicy: "\u4fdd\u5b58\u7b56\u7565"
  },
  summaryMetrics: {
    totalJobs: "\u603b\u4efb\u52a1\u6570",
    listedRows: "\u5f53\u524d\u5217\u8868\u9879",
    running: "\u8fd0\u884c\u4e2d",
    failed: "\u5931\u8d25",
    totalSyncRuns: "\u603b\u540c\u6b65\u8fd0\u884c\u6570",
    runsWithFailures: "\u542b\u5931\u8d25\u7684\u8fd0\u884c",
    totalSyncedItems: "\u5df2\u540c\u6b65\u603b\u6570",
    schedulerState: "\u8c03\u5ea6\u5668\u72b6\u6001",
    interval: "\u5468\u671f",
    timeout: "\u8d85\u65f6",
    batchSize: "\u6279\u91cf\u5927\u5c0f"
  },
  routeMeta: {
    "/admin/jobs": {
      route: "/admin/jobs",
      navLabel: "\u4efb\u52a1\u961f\u5217",
      navHint: "\u7f16\u6392\u541e\u5410\u6001\u52bf",
      eyebrow: "\u4ed3\u5e93\u8fd0\u7ef4",
      title: "\u5f02\u6b65\u4efb\u52a1",
      subtitle: "\u5728\u7edf\u4e00\u7684\u7ba1\u7406\u89c6\u56fe\u4e2d\u67e5\u770b\u961f\u5217\u5065\u5eb7\u3001\u6267\u884c\u538b\u529b\u4e0e\u6700\u8fd1\u7684\u7f16\u6392\u53d8\u5316\u3002",
      endpoint: "GET /api/v1/admin/jobs"
    },
    "/admin/sync-jobs": {
      route: "/admin/sync-jobs",
      navLabel: "\u540c\u6b65\u8fd0\u884c",
      navHint: "\u4ed3\u5e93\u8fd0\u884c\u53f0\u8d26",
      eyebrow: "\u4ed3\u5e93\u8fd0\u7ef4",
      title: "\u4ed3\u5e93\u540c\u6b65\u8fd0\u884c",
      subtitle: "\u6cbf\u7528\u4ed3\u5e93\u7ba1\u7406\u9875\u7edf\u4e00\u7684\u5bfc\u822a\u548c\u5c42\u7ea7\uff0c\u67e5\u770b\u8fd0\u884c\u91cf\u3001\u5931\u8d25\u6001\u52bf\u4e0e\u65f6\u95f4\u4fe1\u53f7\u3002",
      endpoint: "GET /api/v1/admin/sync-jobs"
    },
    "/admin/sync-policy/repository": {
      route: "/admin/sync-policy/repository",
      navLabel: "\u540c\u6b65\u7b56\u7565",
      navHint: "\u8c03\u5ea6\u63a7\u5236",
      eyebrow: "\u4ed3\u5e93\u8fd0\u7ef4",
      title: "\u4ed3\u5e93\u540c\u6b65\u7b56\u7565",
      subtitle: "\u65e0\u9700\u79bb\u5f00\u6807\u51c6\u5316\u7684\u4ed3\u5e93\u8fd0\u7ef4\u5e03\u5c40\uff0c\u5373\u53ef\u66f4\u65b0\u8c03\u5ea6\u8282\u594f\u4e0e\u6267\u884c\u62a4\u680f\u3002",
      endpoint: "GET/POST /api/v1/admin/sync-policy/repository"
    }
  },
  routeNotes: {
    "/admin/jobs": [
      "\u5728\u91cd\u8bd5\u6216\u53d6\u6d88\u4e0b\u6e38\u4efb\u52a1\u524d\uff0c\u53ef\u5148\u7528\u6b64\u89c6\u56fe\u5224\u65ad\u7f16\u6392\u538b\u529b\u3002",
      "\u7ed3\u5408\u6240\u6709\u8005\u4e0e\u64cd\u4f5c\u4eba\u6807\u8bc6\uff0c\u53ef\u8ba9\u961f\u5217\u64cd\u4f5c\u4fdd\u6301\u53ef\u5ba1\u8ba1\u3002",
      "\u5f53\u4ed3\u5e93\u6267\u884c\u5931\u8d25\u5f00\u59cb\u805a\u96c6\u65f6\uff0c\u53ef\u5207\u6362\u5230\u540c\u6b65\u8fd0\u884c\u89c6\u56fe\u7ee7\u7eed\u6392\u67e5\u3002"
    ],
    "/admin/sync-jobs": [
      "\u5c06\u5e26\u5931\u8d25\u7684\u8fd0\u884c\u4e0e\u5065\u5eb7\u541e\u5410\u5206\u5f00\u89c2\u5bdf\uff0c\u53ef\u66f4\u5feb\u53d1\u73b0\u4ed3\u5e93\u63a5\u5165\u6f02\u79fb\u3002",
      "\u6bd4\u8f83\u4e0d\u540c\u65f6\u95f4\u7a97\u53e3\u65f6\uff0c\u5e94\u7ed3\u5408\u8017\u65f6\u4e0e\u540c\u6b65\u6761\u6570\u4e00\u8d77\u5224\u65ad\u6548\u7387\u3002",
      "\u8c03\u6574\u8282\u594f\u524d\u5148\u6253\u5f00\u8c03\u5ea6\u7b56\u7565\uff0c\u786e\u4fdd\u4fee\u6539\u5177\u6709\u660e\u786e\u610f\u56fe\u3002"
    ],
    "/admin/sync-policy/repository": [
      "\u7b56\u7565\u8c03\u6574\u5e94\u5728\u6d45\u8272\u548c\u6df1\u8272\u7ba1\u7406\u754c\u9762\u4e2d\u90fd\u4fdd\u6301\u4e00\u81f4\u7684\u8fd0\u7ef4\u610f\u56fe\u3002",
      "\u8bf7\u8ba9\u5468\u671f\u3001\u8d85\u65f6\u548c\u6279\u91cf\u5927\u5c0f\u4e0e\u5f53\u524d\u4ed3\u5e93\u8d1f\u8f7d\u548c\u91cd\u8bd5\u7b56\u7565\u4fdd\u6301\u4e00\u81f4\u3002",
      "\u4fdd\u5b58\u540e\u5237\u65b0\u786e\u8ba4\u540e\u7aef\u72b6\u6001\uff0c\u4e0d\u8981\u53ea\u4f9d\u8d56\u672c\u5730\u8868\u5355\u503c\u3002"
    ]
  },
  statusLabels: {
    unknown: "\u672a\u77e5",
    failed: "\u5931\u8d25",
    error: "\u9519\u8bef",
    canceled: "\u5df2\u53d6\u6d88",
    cancelled: "\u5df2\u53d6\u6d88",
    partial: "\u90e8\u5206\u5931\u8d25",
    warning: "\u8b66\u544a",
    running: "\u8fd0\u884c\u4e2d",
    in_progress: "\u8fdb\u884c\u4e2d",
    processing: "\u5904\u7406\u4e2d",
    pending: "\u7b49\u5f85\u4e2d",
    queued: "\u6392\u961f\u4e2d",
    waiting: "\u7b49\u5f85\u4e2d",
    enabled: "\u5df2\u542f\u7528",
    active: "\u6d3b\u8dc3",
    success: "\u6210\u529f",
    succeeded: "\u5df2\u6210\u529f",
    completed: "\u5df2\u5b8c\u6210",
    done: "\u5b8c\u6210",
    disabled: "\u5df2\u505c\u7528"
  },
  triggerLabels: {
    manual: "\u624b\u52a8",
    schedule: "\u8ba1\u5212",
    scheduled: "\u8ba1\u5212",
    unknown: "\u672a\u77e5"
  }
};

export function getAdminRepositoryCatalogCopy(locale: AppLocale): AdminRepositoryCatalogCopy {
  return locale === "zh" ? zhCopy : enCopy;
}
