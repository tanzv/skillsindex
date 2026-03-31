export const marketplaceHomeRoute = "/" as const;
export const protectedDashboardRoute = "/dashboard" as const;
export const protectedDashboardRoutePrefix = "/dashboard" as const;

export const workspaceOverviewRoute = "/workspace" as const;
export const workspaceActivityRoute = "/workspace/activity" as const;
export const workspaceQueueRoute = "/workspace/queue" as const;
export const workspacePolicyRoute = "/workspace/policy" as const;
export const workspaceRunbookRoute = "/workspace/runbook" as const;
export const workspaceActionsRoute = "/workspace/actions" as const;
export const workspaceRoutePrefix = "/workspace" as const;

export const workspaceSurfaceRoutes = [
  workspaceOverviewRoute,
  workspaceActivityRoute,
  workspaceQueueRoute,
  workspacePolicyRoute,
  workspaceRunbookRoute,
  workspaceActionsRoute
] as const;

export const accountProfileRoute = "/account/profile" as const;
export const accountSecurityRoute = "/account/security" as const;
export const accountSessionsRoute = "/account/sessions" as const;
export const accountApiCredentialsRoute = "/account/api-credentials" as const;
export const accountRoutePrefix = "/account" as const;

export const accountSurfaceRoutes = [
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute,
  accountApiCredentialsRoute
] as const;

export const adminOverviewRoute = "/admin/overview" as const;
export const adminManualIntakeRoute = "/admin/ingestion/manual" as const;
export const adminRepositoryIntakeRoute = "/admin/ingestion/repository" as const;
export const adminImportsRoute = "/admin/records/imports" as const;
export const adminSkillsRoute = "/admin/skills" as const;
export const adminJobsRoute = "/admin/jobs" as const;
export const adminSyncJobsRoute = "/admin/sync-jobs" as const;
export const adminSyncPolicyRoute = "/admin/sync-policy/repository" as const;
export const adminMetricsRoute = "/admin/ops/metrics" as const;
export const adminAlertsRoute = "/admin/ops/alerts" as const;
export const adminAuditRoute = "/admin/audit" as const;
export const adminAuditExportRoute = "/admin/ops/audit-export" as const;
export const adminAccountsRoute = "/admin/accounts" as const;
export const adminAccountsNewRoute = "/admin/accounts/new" as const;
export const adminRolesNewRoute = "/admin/roles/new" as const;
export const adminAccessRoute = "/admin/access" as const;
export const adminRolesRoute = "/admin/roles" as const;
export const adminOrganizationsRoute = "/admin/organizations" as const;
export const adminIntegrationsRoute = "/admin/integrations" as const;
export const adminReleaseGatesRoute = "/admin/ops/release-gates" as const;
export const adminRecoveryDrillsRoute = "/admin/ops/recovery-drills" as const;
export const adminReleasesRoute = "/admin/ops/releases" as const;
export const adminChangeApprovalsRoute = "/admin/ops/change-approvals" as const;
export const adminBackupPlansRoute = "/admin/ops/backup/plans" as const;
export const adminBackupRunsRoute = "/admin/ops/backup/runs" as const;
export const adminAPIKeysRoute = "/admin/apikeys" as const;
export const adminModerationRoute = "/admin/moderation" as const;
export const adminRoutePrefix = "/admin" as const;

export const adminIngestionSurfaceRoutes = [
  adminManualIntakeRoute,
  adminRepositoryIntakeRoute,
  adminImportsRoute
] as const;

export const adminCatalogSurfaceRoutes = [
  adminSkillsRoute,
  adminJobsRoute,
  adminSyncJobsRoute,
  adminSyncPolicyRoute
] as const;

export const adminOperationsDashboardSurfaceRoutes = [
  adminMetricsRoute,
  adminAlertsRoute,
  adminReleaseGatesRoute
] as const;

export const adminOperationsRecordSurfaceRoutes = [
  adminAuditRoute,
  adminAuditExportRoute,
  adminRecoveryDrillsRoute,
  adminReleasesRoute,
  adminChangeApprovalsRoute,
  adminBackupPlansRoute,
  adminBackupRunsRoute
] as const;

export const adminAccountManagementSurfaceRoutes = [
  adminAccountsRoute,
  adminAccountsNewRoute,
  adminRolesRoute,
  adminRolesNewRoute
] as const;

export const adminSkillManagementSurfaceRoutes = [
  ...adminIngestionSurfaceRoutes,
  ...adminCatalogSurfaceRoutes
] as const;

export const adminOrganizationManagementSurfaceRoutes = [
  ...adminAccountManagementSurfaceRoutes,
  adminOrganizationsRoute,
  adminAccessRoute
] as const;

export const adminAdministrationModuleMatchPrefixes = [
  adminRoutePrefix,
  adminIntegrationsRoute,
  adminReleaseGatesRoute
] as const;

export const protectedRoutePrefixes = [workspaceRoutePrefix, adminRoutePrefix, accountRoutePrefix] as const;

const workspaceSurfaceRouteLookup = new Set<string>(workspaceSurfaceRoutes);
const adminIngestionSurfaceRouteLookup = new Set<string>(adminIngestionSurfaceRoutes);
const adminCatalogSurfaceRouteLookup = new Set<string>(adminCatalogSurfaceRoutes);
const adminOperationsDashboardSurfaceRouteLookup = new Set<string>(adminOperationsDashboardSurfaceRoutes);
const adminOperationsRecordSurfaceRouteLookup = new Set<string>(adminOperationsRecordSurfaceRoutes);
const adminAccountManagementSurfaceRouteLookup = new Set<string>(adminAccountManagementSurfaceRoutes);

export function isWorkspaceSurfaceRoute(pathname: string): pathname is (typeof workspaceSurfaceRoutes)[number] {
  return workspaceSurfaceRouteLookup.has(pathname);
}

export function isAdminIngestionSurfaceRoute(pathname: string): pathname is (typeof adminIngestionSurfaceRoutes)[number] {
  return adminIngestionSurfaceRouteLookup.has(pathname);
}

export function isAdminCatalogSurfaceRoute(pathname: string): pathname is (typeof adminCatalogSurfaceRoutes)[number] {
  return adminCatalogSurfaceRouteLookup.has(pathname);
}

export function isAdminOperationsDashboardSurfaceRoute(
  pathname: string
): pathname is (typeof adminOperationsDashboardSurfaceRoutes)[number] {
  return adminOperationsDashboardSurfaceRouteLookup.has(pathname);
}

export function isAdminOperationsRecordSurfaceRoute(
  pathname: string
): pathname is (typeof adminOperationsRecordSurfaceRoutes)[number] {
  return adminOperationsRecordSurfaceRouteLookup.has(pathname);
}

export function isAdminAccountManagementSurfaceRoute(
  pathname: string
): pathname is (typeof adminAccountManagementSurfaceRoutes)[number] {
  return adminAccountManagementSurfaceRouteLookup.has(pathname);
}

export function isWorkspaceSurfacePath(pathname: string): boolean {
  return pathname.startsWith(workspaceRoutePrefix);
}

export function isAdminSurfacePath(pathname: string): boolean {
  return pathname.startsWith(adminRoutePrefix);
}

export function isAccountSurfacePath(pathname: string): boolean {
  return pathname.startsWith(accountRoutePrefix);
}

export function isProtectedSurfacePath(pathname: string): boolean {
  return (
    pathname === protectedDashboardRoute ||
    pathname.startsWith(`${protectedDashboardRoutePrefix}/`) ||
    protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}
