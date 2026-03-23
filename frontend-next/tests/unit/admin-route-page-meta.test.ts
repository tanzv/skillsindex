import { describe, expect, it } from "vitest";

import { adminNavigationMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import {
  buildAdminDataPageRouteMetaMap,
  resolveAdminAccountsPageRouteMeta,
  resolveAdminCatalogPageRouteMeta,
  resolveAdminIngestionPageRouteMeta,
  resolveAdminOperationsDashboardRouteMeta,
  resolveAdminOperationsRecordsRouteMeta
} from "@/src/lib/routing/adminRoutePageMeta";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const pageMessages = createProtectedPageTestMessages({
  adminCatalog: {
    routeSkillsTitle: "Skill Governance",
    routeSkillsDescription: "Catalog description",
    routeJobsTitle: "Jobs",
    routeJobsDescription: "Jobs description",
    routeSyncJobsTitle: "Sync Jobs",
    routeSyncJobsDescription: "Sync jobs description",
    routePolicyTitle: "Policy",
    routePolicyDescription: "Policy description"
  },
  adminIngestion: {
    routeManualTitle: "Manual Intake",
    routeManualDescription: "Manual intake description",
    routeRepositoryTitle: "Repository Intake",
    routeRepositoryDescription: "Repository intake description",
    routeImportsTitle: "Imports",
    routeImportsDescription: "Imports description"
  },
  adminOperations: {
    routeMetricsTitle: "Metrics",
    routeMetricsDescription: "Metrics description",
    routeAlertsTitle: "Alerts",
    routeAlertsDescription: "Alerts description",
    routeReleaseGatesTitle: "Release Gates",
    routeReleaseGatesDescription: "Release gates description",
    routeAuditExportTitle: "Audit Export",
    routeAuditExportDescription: "Audit export description",
    routeRecoveryDrillsTitle: "Recovery Drills",
    routeRecoveryDrillsDescription: "Recovery drills description",
    routeReleasesTitle: "Releases",
    routeReleasesDescription: "Releases description",
    routeChangeApprovalsTitle: "Change Approvals",
    routeChangeApprovalsDescription: "Change approvals description",
    routeBackupPlansTitle: "Backup Plans",
    routeBackupPlansDescription: "Backup plans description",
    routeBackupRunsTitle: "Backup Runs",
    routeBackupRunsDescription: "Backup runs description"
  },
  adminAccounts: {
    routeAccountsTitle: "Accounts",
    routeAccountsDescription: "Accounts description",
    routeProvisioningTitle: "Provisioning",
    routeProvisioningDescription: "Provisioning description",
    routeRolesTitle: "Roles",
    routeRolesDescription: "Roles description",
    routeRoleConfigurationTitle: "Role Configuration",
    routeRoleConfigurationDescription: "Role configuration description"
  }
});

describe("admin route page meta", () => {
  it("resolves ingestion route copy from centralized routing adapter", () => {
    expect(resolveAdminIngestionPageRouteMeta("/admin/ingestion/repository", pageMessages.adminIngestion)).toEqual({
      title: "Repository Intake",
      description: "Repository intake description"
    });
  });

  it("resolves catalog route copy and endpoint from centralized routing adapter", () => {
    expect(resolveAdminCatalogPageRouteMeta("/admin/jobs", pageMessages.adminCatalog)).toEqual({
      title: "Jobs",
      description: "Jobs description",
      endpoint: "/api/bff/admin/jobs"
    });
  });

  it("resolves operations dashboard actions from centralized routing adapter", () => {
    expect(resolveAdminOperationsDashboardRouteMeta("/admin/ops/release-gates", pageMessages.adminOperations)).toEqual({
      title: "Release Gates",
      description: "Release gates description",
      endpoint: "/api/bff/admin/ops/release-gates",
      runEndpoint: "/api/bff/admin/ops/release-gates/run"
    });
  });

  it("resolves operations records actions from centralized routing adapter", () => {
    expect(resolveAdminOperationsRecordsRouteMeta("/admin/ops/backup/plans", pageMessages.adminOperations)).toEqual({
      title: "Backup Plans",
      description: "Backup plans description",
      endpoint: "/api/bff/admin/ops/backup/plans",
      createEndpoint: "/api/bff/admin/ops/backup/plans"
    });
  });

  it("resolves admin accounts route copy from centralized routing adapter", () => {
    expect(resolveAdminAccountsPageRouteMeta("/admin/roles/new", pageMessages.adminAccounts)).toEqual({
      title: "Role Configuration",
      description: "Role configuration description"
    });
  });

  it("builds fallback admin data-page meta from centralized route descriptors", () => {
    expect(buildAdminDataPageRouteMetaMap(adminNavigationMessageFallbacks)["/admin/jobs"]).toEqual({
      title: adminNavigationMessageFallbacks.itemJobsLabel,
      description: adminNavigationMessageFallbacks.itemJobsDescription,
      endpoint: "/api/v1/admin/jobs"
    });
  });
});
