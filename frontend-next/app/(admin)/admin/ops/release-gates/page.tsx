import { adminReleaseGatesRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsReleaseGatesPage() {
  return renderAdminPageRoute(adminReleaseGatesRoute);
}
