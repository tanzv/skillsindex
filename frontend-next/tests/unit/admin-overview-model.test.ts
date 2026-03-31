import { describe, expect, it } from "vitest";

import {
  buildAdminOverviewCapabilityItems,
  buildAdminOverviewDistribution,
  buildAdminOverviewMetrics,
  buildAdminOverviewQuickLinks,
  normalizeAdminOverviewPayload
} from "@/src/features/adminOverview/model";
import {
  adminAccessRoute,
  adminMetricsRoute,
  adminRepositoryIntakeRoute,
  adminSkillsRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const overviewMessages = createProtectedPageTestMessages({
  adminOverview: {
    metricTotalSkillsLabel: "Total Skills",
    metricTotalSkillsDescription: "Total governed skills",
    metricOrganizationsLabel: "Organizations",
    metricOrganizationsDescription: "Organizations with governed skills",
    metricAccountsLabel: "Accounts",
    metricAccountsDescription: "Accounts in admin scope",
    metricManageUsersLabel: "Manage Users",
    metricManageUsersDescription: "Capability to manage users",
    capabilityManageUsersLabel: "Manage Users Capability",
    capabilityViewAllSkillsLabel: "View All Skills Capability",
    capabilityPrivateCoverageLabel: "Private Coverage",
    capabilitySyncReadyLabel: "Sync Ready",
    distributionPublicSkillsLabel: "Public Skills",
    distributionPrivateSkillsLabel: "Private Skills",
    distributionSyncableSkillsLabel: "Syncable Skills",
    quickLinkSkillGovernanceLabel: "Skill Governance",
    quickLinkSkillGovernanceDescription: "Open skill governance",
    quickLinkRepositoryIntakeLabel: "Repository Intake",
    quickLinkRepositoryIntakeDescription: "Open repository intake",
    quickLinkAccessControlLabel: "Access Control",
    quickLinkAccessControlDescription: "Open access control",
    quickLinkOperationsLabel: "Operations",
    quickLinkOperationsDescription: "Open operations",
    valueEnabled: "Enabled",
    valueLimited: "Limited",
    valueUnavailable: "Unavailable",
    valueScoped: "Scoped"
  }
}).adminOverview;

describe("admin overview model", () => {
  it("normalizes counts and capability flags", () => {
    const snapshot = normalizeAdminOverviewPayload({
      counts: {
        total: 120,
        public: 48,
        private: 72,
        syncable: 33,
        org_count: 9,
        account_count: 64
      },
      capabilities: {
        can_manage_users: true,
        can_view_all: false
      }
    });

    expect(snapshot).toEqual({
      totalSkills: 120,
      publicSkills: 48,
      privateSkills: 72,
      syncableSkills: 33,
      organizationCount: 9,
      accountCount: 64,
      canManageUsers: true,
      canViewAllSkills: false
    });
  });

  it("builds overview metrics from normalized snapshot", () => {
    const metrics = buildAdminOverviewMetrics({
      totalSkills: 120,
      publicSkills: 48,
      privateSkills: 72,
      syncableSkills: 33,
      organizationCount: 9,
      accountCount: 64,
      canManageUsers: true,
      canViewAllSkills: false
    }, overviewMessages);

    expect(metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Total Skills", value: "120" }),
        expect.objectContaining({ label: "Organizations", value: "9" }),
        expect.objectContaining({ label: "Manage Users", value: "Enabled" })
      ])
    );
  });

  it("builds capability, distribution, and quick link sections", () => {
    const snapshot = {
      totalSkills: 120,
      publicSkills: 48,
      privateSkills: 72,
      syncableSkills: 33,
      organizationCount: 9,
      accountCount: 64,
      canManageUsers: false,
      canViewAllSkills: true
    };

    const capabilities = buildAdminOverviewCapabilityItems(snapshot, overviewMessages);
    const distribution = buildAdminOverviewDistribution(snapshot, overviewMessages);
    const quickLinks = buildAdminOverviewQuickLinks(overviewMessages);

    expect(capabilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Manage Users Capability", value: "Unavailable" }),
        expect.objectContaining({ label: "View All Skills Capability", value: "Enabled" })
      ])
    );
    expect(distribution).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Public Skills", value: "48", percent: 40 }),
        expect.objectContaining({ label: "Private Skills", value: "72", percent: 60 })
      ])
    );
    expect(quickLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: adminSkillsRoute, label: "Skill Governance" }),
        expect.objectContaining({ href: adminRepositoryIntakeRoute, label: "Repository Intake" }),
        expect.objectContaining({ href: adminAccessRoute, label: "Access Control" }),
        expect.objectContaining({ href: adminMetricsRoute, label: "Operations" })
      ])
    );
  });
});
