import { adminSyncPolicyRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminRepositorySyncPolicyPage() {
  return renderAdminPageRoute(adminSyncPolicyRoute);
}
