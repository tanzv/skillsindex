import Link from "next/link";

import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { cn } from "@/src/lib/utils";

import {
  renderWorkspaceSectionItem,
  resolveWorkspaceActionVariantClassName,
  resolveWorkspaceMetricToneClassName,
  resolveWorkspaceSectionVariantClassName
} from "./workspaceViewContracts";
import type { WorkspaceMetric, WorkspacePageModel, WorkspaceSection } from "./types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function WorkspaceMetricCard({ metric }: { metric: WorkspaceMetric }) {
  return (
    <div className={cn("workspace-stage-summary-card", resolveWorkspaceMetricToneClassName(metric.tone))}>
      <div className="workspace-stage-summary-label">{metric.label}</div>
      <div className="workspace-stage-summary-value">{metric.value}</div>
      <div className="workspace-stage-summary-detail">{metric.detail || "Live workspace snapshot"}</div>
    </div>
  );
}

export function WorkspaceSectionCard({ section }: { section: WorkspaceSection }) {
  const sectionSlug = slugify(section.id || section.title);

  return (
    <section
      className={cn(
        "workspace-stage-panel",
        "workspace-section-card",
        resolveWorkspaceSectionVariantClassName(section.variant),
        sectionSlug && `is-${sectionSlug}`
      )}
      data-testid={`workspace-section-${sectionSlug}`}
    >
      <div className="workspace-section-header">
        <div className="workspace-section-title-block">
          <h2>{section.title}</h2>
          {section.description ? <p className="workspace-section-description">{section.description}</p> : null}
        </div>
        {section.badges?.length ? (
          <div className="workspace-section-badges">
            {section.badges.map((badge) => (
              <span key={badge} className="workspace-section-badge">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={cn("workspace-section-list", resolveWorkspaceSectionVariantClassName(section.variant))}>
        {section.items.map((item) => (
          <div key={`${section.id}-${item.label}`} className="workspace-section-list-entry">
            {renderWorkspaceSectionItem(item, section.variant)}
          </div>
        ))}
      </div>

      {section.code ? <pre className="workspace-stage-code">{section.code}</pre> : null}

      {section.actions?.length ? (
        <div className="workspace-stage-action-row">
          {section.actions.map((action) => (
            <Link
              key={`${section.id}-${action.href}`}
              href={action.href}
              className={cn("workspace-stage-action", resolveWorkspaceActionVariantClassName(action.variant))}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function WorkspaceOverviewGrid({ model }: { model: WorkspacePageModel }) {
  return (
    <div className="workspace-stage-grid workspace-overview-grid" data-testid="workspace-overview-grid">
      <div className="workspace-stage-column workspace-overview-primary" data-testid="workspace-overview-primary">
        {model.primarySections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>
      <div className="workspace-stage-column workspace-overview-rail" data-testid="workspace-overview-rail">
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

export function WorkspaceSummaryGrid({ model }: { model: WorkspacePageModel }) {
  const isOverview = model.route === workspaceOverviewRoute;

  return (
    <div
      className={cn("workspace-stage-summary-grid", isOverview && "workspace-overview-summary-grid")}
      data-testid={isOverview ? "workspace-overview-summary" : undefined}
    >
      {model.summaryMetrics.map((metric) => (
        <WorkspaceMetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
