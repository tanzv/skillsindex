export type {
  AccountShellMessages,
  AdminNavigationMessages,
  AdminRouteMessages,
  AdminShellMessages,
  ProtectedMessages,
  ProtectedTopbarMessages,
  WorkspaceShellMessages
} from "./protectedMessages.types";
export { protectedMessageKeyMap } from "./protectedMessages.keys";
import type { AdminNavigationMessages, ProtectedTopbarMessages } from "./protectedMessages.types";

export const protectedTopbarMessageFallbacks = {
  navigationAriaLabelAdmin: "Admin top navigation",
  navigationAriaLabelWorkspace: "Workspace top navigation",
  navigationAriaLabelAccount: "Account top navigation",
  overflowControlsAriaLabel: "Protected navigation overflow controls",
  overflowPanelAriaLabel: "Expanded protected navigation panel",
  expandNavigationPanel: "Expand protected navigation panel",
  collapseNavigationPanel: "Collapse protected navigation panel",
  moreLabel: "More",
  hideLabel: "Hide",
  marketplacePublic: "Marketplace Public",
  marketplaceRestricted: "Marketplace Restricted",
  marketplaceLinkLabel: "Marketplace",
  openAccountCenterAriaLabel: "Open account center",
  closeAccountCenterAriaLabel: "Close account center",
  accountMenuNavigationTitle: "Account",
  accountMenuPreferencesTitle: "Preferences",
  accountMenuProfileLabel: "Profile",
  accountMenuSecurityLabel: "Security",
  accountMenuSessionsLabel: "Sessions",
  accountMenuApiCredentialsLabel: "API Credentials",
  accountMenuLocaleLabel: "Language",
  accountMenuThemeLabel: "Theme",
  accountMenuLocaleZhLabel: "中文",
  accountMenuLocaleEnLabel: "English",
  accountMenuThemeLightLabel: "Light",
  accountMenuThemeDarkLabel: "Dark",
  accountMenuLogoutLabel: "Sign Out",
  guestUser: "Guest User",
  guestRole: "guest",
  visitorStatus: "visitor",
  publicChip: "public",
  restrictedChip: "restricted",
  overflowVisibleMetricLabel: "Visible",
  overflowHiddenMetricLabel: "Hidden",
  quickCategoriesLabel: "Categories",
  quickCategoriesDescription: "Browse the original market taxonomy and entry points.",
  quickTopLabel: "Top",
  quickTopDescription: "Open the ranking and leaderboard route from the marketplace shell.",
  quickGovernanceLabel: "Governance",
  quickGovernanceDescription: "Inspect public governance guidance and policy posture.",
  quickDocsLabel: "Docs",
  quickDocsDescription: "Open shared documentation and migration references.",
  overflowGroupCountAriaLabelTemplate: "{count} actions",
  sessionRoleAdmin: "admin",
  sessionRoleOwner: "owner",
  sessionRoleMember: "member",
  sessionRoleViewer: "viewer",
  sessionRoleGuest: "guest",
  sessionRoleUnknown: "unknown",
  sessionStatusActive: "active",
  sessionStatusInactive: "inactive",
  sessionStatusDisabled: "disabled",
  sessionStatusVisitor: "visitor",
  sessionStatusUnknown: "unknown"
} as const satisfies ProtectedTopbarMessages;

