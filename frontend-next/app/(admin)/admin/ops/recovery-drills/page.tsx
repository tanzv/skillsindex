import { adminRecoveryDrillsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsRecoveryDrillsPage() {
  return renderAdminPageRoute(adminRecoveryDrillsRoute);
}
