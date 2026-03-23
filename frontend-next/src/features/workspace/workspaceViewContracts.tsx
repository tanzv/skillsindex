import { cn } from "@/src/lib/utils";

import type { WorkspaceAction, WorkspaceMetric, WorkspaceSection, WorkspaceSectionItem } from "./types";

const workspaceActionVariantClassNames: Partial<Record<NonNullable<WorkspaceAction["variant"]>, string>> = {
  default: "is-primary",
  soft: "is-soft"
};

const workspaceMetricToneClassNames: Partial<Record<NonNullable<WorkspaceMetric["tone"]>, string>> = {
  accent: "is-accent",
  success: "is-success",
  warning: "is-warning"
};

const workspaceSectionVariantClassNames: Partial<Record<NonNullable<WorkspaceSection["variant"]>, string>> = {
  "signal-grid": "is-signal-grid",
  "activity-list": "is-activity-list",
  "compact-list": "is-compact-list",
  "code-emphasis": "is-code-emphasis",
  session: "is-session"
};

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

type WorkspaceSectionItemRenderer = (item: WorkspaceSectionItem) => React.ReactElement;

const workspaceSectionItemRenderers: Partial<Record<NonNullable<WorkspaceSection["variant"]>, WorkspaceSectionItemRenderer>> = {
  "signal-grid": (item) => <WorkspaceSignalItem item={item} />,
  "activity-list": (item) => <WorkspaceActivityItem item={item} />,
  session: (item) => <WorkspaceCompactItem item={item} isSession />
};

export function resolveWorkspaceActionVariantClassName(variant?: WorkspaceAction["variant"]): string {
  return variant ? workspaceActionVariantClassNames[variant] || "" : "";
}

export function resolveWorkspaceMetricToneClassName(tone?: WorkspaceMetric["tone"]): string {
  return tone ? workspaceMetricToneClassNames[tone] || "" : "";
}

export function resolveWorkspaceSectionVariantClassName(variant?: WorkspaceSection["variant"]): string {
  return variant ? workspaceSectionVariantClassNames[variant] || "" : "";
}

export function renderWorkspaceSectionItem(item: WorkspaceSectionItem, variant?: WorkspaceSection["variant"]) {
  const renderSectionItem = variant ? workspaceSectionItemRenderers[variant] : undefined;

  return renderSectionItem ? renderSectionItem(item) : <WorkspaceCompactItem item={item} />;
}
