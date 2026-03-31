import { workspaceRunbookRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderWorkspacePageRoute } from "@/src/features/workspace/workspaceRouteEntry";

export default async function WorkspaceRunbookPage() {
  return renderWorkspacePageRoute(workspaceRunbookRoute);
}
