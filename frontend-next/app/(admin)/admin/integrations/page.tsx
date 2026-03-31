import { adminIntegrationsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminIntegrationsPage() {
  return renderAdminPageRoute(adminIntegrationsRoute);
}
