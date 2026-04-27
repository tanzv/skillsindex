import "../../../workspace-overview.css";
import { workspaceActionsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderWorkspacePageRoute } from "@/src/features/workspace/workspaceRouteEntry";

export default async function WorkspaceActionsPage() {
  return renderWorkspacePageRoute(workspaceActionsRoute);
}
