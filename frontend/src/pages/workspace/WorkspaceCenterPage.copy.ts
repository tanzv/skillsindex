import { AppLocale } from "../../lib/i18n";

export interface WorkspaceCenterCopy {
  title: string;
  subtitle: string;
  brandSubtitle: string;
  loading: string;
  requestFailed: string;
  degradedData: string;
  navWorkspace: string;
  navCategories: string;
  navRankings: string;
  navTop: string;
  navRollout: string;
  navGovernance: string;
  openMarketplace: string;
  openCompare: string;
  signIn: string;
  openDashboard: string;
  sidebarMenuTitle: string;
  sidebarMenuHint: string;
  sidebarSectionsTitle: string;
  sidebarCoreTitle: string;
  sidebarExecutionTitle: string;
  sidebarPolicyActionsTitle: string;
  sidebarHubsTitle: string;
  sidebarOrganizationTitle: string;
  sidebarOverview: string;
  sidebarActivity: string;
  sidebarQueue: string;
  sidebarPolicy: string;
  sidebarRunbook: string;
  sidebarQuickActions: string;
  sidebarRollout: string;
  sidebarGovernance: string;
  sidebarRecords: string;
  sidebarPersonnelManagement: string;
  sidebarPermissionManagement: string;
  sidebarRoleManagement: string;
  installed: string;
  runsToday: string;
  healthScore: string;
  alerts: string;
  activityFeed: string;
  activityHint: string;
  activityHighlights: string;
  ownerCoverage: string;
  queuePanel: string;
  queueInsights: string;
  executionSpotlight: string;
  runbook: string;
  riskWatchlist: string;
  riskWatchlistHint: string;
  responseCommandPreview: string;
  responseChecklist: string;
  policySummary: string;
  policyHint: string;
  governancePriorities: string;
  reviewPressure: string;
  quickActions: string;
  marketplaceActions: string;
  controlCenterActions: string;
  linkedHubActions: string;
  queueAll: string;
  queuePending: string;
  queueRunning: string;
  queueRisk: string;
  emptyQueue: string;
  openDetail: string;
  openDocs: string;
  openSkills: string;
  openAudit: string;
  openRecords: string;
  openRollout: string;
  copyScript: string;
  copySuccess: string;
  copyFailed: string;
  openQueueCompare: string;
  openQueueRollout: string;
  queueOwner: string;
  queueUpdated: string;
  queueTagNone: string;
  queueSelectHint: string;
  queueStatus: string;
  topTags: string;
  qualityScoreShort: string;
  noRiskItems: string;
  riskRatio: string;
  executionCoverage: string;
  itemsLabel: string;
}

const enCopy: WorkspaceCenterCopy = {
  title: "Team Workspace",
  subtitle: "Coordinate queue operations, policy checks, and rollout actions from one command center.",
  brandSubtitle: "Operations Hub",
  loading: "Loading workspace",
  requestFailed: "Request failed",
  degradedData: "Live request failed. The workspace is currently using fallback data.",
  navWorkspace: "Workspace",
  navCategories: "Categories",
  navRankings: "Rankings",
  navTop: "TOP",
  navRollout: "Rollout",
  navGovernance: "Governance",
  openMarketplace: "Open Marketplace",
  openCompare: "Open Compare",
  signIn: "Sign In",
  openDashboard: "Open Dashboard",
  sidebarMenuTitle: "Workspace Navigation",
  sidebarMenuHint: "Switch quickly between workspace modules and task views.",
  sidebarSectionsTitle: "Workspace Sections",
  sidebarCoreTitle: "Core Workspace",
  sidebarExecutionTitle: "Execution Center",
  sidebarPolicyActionsTitle: "Policy and Actions",
  sidebarHubsTitle: "Related Hubs",
  sidebarOrganizationTitle: "Organization Management",
  sidebarOverview: "Overview",
  sidebarActivity: "Activity Feed",
  sidebarQueue: "Queue Execution",
  sidebarPolicy: "Policy Summary",
  sidebarRunbook: "Runbook Preview",
  sidebarQuickActions: "Quick Actions",
  sidebarRollout: "Rollout Workflow",
  sidebarGovernance: "Governance Center",
  sidebarRecords: "Records Sync",
  sidebarPersonnelManagement: "Personnel Management",
  sidebarPermissionManagement: "Permission Management",
  sidebarRoleManagement: "Role Management",
  installed: "Installed Skills",
  runsToday: "Automation Runs",
  healthScore: "Health Score",
  alerts: "Alerts",
  activityFeed: "Team Activity Feed",
  activityHint: "Latest skills and automation activity snapshots.",
  activityHighlights: "Activity Highlights",
  ownerCoverage: "Owner Coverage",
  queuePanel: "Queue State and Execution",
  queueInsights: "Queue Insights",
  executionSpotlight: "Execution Spotlight",
  runbook: "Action Script Preview",
  riskWatchlist: "Risk Watchlist",
  riskWatchlistHint: "Entries under quality threshold that require review.",
  responseCommandPreview: "Response Command Preview",
  responseChecklist: "Response Checklist",
  policySummary: "Policy Summary",
  policyHint: "Track governance priorities, review pressure, and policy coverage across the workspace.",
  governancePriorities: "Governance Priorities",
  reviewPressure: "Review Pressure",
  quickActions: "Quick Actions",
  marketplaceActions: "Marketplace Actions",
  controlCenterActions: "Control Center Actions",
  linkedHubActions: "Linked Hub Actions",
  queueAll: "All",
  queuePending: "Pending",
  queueRunning: "Running",
  queueRisk: "Risk",
  emptyQueue: "No queue entries under this filter.",
  openDetail: "Open Detail",
  openDocs: "Open Docs",
  openSkills: "Open Skills",
  openAudit: "Open Audit",
  openRecords: "Open Records",
  openRollout: "Open Rollout",
  copyScript: "Copy Script",
  copySuccess: "Script copied to clipboard",
  copyFailed: "Unable to copy script",
  openQueueCompare: "Open Compare Center",
  openQueueRollout: "Open Rollout Queue",
  queueOwner: "Owner",
  queueUpdated: "Updated",
  queueTagNone: "untagged",
  queueSelectHint: "Select one entry to inspect command preview",
  queueStatus: "Status",
  topTags: "Top Tags",
  qualityScoreShort: "QS",
  noRiskItems: "No risk entries detected.",
  riskRatio: "Risk ratio",
  executionCoverage: "Execution coverage",
  itemsLabel: "items"
};

