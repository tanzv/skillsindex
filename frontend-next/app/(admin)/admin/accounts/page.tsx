import { adminAccountsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminAccountsPage() {
  return renderAdminPageRoute(adminAccountsRoute);
}
