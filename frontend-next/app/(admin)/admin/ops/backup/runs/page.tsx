import { adminBackupRunsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsBackupRunsPage() {
  return renderAdminPageRoute(adminBackupRunsRoute);
}
