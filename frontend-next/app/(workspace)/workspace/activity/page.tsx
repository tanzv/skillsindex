import { workspaceActivityRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderWorkspacePageRoute } from "@/src/features/workspace/workspaceRouteEntry";

export default async function WorkspaceActivityPage() {
  return renderWorkspacePageRoute(workspaceActivityRoute);
}
