import { getServerSessionContext } from "@/src/lib/auth/session";
import { renderWorkspaceRoute } from "@/src/features/workspace/renderWorkspaceRoute";

export default async function WorkspaceActivityPage() {
  const session = await getServerSessionContext();
  return renderWorkspaceRoute("/workspace/activity", session);
}
