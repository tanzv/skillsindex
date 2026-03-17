import Link from "next/link";

import { cn } from "@/src/lib/utils";

import type { WorkspacePageModel } from "./types";
import { WorkspaceSummaryGrid } from "./WorkspaceRouteShared";
import { WorkspaceRouteContent } from "./WorkspaceRouteViews";

interface WorkspaceRoutePageProps {
  model: WorkspacePageModel;
}

function resolveActionVariantClassName(variant?: "default" | "outline" | "soft" | "ghost") {
  if (variant === "default") {
    return "is-primary";
  }

  if (variant === "soft") {
    return "is-soft";
  }

  return "";
}

export function WorkspaceRoutePage({ model }: WorkspaceRoutePageProps) {
  const isOverview = model.route === "/workspace";

  return (
    <div className={cn("workspace-stage", isOverview && "is-overview")} data-testid="workspace-route-stage">
      <section className={cn("workspace-stage-panel", "workspace-stage-hero", isOverview && "workspace-overview-hero")}>
        <p className="workspace-stage-kicker">{model.eyebrow}</p>
        <h1>{model.title}</h1>
        <p className="workspace-stage-description">{model.description}</p>

        <WorkspaceSummaryGrid model={model} />

        <div className="workspace-stage-action-row">
          {model.quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn("workspace-stage-action", resolveActionVariantClassName(action.variant))}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <WorkspaceRouteContent model={model} />
    </div>
  );
}