const zhCopy: WorkspaceCenterCopy = {
  ...enCopy,
  title: "\u56e2\u961f\u5de5\u4f5c\u53f0",
  subtitle: "\u5728\u4e00\u4e2a\u6307\u6325\u4e2d\u5fc3\u534f\u8c03\u961f\u5217\u6267\u884c\u3001\u7b56\u7565\u68c0\u67e5\u4e0e\u53d1\u5e03\u52a8\u4f5c\u3002",
  brandSubtitle: "\u8fd0\u8425\u4e2d\u67a2",
  loading: "\u6b63\u5728\u52a0\u8f7d\u5de5\u4f5c\u53f0",
  requestFailed: "\u8bf7\u6c42\u5931\u8d25",
  degradedData: "\u5b9e\u65f6\u8bf7\u6c42\u5931\u8d25\uff0c\u5f53\u524d\u663e\u793a\u56de\u9000\u6570\u636e\u3002",
  navWorkspace: "\u5de5\u4f5c\u53f0",
  navCategories: "\u5206\u7c7b",
  navRankings: "\u6392\u884c",
  navTop: "TOP",
  navRollout: "\u53d1\u5e03",
  navGovernance: "\u6cbb\u7406",
  openMarketplace: "\u6253\u5f00\u5e02\u573a",
  openCompare: "\u6253\u5f00\u5bf9\u6bd4",
  signIn: "\u767b\u5f55",
  openDashboard: "\u6253\u5f00\u770b\u677f",
  sidebarMenuTitle: "\u5de5\u4f5c\u533a\u5bfc\u822a",
  sidebarMenuHint: "\u5728\u5de5\u4f5c\u533a\u6a21\u5757\u4e0e\u4efb\u52a1\u89c6\u56fe\u4e4b\u95f4\u5feb\u901f\u5207\u6362\u3002",
  sidebarSectionsTitle: "\u5de5\u4f5c\u53f0\u5206\u533a",
  sidebarCoreTitle: "\u6838\u5fc3\u5de5\u4f5c\u53f0",
  sidebarExecutionTitle: "\u6267\u884c\u4e2d\u5fc3",
  sidebarPolicyActionsTitle: "\u7b56\u7565\u4e0e\u64cd\u4f5c",
  sidebarHubsTitle: "\u5173\u8054\u4e2d\u5fc3",
  sidebarOrganizationTitle: "\u7ec4\u7ec7\u7ba1\u7406",
  sidebarOverview: "\u603b\u89c8",
  sidebarActivity: "\u6d3b\u52a8\u52a8\u6001",
  sidebarQueue: "\u961f\u5217\u6267\u884c",
  sidebarPolicy: "\u7b56\u7565\u6982\u89c8",
  sidebarRunbook: "\u8fd0\u884c\u624b\u518c\u9884\u89c8",
  sidebarQuickActions: "\u5feb\u6377\u64cd\u4f5c",
  sidebarRollout: "\u53d1\u5e03\u6d41\u7a0b",
  sidebarGovernance: "\u6cbb\u7406\u4e2d\u5fc3",
  sidebarRecords: "\u8bb0\u5f55\u540c\u6b65",
  sidebarPersonnelManagement: "\u4eba\u5458\u7ba1\u7406",
  sidebarPermissionManagement: "\u6743\u9650\u7ba1\u7406",
  sidebarRoleManagement: "\u89d2\u8272\u7ba1\u7406",
  installed: "\u5df2\u5b89\u88c5\u6280\u80fd",
  runsToday: "\u81ea\u52a8\u5316\u8fd0\u884c",
  healthScore: "\u5065\u5eb7\u5206",
  alerts: "\u544a\u8b66",
  activityFeed: "\u56e2\u961f\u6d3b\u52a8\u52a8\u6001",
  activityHint: "\u6700\u65b0\u6280\u80fd\u4e0e\u81ea\u52a8\u5316\u6d3b\u52a8\u5feb\u7167\u3002",
  activityHighlights: "\u6d3b\u52a8\u4eae\u70b9",
  ownerCoverage: "\u8d1f\u8d23\u4eba\u8986\u76d6",
  queuePanel: "\u961f\u5217\u72b6\u6001\u4e0e\u6267\u884c",
  queueInsights: "\u961f\u5217\u6d1e\u5bdf",
  executionSpotlight: "\u6267\u884c\u805a\u7126",
  runbook: "\u52a8\u4f5c\u811a\u672c\u9884\u89c8",
  riskWatchlist: "\u98ce\u9669\u89c2\u5bdf\u5217\u8868",
  riskWatchlistHint: "\u4f4e\u4e8e\u8d28\u91cf\u9608\u503c\u3001\u9700\u8981\u590d\u6838\u7684\u6761\u76ee\u3002",
  responseCommandPreview: "\u54cd\u5e94\u547d\u4ee4\u9884\u89c8",
  responseChecklist: "\u54cd\u5e94\u68c0\u67e5\u6e05\u5355",
  policySummary: "\u7b56\u7565\u6982\u89c8",
  policyHint: "\u8ddf\u8e2a\u6cbb\u7406\u4f18\u5148\u7ea7\u3001\u5ba1\u6838\u538b\u529b\u4e0e\u5de5\u4f5c\u53f0\u7b56\u7565\u8986\u76d6\u3002",
  governancePriorities: "\u6cbb\u7406\u4f18\u5148\u4e8b\u9879",
  reviewPressure: "\u5ba1\u6838\u538b\u529b",
  quickActions: "\u5feb\u6377\u64cd\u4f5c",
  marketplaceActions: "\u5e02\u573a\u64cd\u4f5c",
  controlCenterActions: "\u63a7\u5236\u4e2d\u5fc3\u64cd\u4f5c",
  linkedHubActions: "\u5173\u8054\u4e2d\u5fc3\u64cd\u4f5c",
  queueAll: "\u5168\u90e8",
  queuePending: "\u5f85\u6267\u884c",
  queueRunning: "\u6267\u884c\u4e2d",
  queueRisk: "\u98ce\u9669",
  emptyQueue: "\u8be5\u7b5b\u9009\u6761\u4ef6\u4e0b\u6682\u65e0\u961f\u5217\u6761\u76ee\u3002",
  openDetail: "\u67e5\u770b\u8be6\u60c5",
  openDocs: "\u6253\u5f00\u6587\u6863",
  openSkills: "\u6253\u5f00\u6280\u80fd",
  openAudit: "\u6253\u5f00\u5ba1\u8ba1",
  openRecords: "\u6253\u5f00\u8bb0\u5f55",
  openRollout: "\u6253\u5f00\u53d1\u5e03",
  copyScript: "\u590d\u5236\u811a\u672c",
  copySuccess: "\u811a\u672c\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f",
  copyFailed: "\u65e0\u6cd5\u590d\u5236\u811a\u672c",
  openQueueCompare: "\u6253\u5f00\u5bf9\u6bd4\u4e2d\u5fc3",
  openQueueRollout: "\u6253\u5f00\u53d1\u5e03\u961f\u5217",
  queueOwner: "\u8d1f\u8d23\u4eba",
  queueUpdated: "\u66f4\u65b0\u65f6\u95f4",
  queueTagNone: "\u672a\u6807\u8bb0",
  queueSelectHint: "\u9009\u62e9\u4e00\u6761\u8bb0\u5f55\u4ee5\u67e5\u770b\u547d\u4ee4\u9884\u89c8",
  queueStatus: "\u72b6\u6001",
  topTags: "\u70ed\u95e8\u6807\u7b7e",
  qualityScoreShort: "\u8d28\u91cf\u5206",
  noRiskItems: "\u672a\u68c0\u6d4b\u5230\u98ce\u9669\u6761\u76ee\u3002",
  riskRatio: "\u98ce\u9669\u5360\u6bd4",
  executionCoverage: "\u6267\u884c\u8986\u76d6\u7387",
  itemsLabel: "\u9879"
};

export function getWorkspaceCenterCopy(locale: AppLocale): WorkspaceCenterCopy {
  if (locale === "zh") {
    return zhCopy;
  }
  return enCopy;
}
