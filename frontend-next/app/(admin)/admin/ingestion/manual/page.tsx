import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

export default async function AdminIngestionManualPage() {
  return renderAdminPageRoute("/admin/ingestion/manual");
}
