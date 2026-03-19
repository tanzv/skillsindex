import { describe, expect, it } from "vitest";

import {
  buildAccountCenterMenuConfig,
  buildAdminAccountCenterMenuConfig
} from "@/src/components/shared/protectedTopbarConfigs";
import { protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
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
  });
});
