import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";
import { loadAdminIngestionRepositorySnapshotFromRequest } from "@/src/features/adminIngestion/adminIngestionSnapshot.server";

export default async function AdminIngestionRepositoryPage() {
  try {
    const initialRepositorySnapshot = await loadAdminIngestionRepositorySnapshotFromRequest();
    return renderAdminPageRoute("/admin/ingestion/repository", {
      initialRepositorySnapshot
    });
  } catch {
    return renderAdminPageRoute("/admin/ingestion/repository");
  }
}
