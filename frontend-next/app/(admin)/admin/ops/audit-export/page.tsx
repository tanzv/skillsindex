import { adminAuditExportRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminOpsAuditExportPage() {
  return renderAdminPageRoute(adminAuditExportRoute);
}