export const adminNavigationMessageFallbacks = {
  topbarPrimaryGroupLabel: "Protected Workbench",
  topbarPrimaryGroupTag: "Workbench",
  topbarQuickGroupLabel: "Related Hubs",
  topbarQuickGroupTag: "Hubs",
  groupOverviewLabel: "Overview",
  groupCatalogLabel: "Catalog",
  groupOperationsLabel: "Operations",
  groupUsersLabel: "Users",
  groupSecurityLabel: "Security",
  moduleAdministrationLabel: "Administration",
  moduleAdministrationDescription: "Open governance, operations, system access, and security controls.",
  hubWorkspaceLabel: "Workspace",
  hubWorkspaceDescription: "Open the operator workspace command deck.",
  hubAccountLabel: "Account",
  hubAccountDescription: "Open profile, security, sessions, and API credentials.",
  itemOverviewLabel: "Overview",
  itemOverviewDescription: "Dashboard summary",
  itemManualIntakeLabel: "Manual Intake",
  itemManualIntakeDescription: "Create or review manually curated intake records.",
  itemRepositoryIntakeLabel: "Repository Intake",
  itemRepositoryIntakeDescription: "Manage repository-backed ingestion flows and policy.",
  itemImportsLabel: "Imports",
  itemImportsDescription: "Inspect import history and replay outcomes.",
  itemSkillsLabel: "Skills",
  itemSkillsDescription: "Review governed skill inventory and metadata.",
  itemJobsLabel: "Jobs",
  itemJobsDescription: "Inspect async job backlog and execution state.",
  itemSyncJobsLabel: "Sync Jobs",
  itemSyncJobsDescription: "Review synchronization run history and evidence.",
  itemSyncPolicyLabel: "Sync Policy",
  itemSyncPolicyDescription: "Manage repository sync schedule and safeguards.",
  itemOpsMetricsLabel: "Ops Metrics",
  itemOpsMetricsDescription: "Reliability baseline and active operational posture.",
  itemIntegrationsLabel: "Integrations",
  itemIntegrationsDescription: "Review connector inventory and webhook delivery coverage.",
  itemOpsAlertsLabel: "Ops Alerts",
  itemOpsAlertsDescription: "Inspect active operational alerts and responder status.",
  itemAuditExportLabel: "Audit Export",
  itemAuditExportDescription: "Export operational evidence and audit-ready records.",
  itemReleaseGatesLabel: "Release Gates",
  itemReleaseGatesDescription: "Review release readiness checks and approval blockers.",
  itemRecoveryDrillsLabel: "Recovery Drills",
  itemRecoveryDrillsDescription: "Track rehearsal runs and recovery readiness evidence.",
  itemReleasesLabel: "Releases",
  itemReleasesDescription: "Inspect release execution history and rollout posture.",
  itemChangeApprovalsLabel: "Change Approvals",
  itemChangeApprovalsDescription: "Review decision records for governed changes.",
  itemBackupPlansLabel: "Backup Plans",
  itemBackupPlansDescription: "Manage backup strategy and readiness controls.",
  itemBackupRunsLabel: "Backup Runs",
  itemBackupRunsDescription: "Review backup execution evidence and anomalies.",
  itemAccountsLabel: "Accounts",
  itemAccountsDescription: "Review account roster, lifecycle, and ownership.",
  itemRolesLabel: "Roles",
  itemRolesDescription: "Manage roles and permission bundles.",
  itemAccessLabel: "Access",
  itemAccessDescription: "Control access pathways and enrollment rules.",
  itemOrganizationsLabel: "Organizations",
  itemOrganizationsDescription: "Maintain organization structure and tenant mapping.",
  itemApiKeysLabel: "API Keys",
  itemApiKeysDescription: "Govern scoped API credentials and issuance policy.",
  itemModerationLabel: "Moderation",
  itemModerationDescription: "Handle risk review queues and moderation outcomes.",
  topbarOverflowTitle: "Protected Menu",
  topbarOverflowHint: "Continue across protected modules without leaving the shell.",
  topbarOverflowPrimaryTitle: "Protected Modules",
  topbarOverflowMarketplaceTitle: "Marketplace",
  topbarOverflowRelatedTitle: "Related Hubs"
} as const satisfies AdminNavigationMessages;

export function formatProtectedSessionRole(value: string | null | undefined, messages: ProtectedTopbarMessages) {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "admin":
      return messages.sessionRoleAdmin;
    case "owner":
      return messages.sessionRoleOwner;
    case "viewer":
      return messages.sessionRoleViewer;
    case "member":
      return messages.sessionRoleMember;
    case "guest":
      return messages.sessionRoleGuest;
    default:
      return messages.sessionRoleUnknown;
  }
}

export function formatProtectedSessionStatus(value: string | null | undefined, messages: ProtectedTopbarMessages) {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "active":
      return messages.sessionStatusActive;
    case "inactive":
      return messages.sessionStatusInactive;
    case "disabled":
      return messages.sessionStatusDisabled;
    case "visitor":
      return messages.sessionStatusVisitor;
    case "unknown":
      return messages.sessionStatusUnknown;
    default:
      return messages.sessionStatusUnknown;
  }
}

export function formatProtectedMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}
