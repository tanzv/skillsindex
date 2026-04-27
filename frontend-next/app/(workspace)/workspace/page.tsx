import "../../workspace-overview.css";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderWorkspacePageRoute } from "@/src/features/workspace/workspaceRouteEntry";

export default async function WorkspaceOverviewPage() {
  return renderWorkspacePageRoute(workspaceOverviewRoute);
}
