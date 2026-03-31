import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkspaceRouteFrame } from "@/src/features/workspace/WorkspaceRouteFrame";
import type { WorkspacePageModel } from "@/src/features/workspace/types";
import { workspaceActionsRoute, workspaceActivityRoute } from "@/src/lib/routing/protectedSurfaceLinks";

function createWorkspacePageModel(route: WorkspacePageModel["route"]): WorkspacePageModel {
  return {
    locale: "en",
    route,
    eyebrow: "Workspace",
    title: "Workspace Page",
    description: "Workspace route frame regression test.",
    messages: {} as WorkspacePageModel["messages"],
    snapshot: {} as WorkspacePageModel["snapshot"],
    summaryMetrics: [],
    quickActions: [
      {
        label: "Frame Hero Action",
        href: workspaceActionsRoute,
        variant: "default"
      }
    ],
    primarySections: [],
    railSections: []
  };
}

describe("WorkspaceRouteFrame", () => {
  it("does not render the hero quick action row for non-actions workspace subpages", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceRouteFrame model={createWorkspacePageModel(workspaceActivityRoute)}>
        <div>Workspace Route Content</div>
      </WorkspaceRouteFrame>
    );

    expect(markup).not.toContain("workspace-stage-action-row");
    expect(markup).not.toContain("Frame Hero Action");
  });

  it("renders the hero quick action row for the workspace actions page", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceRouteFrame model={createWorkspacePageModel(workspaceActionsRoute)}>
        <div>Workspace Route Content</div>
      </WorkspaceRouteFrame>
    );

    expect(markup).toContain("workspace-stage-action-row");
    expect(markup).toContain("Frame Hero Action");
  });
});
