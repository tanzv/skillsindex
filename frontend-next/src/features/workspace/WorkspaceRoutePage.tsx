import type { WorkspacePageModel } from "./types";
import { WorkspaceRouteFrame } from "./WorkspaceRouteFrame";
import { WorkspaceRouteContent } from "./WorkspaceRouteViews";

interface WorkspaceRoutePageProps {
  model: WorkspacePageModel;
}

export function WorkspaceRoutePage({ model }: WorkspaceRoutePageProps) {
  return (
    <WorkspaceRouteFrame model={model}>
      <WorkspaceRouteContent model={model} />
    </WorkspaceRouteFrame>
  );
}
