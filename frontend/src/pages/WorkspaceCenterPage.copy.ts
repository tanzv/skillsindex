import { AppLocale } from "../lib/i18n";

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
  navRollout: string;
  navGovernance: string;
  openMarketplace: string;
  openCompare: string;
  signIn: string;
  openDashboard: string;
  sidebarMenuTitle: string;
  sidebarMenuHint: string;
  sidebarSectionsTitle: string;
  sidebarHubsTitle: string;
  sidebarOverview: string;
  sidebarActivity: string;
  sidebarQueue: string;
  sidebarPolicy: string;
  sidebarRunbook: string;
  sidebarQuickActions: string;
  sidebarRollout: string;
  sidebarGovernance: string;
  sidebarRecords: string;
  installed: string;
  runsToday: string;
  healthScore: string;
  alerts: string;
  activityFeed: string;
  queuePanel: string;
  runbook: string;
  policySummary: string;
  quickActions: string;
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
}

const baseCopy: WorkspaceCenterCopy = {
  title: "Team Workspace",
  subtitle: "Coordinate queue operations, policy checks, and rollout actions from one command center.",
  brandSubtitle: "Operations Hub",
  loading: "Loading workspace",
  requestFailed: "Request failed",
  degradedData: "Live request failed. The workspace is currently using fallback data.",
  navWorkspace: "Workspace",
  navCategories: "Categories",
  navRankings: "Rankings",
  navRollout: "Rollout",
  navGovernance: "Governance",
  openMarketplace: "Open Marketplace",
  openCompare: "Open Compare",
  signIn: "Sign In",
  openDashboard: "Open Dashboard",
  sidebarMenuTitle: "Workspace Menu",
  sidebarMenuHint: "Jump between core workspace panels and linked hubs.",
  sidebarSectionsTitle: "Workspace Sections",
  sidebarHubsTitle: "Related Hubs",
  sidebarOverview: "Overview",
  sidebarActivity: "Activity Feed",
  sidebarQueue: "Queue Execution",
  sidebarPolicy: "Policy Summary",
  sidebarRunbook: "Runbook Preview",
  sidebarQuickActions: "Quick Actions",
  sidebarRollout: "Rollout Workflow",
  sidebarGovernance: "Governance Center",
  sidebarRecords: "Records Sync",
  installed: "Installed Skills",
  runsToday: "Automation Runs",
  healthScore: "Health Score",
  alerts: "Alerts",
  activityFeed: "Team Activity Feed",
  queuePanel: "Queue State and Execution",
  runbook: "Action Script Preview",
  policySummary: "Policy Summary",
  quickActions: "Quick Actions",
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
  topTags: "Top Tags"
};

export function getWorkspaceCenterCopy(locale: AppLocale): WorkspaceCenterCopy {
  if (locale === "zh") {
    return baseCopy;
  }
  return baseCopy;
}
