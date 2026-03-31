import Link from "next/link";

import { workspaceActionsRoute, workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { cn } from "@/src/lib/utils";

import { WorkspaceSummaryGrid } from "./WorkspaceRouteShared";
import type { WorkspacePageModel } from "./types";
import { resolveWorkspaceActionVariantClassName } from "./workspaceViewContracts";

interface WorkspaceRouteFrameProps {
  model: WorkspacePageModel;
  children: React.ReactNode;
}

export function WorkspaceRouteFrame({ model, children }: WorkspaceRouteFrameProps) {
  const isOverview = model.route === workspaceOverviewRoute;
  const showHeroQuickActions = model.route === workspaceActionsRoute && model.quickActions.length > 0;

  return (
    <div className={cn("workspace-stage", isOverview && "is-overview")} data-testid="workspace-route-stage">
      <section className={cn("workspace-stage-panel", "workspace-stage-hero", isOverview && "workspace-overview-hero")}>
        <p className="workspace-stage-kicker">{model.eyebrow}</p>
        <h1>{model.title}</h1>
        <p className="workspace-stage-description">{model.description}</p>

        <WorkspaceSummaryGrid model={model} />

        {showHeroQuickActions ? (
          <div className="workspace-stage-action-row">
            {model.quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn("workspace-stage-action", resolveWorkspaceActionVariantClassName(action.variant))}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {children}
    </div>
  );
}
