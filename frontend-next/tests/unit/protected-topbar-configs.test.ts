import { describe, expect, it } from "vitest";

import {
  buildAccountCenterMenuConfig,
  buildAccountProtectedTopbarConfig,
  buildAdminAccountCenterMenuConfig,
  buildAdminProtectedTopbarConfig,
  buildWorkspaceProtectedTopbarConfig
} from "@/src/components/shared/protectedTopbarConfigs";
import { protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import type { AccountShellMessages } from "@/src/lib/i18n/protectedMessages";
import { workspaceMessageFallbacks } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";

const adminNavigationMessages: AdminNavigationMessages = {
  topbarPrimaryGroupLabel: "Primary",
  topbarPrimaryGroupTag: "Primary",
  topbarQuickGroupLabel: "Quick",
  topbarQuickGroupTag: "Quick",
  groupOverviewLabel: "Overview",
  groupCatalogLabel: "Catalog",
  groupOperationsLabel: "Operations",
  groupUsersLabel: "Users",
  groupSecurityLabel: "Security",
  moduleAdministrationLabel: "Administration",
  moduleAdministrationDescription: "Administration module.",
  hubWorkspaceLabel: "Workspace",
  hubWorkspaceDescription: "Workspace hub.",
  hubAccountLabel: "Account",
  hubAccountDescription: "Account hub.",
  itemOverviewLabel: "Overview",
  itemOverviewDescription: "Overview route.",
  itemManualIntakeLabel: "Manual Intake",
  itemManualIntakeDescription: "Manual intake route.",
  itemRepositoryIntakeLabel: "Repository Intake",
  itemRepositoryIntakeDescription: "Repository route.",
  itemImportsLabel: "Imports",
  itemImportsDescription: "Import records route.",
  itemSkillsLabel: "Skills",
  itemSkillsDescription: "Skills route.",
  itemJobsLabel: "Jobs",
  itemJobsDescription: "Jobs route.",
  itemSyncJobsLabel: "Sync Jobs",
  itemSyncJobsDescription: "Sync jobs route.",
  itemSyncPolicyLabel: "Sync Policy",
  itemSyncPolicyDescription: "Sync policy route.",
  itemOpsMetricsLabel: "Metrics",
  itemOpsMetricsDescription: "Metrics route.",
  itemIntegrationsLabel: "Integrations",
  itemIntegrationsDescription: "Integrations route.",
  itemOpsAlertsLabel: "Alerts",
  itemOpsAlertsDescription: "Alerts route.",
  itemAuditExportLabel: "Audit Export",
  itemAuditExportDescription: "Audit export route.",
  itemReleaseGatesLabel: "Release Gates",
  itemReleaseGatesDescription: "Release gate route.",
  itemRecoveryDrillsLabel: "Recovery Drills",
  itemRecoveryDrillsDescription: "Recovery route.",
  itemReleasesLabel: "Releases",
  itemReleasesDescription: "Releases route.",
  itemChangeApprovalsLabel: "Change Approvals",
  itemChangeApprovalsDescription: "Change approvals route.",
  itemBackupPlansLabel: "Backup Plans",
  itemBackupPlansDescription: "Backup plans route.",
  itemBackupRunsLabel: "Backup Runs",
  itemBackupRunsDescription: "Backup runs route.",
  itemAccountsLabel: "Accounts",
  itemAccountsDescription: "Accounts route.",
  itemRolesLabel: "Roles",
  itemRolesDescription: "Roles route.",
  itemAccessLabel: "Access",
  itemAccessDescription: "Access route.",
  itemOrganizationsLabel: "Organizations",
  itemOrganizationsDescription: "Organizations route.",
  itemApiKeysLabel: "API Keys",
  itemApiKeysDescription: "API keys route.",
  itemModerationLabel: "Moderation",
  itemModerationDescription: "Moderation route.",
  topbarOverflowTitle: "Overflow",
  topbarOverflowHint: "Overflow panel.",
  topbarOverflowPrimaryTitle: "Primary",
  topbarOverflowMarketplaceTitle: "Marketplace",
  topbarOverflowRelatedTitle: "Related"
};

const accountShellMessages: AccountShellMessages = {
  brandSubtitleSuffix: "Center",
  sectionsTitle: "Account",
  currentUserTitle: "Current User",
  marketplaceAccessLine: "Marketplace access",
  marketplaceAccessPublic: "Public",
  marketplaceAccessRestricted: "Restricted",
  unknownUser: "Unknown User",
  guestRole: "guest",
  inactiveStatus: "inactive",
  navProfileLabel: "Profile",
  navProfileNote: "Manage profile information.",
  navSecurityLabel: "Security",
  navSecurityNote: "Review credentials and policies.",
  navSessionsLabel: "Sessions",
  navSessionsNote: "Inspect active sessions.",
  navApiCredentialsLabel: "API Credentials",
  navApiCredentialsNote: "Manage API credentials.",
  topbarOverflowTitle: "Account Menu",
  topbarOverflowHint: "Continue through account settings without leaving the protected shell."
};

describe("protected topbar account center configs", () => {
  it("builds the shared account center section by default", () => {
    const config = buildAccountCenterMenuConfig(protectedTopbarMessageFallbacks);

    expect(config.sections).toHaveLength(1);
    expect(config.sections[0]?.id).toBe("account-center");
    expect(config.sections[0]?.entries.map((entry) => entry.id)).toEqual([
      "account-profile",
      "account-security",
      "account-sessions",
      "account-api-credentials"
    ]);
    expect(config.sections[0]?.entries.every((entry) => entry.kind === "account")).toBe(true);
    expect(config.sections[0]?.entries.every((entry) => entry.description.length > 0)).toBe(true);
    expect(config.sections[0]?.entries[0]?.action).toBe("quick-profile");
    expect(config.sections[0]?.entries.slice(1).every((entry) => entry.action === "navigate")).toBe(true);
  });

  it("prepends admin service sections ahead of the shared account center actions", () => {
    const config = buildAdminAccountCenterMenuConfig(protectedTopbarMessageFallbacks, adminNavigationMessages);

    expect(config.sections.map((section) => section.id)).toEqual([
      "admin-identity-services",
      "admin-runtime-services",
      "account-center"
    ]);
    expect(config.sections[0]?.entries.map((entry) => entry.label)).toEqual(["Access", "Roles", "Organizations"]);
    expect(config.sections[1]?.entries.map((entry) => entry.label)).toEqual(["Integrations", "Release Gates"]);
    expect(config.sections[0]?.entries.every((entry) => entry.kind === "admin")).toBe(true);
    expect(config.sections[1]?.entries.every((entry) => entry.description.length > 0)).toBe(true);
  });

  it("keeps admin first-level navigation in the header so the sidebar can stay second-level only", () => {
    const config = buildAdminProtectedTopbarConfig(adminNavigationMessages, protectedTopbarMessageFallbacks);

    expect(config.entries.map((entry) => entry.label)).toEqual([
      "Workspace",
      "Skills",
      "Organizations",
      "Administration",
      "Account"
    ]);
  });

  it("keeps workspace topbar entries while avoiding workspace shell sidebars for other modules", () => {
    const config = buildWorkspaceProtectedTopbarConfig(
      workspaceMessageFallbacks,
      protectedTopbarMessageFallbacks,
      adminNavigationMessages
    );

    expect(config.entries.map((entry) => entry.label)).toEqual([
      "Workspace",
      "Skills",
      "Organizations",
      "Administration",
      "Account"
    ]);
    expect(config.entries.find((entry) => entry.id === "skill-management")?.matchPrefixes).toContain("/admin/skills");
  });

  it("keeps account topbar entries while deferring admin sidebar expansion", () => {
    const config = buildAccountProtectedTopbarConfig(
      adminNavigationMessages,
      accountShellMessages,
      protectedTopbarMessageFallbacks,
      workspaceMessageFallbacks
    );

    expect(config.entries.map((entry) => entry.label)).toEqual([
      "Workspace",
      "Skills",
      "Organizations",
      "Administration",
      "Account"
    ]);
    expect(config.entries.find((entry) => entry.id === "account")?.matchPrefixes).toContain("/account");
  });
});
