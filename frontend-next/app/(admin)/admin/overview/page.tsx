import { adminOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOverviewPage() {
  return renderAdminPageRoute(adminOverviewRoute);
}
