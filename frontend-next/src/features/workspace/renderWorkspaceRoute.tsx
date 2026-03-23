import { ErrorState } from "@/src/components/shared/ErrorState";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import type { SessionContext } from "@/src/lib/schemas/session";

import { loadWorkspaceRouteModel } from "./loadWorkspaceRouteModel";

export async function renderWorkspaceRoute(pathname: string, session: SessionContext) {
  try {
    const model = await loadWorkspaceRouteModel(pathname, session);

    if (model.route === workspaceOverviewRoute) {
      const { WorkspaceOverviewRoutePage } = await import("./WorkspaceOverviewRoutePage");

      return <WorkspaceOverviewRoutePage model={model} />;
    }

    const { WorkspaceRoutePage } = await import("./WorkspaceRoutePage");

    return <WorkspaceRoutePage model={model} />;
  } catch (error) {
    return <ErrorState description={error instanceof Error ? error.message : "Failed to load workspace data."} />;
  }
}
