import { adminMetricsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsMetricsPage() {
  return renderAdminPageRoute(adminMetricsRoute);
}
