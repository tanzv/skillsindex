import { PrototypeDeckColumns, PrototypeMetricGrid, PrototypeStack } from "../prototype/prototypeCssInJs";
import type { WorkspaceSectionPageKey } from "./WorkspaceCenterPage.navigation";
import {
  renderActionsSection,
  renderActivitySection,
  renderPolicySection,
  renderQueueSection,
  renderRunbookSection,
  type WorkspaceSectionLayoutContext
} from "./WorkspaceCenterPageSectionViews";
import {
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceSectionAnchor
} from "./WorkspaceCenterPage.styles";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

function renderOverviewSummary(context: WorkspaceSectionLayoutContext) {
  const { snapshot, text } = context;
  return (
    <WorkspaceSectionAnchor id="workspace-overview">
      <PrototypeMetricGrid>
        <WorkspaceSurfaceCard tone="metric">
          <WorkspaceMetricLabel>{text.installed}</WorkspaceMetricLabel>
          <WorkspaceMetricValue>{snapshot.metrics.installedSkills}</WorkspaceMetricValue>
        </WorkspaceSurfaceCard>
        <WorkspaceSurfaceCard tone="metric">
          <WorkspaceMetricLabel>{text.runsToday}</WorkspaceMetricLabel>
          <WorkspaceMetricValue>{snapshot.metrics.automationRuns}</WorkspaceMetricValue>
        </WorkspaceSurfaceCard>
        <WorkspaceSurfaceCard tone="metric">
          <WorkspaceMetricLabel>{text.healthScore}</WorkspaceMetricLabel>
          <WorkspaceMetricValue>{snapshot.metrics.healthScore.toFixed(1)}</WorkspaceMetricValue>
        </WorkspaceSurfaceCard>
        <WorkspaceSurfaceCard tone="metric">
          <WorkspaceMetricLabel>{text.alerts}</WorkspaceMetricLabel>
          <WorkspaceMetricValue>{snapshot.metrics.alerts}</WorkspaceMetricValue>
        </WorkspaceSurfaceCard>
      </PrototypeMetricGrid>
    </WorkspaceSectionAnchor>
  );
}

export function WorkspaceOverviewSections({ context }: { context: WorkspaceSectionLayoutContext }) {
  return (
    <>
      {renderOverviewSummary(context)}
      <PrototypeDeckColumns>
        <PrototypeStack>
          {renderActivitySection(context)}
          {renderQueueSection(context)}
          {renderPolicySection(context)}
        </PrototypeStack>
        <PrototypeStack>
          {renderRunbookSection(context)}
          {renderActionsSection(context)}
        </PrototypeStack>
      </PrototypeDeckColumns>
    </>
  );
}

export function WorkspaceFocusedSection({
  pageKey,
  context
}: {
  pageKey: Exclude<WorkspaceSectionPageKey, "overview">;
  context: WorkspaceSectionLayoutContext;
}) {
  const sectionBodyByPage = {
    activity: renderActivitySection(context),
    queue: renderQueueSection(context),
    policy: renderPolicySection(context),
    runbook: renderRunbookSection(context),
    actions: renderActionsSection(context)
  } satisfies Record<Exclude<WorkspaceSectionPageKey, "overview">, JSX.Element>;

  return (
    <PrototypeStack>
      {sectionBodyByPage[pageKey]}
    </PrototypeStack>
  );
}

export type { WorkspaceSectionLayoutContext } from "./WorkspaceCenterPageSectionViews";
