import { adminAccessRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminAccessPage() {
  return renderAdminPageRoute(adminAccessRoute);
}
