import { getServerSessionContext } from "@/src/lib/auth/session";
import { renderWorkspaceRoute } from "@/src/features/workspace/renderWorkspaceRoute";

export default async function WorkspaceOverviewPage() {
  const session = await getServerSessionContext();
  return renderWorkspaceRoute("/workspace", session);
}
