import { describe, expect, it } from "vitest";

import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountSecurityRoute,
  accountRoutePrefix,
  adminAccountManagementSurfaceRoutes,
  adminAccountsNewRoute,
  adminAccountsRoute,
  adminAccessRoute,
  adminAlertsRoute,
  adminAPIKeysRoute,
  adminAdministrationModuleMatchPrefixes,
  adminAuditExportRoute,
  adminAuditRoute,
  adminBackupPlansRoute,
  adminBackupRunsRoute,
  adminCatalogSurfaceRoutes,
  adminChangeApprovalsRoute,
  adminIntegrationsRoute,
  adminImportsRoute,
  adminIngestionSurfaceRoutes,
  adminMetricsRoute,
  adminModerationRoute,
  adminOrganizationManagementSurfaceRoutes,
  adminOperationsDashboardSurfaceRoutes,
  adminOperationsRecordSurfaceRoutes,
  adminOrganizationsRoute,
  adminRecoveryDrillsRoute,
  adminReleasesRoute,
  adminRolesNewRoute,
  adminRolesRoute,
  adminRoutePrefix,
  adminSkillManagementSurfaceRoutes,
  adminSyncJobsRoute,
  adminSyncPolicyRoute,
  adminManualIntakeRoute,
  adminRepositoryIntakeRoute,
  adminReleaseGatesRoute,
  adminSkillsRoute,
  adminJobsRoute,
  isAdminAccountManagementSurfaceRoute,
  isAdminCatalogSurfaceRoute,
  isAdminIngestionSurfaceRoute,
  isAdminOperationsDashboardSurfaceRoute,
  isAdminOperationsRecordSurfaceRoute,
  isAccountSurfacePath,
  isAdminSurfacePath,
  isProtectedSurfacePath,
  isWorkspaceSurfacePath,
  protectedDashboardRoute,
  protectedRoutePrefixes,
  workspaceRoutePrefix
} from "@/src/lib/routing/protectedSurfaceLinks";

describe("protected surface links", () => {
  it("keeps protected prefixes centralized in one routing contract", () => {
    expect(protectedRoutePrefixes).toEqual([workspaceRoutePrefix, adminRoutePrefix, accountRoutePrefix]);
  });

  it("exposes grouped admin route contracts for feature-level consumers", () => {
    expect(adminCatalogSurfaceRoutes).toEqual([adminSkillsRoute, adminJobsRoute, adminSyncJobsRoute, adminSyncPolicyRoute]);
    expect(adminIngestionSurfaceRoutes).toEqual([adminManualIntakeRoute, adminRepositoryIntakeRoute, adminImportsRoute]);
    expect(adminSkillManagementSurfaceRoutes).toEqual([...adminIngestionSurfaceRoutes, ...adminCatalogSurfaceRoutes]);
    expect(adminOperationsDashboardSurfaceRoutes).toEqual([adminMetricsRoute, adminAlertsRoute, adminReleaseGatesRoute]);
    expect(adminOperationsRecordSurfaceRoutes).toEqual([
      adminAuditRoute,
      adminAuditExportRoute,
      adminRecoveryDrillsRoute,
      adminReleasesRoute,
      adminChangeApprovalsRoute,
      adminBackupPlansRoute,
      adminBackupRunsRoute
    ]);
    expect(adminAccountManagementSurfaceRoutes).toEqual([
      adminAccountsRoute,
      adminAccountsNewRoute,
      adminRolesRoute,
      adminRolesNewRoute
    ]);
    expect(adminOrganizationManagementSurfaceRoutes).toEqual([
      ...adminAccountManagementSurfaceRoutes,
      adminOrganizationsRoute,
      adminAccessRoute
    ]);
    expect(adminAdministrationModuleMatchPrefixes).toEqual([adminRoutePrefix, adminIntegrationsRoute, adminReleaseGatesRoute]);
  });

  it("classifies protected surface paths through shared helpers", () => {
    expect(isProtectedSurfacePath(protectedDashboardRoute)).toBe(true);
    expect(isProtectedSurfacePath("/dashboard/access")).toBe(true);
    expect(isProtectedSurfacePath("/dashboard/audit")).toBe(true);
    expect(isProtectedSurfacePath("/workspace/queue")).toBe(true);
    expect(isProtectedSurfacePath(adminMetricsRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminAlertsRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminAuditRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminAuditExportRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminRecoveryDrillsRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminReleasesRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminChangeApprovalsRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminBackupPlansRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminBackupRunsRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminAPIKeysRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminModerationRoute)).toBe(true);
    expect(isProtectedSurfacePath(adminAccountsNewRoute)).toBe(true);
    expect(isProtectedSurfacePath(accountProfileRoute)).toBe(true);
    expect(isProtectedSurfacePath(accountApiCredentialsRoute)).toBe(true);
    expect(isProtectedSurfacePath("/search")).toBe(false);

    expect(isWorkspaceSurfacePath("/workspace/actions")).toBe(true);
    expect(isAdminSurfacePath("/admin/jobs")).toBe(true);
    expect(isAccountSurfacePath(accountSecurityRoute)).toBe(true);
    expect(isAdminCatalogSurfaceRoute(adminSyncPolicyRoute)).toBe(true);
    expect(isAdminCatalogSurfaceRoute(adminManualIntakeRoute)).toBe(false);
    expect(isAdminIngestionSurfaceRoute(adminRepositoryIntakeRoute)).toBe(true);
    expect(isAdminIngestionSurfaceRoute(adminSkillsRoute)).toBe(false);
    expect(isAdminOperationsDashboardSurfaceRoute(adminReleaseGatesRoute)).toBe(true);
    expect(isAdminOperationsDashboardSurfaceRoute(adminRecoveryDrillsRoute)).toBe(false);
    expect(isAdminOperationsRecordSurfaceRoute(adminRecoveryDrillsRoute)).toBe(true);
    expect(isAdminOperationsRecordSurfaceRoute(adminMetricsRoute)).toBe(false);
    expect(isAdminAccountManagementSurfaceRoute(adminRolesNewRoute)).toBe(true);
    expect(isAdminAccountManagementSurfaceRoute(adminAuditRoute)).toBe(false);
  });
});
