import { adminAlertsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsAlertsPage() {
  return renderAdminPageRoute(adminAlertsRoute);
}
