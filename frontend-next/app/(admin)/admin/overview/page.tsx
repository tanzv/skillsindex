import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";

export default async function AdminOverviewPage() {
  return renderAdminRoute("/admin/overview");
}
