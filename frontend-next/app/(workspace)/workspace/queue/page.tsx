import "../../../workspace-overview.css";
import { workspaceQueueRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderWorkspacePageRoute } from "@/src/features/workspace/workspaceRouteEntry";

export default async function WorkspaceQueuePage() {
  return renderWorkspacePageRoute(workspaceQueueRoute);
}
