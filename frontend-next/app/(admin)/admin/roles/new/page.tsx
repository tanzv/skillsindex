import { adminRolesNewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminRolesNewPage() {
  return renderAdminPageRoute(adminRolesNewRoute);
}
