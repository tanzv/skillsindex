import { adminJobsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminJobsPage() {
  return renderAdminPageRoute(adminJobsRoute);
}
