import { adminSyncJobsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminSyncJobsPage() {
  return renderAdminPageRoute(adminSyncJobsRoute);
}
