import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";

export default async function AdminModerationPage() {
  return renderAdminRoute("/admin/moderation");
}
