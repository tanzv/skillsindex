import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";

export default async function AdminAPIKeysPage() {
  return renderAdminRoute("/admin/apikeys");
}
