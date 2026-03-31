import { workspacePolicyRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderWorkspacePageRoute } from "@/src/features/workspace/workspaceRouteEntry";

export default async function WorkspacePolicyPage() {
  return renderWorkspacePageRoute(workspacePolicyRoute);
}
