import { adminImportsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminRecordsImportsPage() {
  return renderAdminPageRoute(adminImportsRoute);
}
