import Link from "next/link";

import { cn } from "@/src/lib/utils";

import type { WorkspaceMetric, WorkspacePageModel, WorkspaceSection, WorkspaceSectionItem } from "./types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function resolveMetricToneClassName(tone?: WorkspaceMetric["tone"]) {
  if (tone === "accent") {
    return "is-accent";
  }

  if (tone === "success") {
    return "is-success";
  }

  if (tone === "warning") {
    return "is-warning";
  }

  return "";
}

function resolveSectionVariantClassName(variant?: WorkspaceSection["variant"]) {
  if (!variant || variant === "default") {
    return "";
  }

  return `is-${variant}`;
}

function WorkspaceMetricCard({ metric }: { metric: WorkspaceMetric }) {
  return (
    <div className={cn("workspace-stage-summary-card", resolveMetricToneClassName(metric.tone))}>
      <div className="workspace-stage-summary-label">{metric.label}</div>
      <div className="workspace-stage-summary-value">{metric.value}</div>
      <div className="workspace-stage-summary-detail">{metric.detail || "Live workspace snapshot"}</div>
    </div>
  );
}

function WorkspaceSignalItem({ item }: { item: WorkspaceSectionItem }) {
  return (
    <div className="workspace-section-item is-signal">
      <div className="workspace-section-item-label">{item.label}</div>
      <div className="workspace-section-item-value is-signal">{item.value}</div>
      {item.description ? <p className="workspace-section-item-description">{item.description}</p> : null}
    </div>
  );
}

function WorkspaceActivityItem({ item }: { item: WorkspaceSectionItem }) {
  return (
    <div className="workspace-section-item is-activity">
      <div className="workspace-section-item-row">
        <div className="workspace-section-item-meta">
          <div className="workspace-section-item-label">{item.label}</div>
          {item.description ? <p className="workspace-section-item-description">{item.description}</p> : null}
        </div>
        <div className="workspace-section-item-value is-inline">{item.value}</div>
      </div>
    </div>
  );
}

function WorkspaceCompactItem({ item, isSession = false }: { item: WorkspaceSectionItem; isSession?: boolean }) {
  return (
    <div className={cn("workspace-section-item", isSession ? "is-session" : "is-compact")}>
      <div className="workspace-section-item-row">
        <div className="workspace-section-item-meta">
          <div className="workspace-section-item-label">{item.label}</div>
          {item.description ? <p className="workspace-section-item-description">{item.description}</p> : null}
        </div>
        <div className={cn("workspace-section-item-value", isSession && "is-session")}>{item.value}</div>
      </div>
    </div>
  );
}

function renderSectionItem(item: WorkspaceSectionItem, variant?: WorkspaceSection["variant"]) {
  if (variant === "signal-grid") {
    return <WorkspaceSignalItem item={item} />;
  }

  if (variant === "activity-list") {
    return <WorkspaceActivityItem item={item} />;
  }

  return <WorkspaceCompactItem item={item} isSession={variant === "session"} />;
}

export function WorkspaceSectionCard({ section }: { section: WorkspaceSection }) {
  const sectionSlug = slugify(section.id || section.title);

  return (
    <section
      className={cn(
        "workspace-stage-panel",
        "workspace-section-card",
        resolveSectionVariantClassName(section.variant),
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

      <div className={cn("workspace-section-list", resolveSectionVariantClassName(section.variant))}>
        {section.items.map((item) => (
          <div key={`${section.id}-${item.label}`} className="workspace-section-list-entry">
            {renderSectionItem(item, section.variant)}
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
              className={cn("workspace-stage-action", resolveActionVariantClassName(action.variant))}
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
  const isOverview = model.route === "/workspace";

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
