import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";

export default async function AdminIngestionManualPage() {
  return renderAdminRoute("/admin/ingestion/manual");
}
