import {
  publicDocsRoute,
  publicHomeRoute,
  publicDocsTopNavMatchPrefixes,
  publicMarketplaceTopNavMatchPrefixes,
  publicRouteEntries
} from "./publicRouteRegistry";
import { adminRoutePaths } from "./adminRouteRegistry";
import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountRoutePrefix,
  accountSecurityRoute,
  accountSessionsRoute,
  isAccountSurfacePath,
  isAdminSurfacePath,
  isProtectedSurfacePath,
  isWorkspaceSurfacePath,
  adminOverviewRoute,
  adminRoutePrefix,
  workspaceActionsRoute,
  workspaceActivityRoute,
  workspaceOverviewRoute,
  workspacePolicyRoute,
  workspaceRoutePrefix,
  workspaceQueueRoute,
  workspaceRunbookRoute
} from "./protectedSurfaceLinks";

export const publicRoutes = publicRouteEntries;

export const workspaceRoutes = [
  workspaceOverviewRoute,
  workspaceActivityRoute,
  workspaceQueueRoute,
  workspacePolicyRoute,
  workspaceRunbookRoute,
  workspaceActionsRoute
] as const;

export const accountRoutes = [
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute,
  accountApiCredentialsRoute
] as const;

export const adminRoutes = adminRoutePaths;

export type WorkspaceRoute = (typeof workspaceRoutes)[number];
export type AccountRoute = (typeof accountRoutes)[number];
export type AdminRoute = (typeof adminRoutes)[number];

export function isProtectedRoute(pathname: string): boolean {
  return isProtectedSurfacePath(pathname);
}

export function isAdminPath(pathname: string): boolean {
  return isAdminSurfacePath(pathname);
}

export function isWorkspacePath(pathname: string): boolean {
  return isWorkspaceSurfacePath(pathname);
}

export function isAccountPath(pathname: string): boolean {
  return isAccountSurfacePath(pathname);
}

export interface AppNavItem {
  href: string;
  label: string;
  matchPrefixes?: string[];
}

export const appTopNavItems: AppNavItem[] = [
  {
    href: publicHomeRoute,
    label: "Marketplace",
    matchPrefixes: [...publicMarketplaceTopNavMatchPrefixes]
  },
  {
    href: workspaceOverviewRoute,
    label: "Workspace",
    matchPrefixes: [workspaceRoutePrefix]
  },
  {
    href: adminOverviewRoute,
    label: "Admin",
    matchPrefixes: [adminRoutePrefix]
  },
  {
    href: accountProfileRoute,
    label: "Account",
    matchPrefixes: [accountRoutePrefix]
  },
  {
    href: publicDocsRoute,
    label: "Docs",
    matchPrefixes: [...publicDocsTopNavMatchPrefixes]
  }
];
