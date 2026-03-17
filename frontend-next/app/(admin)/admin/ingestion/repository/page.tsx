import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";

export default async function AdminIngestionRepositoryPage() {
  return renderAdminRoute("/admin/ingestion/repository");
}
