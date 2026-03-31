import { adminRepositoryIntakeRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";
import { loadAdminIngestionRepositorySnapshotFromRequest } from "@/src/features/adminIngestion/adminIngestionSnapshot.server";

export default async function AdminIngestionRepositoryPage() {
  try {
    const initialRepositorySnapshot = await loadAdminIngestionRepositorySnapshotFromRequest();
    return renderAdminPageRoute(adminRepositoryIntakeRoute, {
      initialRepositorySnapshot
    });
  } catch {
    return renderAdminPageRoute(adminRepositoryIntakeRoute);
  }
}
