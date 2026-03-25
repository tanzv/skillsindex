import { redirect } from "next/navigation";

import { buildLoginRedirectPath } from "./loginPaths";
import { canAccessProtectedConsole, canManagePlatformUsers, canViewAllAdminData } from "./roleAccess";
import type { SessionContext } from "../schemas/session";
import { accountProfileRoute, adminOverviewRoute } from "../routing/protectedSurfaceLinks";

export { buildLoginRedirectPath } from "./loginPaths";

export function requireRouteSession(context: SessionContext, targetPath: string): void {
  if (!context.user) {
    redirect(buildLoginRedirectPath(targetPath));
  }
}

export function requireAdminSurfaceSession(context: SessionContext, targetPath: string): void {
  requireRouteSession(context, targetPath);

  if (!canAccessProtectedConsole(context)) {
    redirect(accountProfileRoute);
  }
}

export function requireAdminUserManagementSession(context: SessionContext, targetPath: string): void {
  requireAdminSurfaceSession(context, targetPath);

  if (!canManagePlatformUsers(context)) {
    redirect(adminOverviewRoute);
  }
}

export function requireAdminViewAllSession(context: SessionContext, targetPath: string): void {
  requireAdminSurfaceSession(context, targetPath);

  if (!canViewAllAdminData(context)) {
    redirect(adminOverviewRoute);
  }
}
