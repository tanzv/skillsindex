export const marketplaceHomeRoute = "/" as const;
export const protectedDashboardRoute = "/dashboard" as const;

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

export const adminOverviewRoute = "/admin/overview" as const;
export const adminManualIntakeRoute = "/admin/ingestion/manual" as const;
export const adminRepositoryIntakeRoute = "/admin/ingestion/repository" as const;
export const adminImportsRoute = "/admin/records/imports" as const;
export const adminSkillsRoute = "/admin/skills" as const;
export const adminJobsRoute = "/admin/jobs" as const;
export const adminSyncJobsRoute = "/admin/sync-jobs" as const;
export const adminSyncPolicyRoute = "/admin/sync-policy/repository" as const;
export const adminAccountsRoute = "/admin/accounts" as const;
export const adminAccessRoute = "/admin/access" as const;
export const adminRolesRoute = "/admin/roles" as const;
export const adminOrganizationsRoute = "/admin/organizations" as const;
export const adminIntegrationsRoute = "/admin/integrations" as const;
export const adminReleaseGatesRoute = "/admin/ops/release-gates" as const;
export const adminRoutePrefix = "/admin" as const;

export const protectedRoutePrefixes = [workspaceRoutePrefix, adminRoutePrefix, accountRoutePrefix] as const;

const workspaceSurfaceRouteLookup = new Set<string>(workspaceSurfaceRoutes);

export function isWorkspaceSurfaceRoute(pathname: string): pathname is (typeof workspaceSurfaceRoutes)[number] {
  return workspaceSurfaceRouteLookup.has(pathname);
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
  return pathname === protectedDashboardRoute || protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}
