import {
  publicDocsRoute,
  publicHomeRoute,
  publicDocsTopNavMatchPrefixes,
  publicMarketplaceTopNavMatchPrefixes,
  publicRouteEntries
} from "./publicRouteRegistry";
import { adminRoutePaths } from "./adminRouteRegistry";
import {
  accountSurfaceRoutes,
  accountProfileRoute,
  accountRoutePrefix,
  isAccountSurfacePath,
  isAdminSurfacePath,
  isProtectedSurfacePath,
  isWorkspaceSurfacePath,
  adminOverviewRoute,
  adminRoutePrefix,
  workspaceOverviewRoute,
  workspaceRoutePrefix,
  workspaceSurfaceRoutes
} from "./protectedSurfaceLinks";

export const publicRoutes = publicRouteEntries;

export const workspaceRoutes = workspaceSurfaceRoutes;

export const accountRoutes = accountSurfaceRoutes;

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
