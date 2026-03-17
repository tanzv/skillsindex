import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";

export default async function AdminSyncJobsPage() {
  return renderAdminRoute("/admin/sync-jobs");
}
