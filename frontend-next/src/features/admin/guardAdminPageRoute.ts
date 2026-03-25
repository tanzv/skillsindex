import "server-only";

import { getServerSessionContext } from "@/src/lib/auth/session";
import {
  requireAdminSurfaceSession,
  requireAdminUserManagementSession,
  requireAdminViewAllSession
} from "@/src/lib/auth/guards";
import { resolveAdminRouteDefinition } from "@/src/lib/routing/adminRouteRegistry";

export async function guardAdminPageRoute(targetPath: string): Promise<void> {
  const session = await getServerSessionContext();
  const routeDefinition = resolveAdminRouteDefinition(targetPath);

  switch (routeDefinition?.requiredCapability) {
    case "manage_users":
      requireAdminUserManagementSession(session, targetPath);
      return;
    case "view_all_admin":
      requireAdminViewAllSession(session, targetPath);
      return;
    default:
      requireAdminSurfaceSession(session, targetPath);
  }
}
