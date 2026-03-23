import { WorkspaceRouteFrame } from "./WorkspaceRouteFrame";
import { WorkspaceOverviewGrid } from "./WorkspaceRouteShared";
import type { WorkspacePageModel } from "./types";

interface WorkspaceOverviewRoutePageProps {
  model: WorkspacePageModel;
}

export function WorkspaceOverviewRoutePage({ model }: WorkspaceOverviewRoutePageProps) {
  return (
    <WorkspaceRouteFrame model={model}>
      <WorkspaceOverviewGrid model={model} />
    </WorkspaceRouteFrame>
  );
}
