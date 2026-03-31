import { adminModerationRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminModerationPage() {
  return renderAdminPageRoute(adminModerationRoute);
}
