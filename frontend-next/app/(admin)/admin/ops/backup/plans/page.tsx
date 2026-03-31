import { adminBackupPlansRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsBackupPlansPage() {
  return renderAdminPageRoute(adminBackupPlansRoute);
}
