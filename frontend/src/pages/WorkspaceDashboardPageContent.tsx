import { Alert, Tag, Typography } from "antd";

import type { AppLocale } from "../lib/i18n";
import {
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeMetricGrid,
  PrototypeSplitRow,
  PrototypeStack
} from "./prototypeCssInJs";
import { buildWorkspaceQueueInsightRows, buildWorkspaceRiskWatchlist } from "./WorkspaceCenterPageContent.helpers";
import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { formatWorkspaceDate, workspaceStatusColor } from "./WorkspaceCenterPage.helpers";
import {
  WorkspaceMainColumn,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQueueLegend,
  WorkspaceSectionAnchor
} from "./WorkspaceCenterPage.styles";
import type { WorkspaceSnapshot } from "./WorkspaceCenterPage.types";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

interface WorkspaceDashboardPageContentProps {
  text: WorkspaceCenterCopy;
  locale: AppLocale;
  loading: boolean;
  error: string;
  degradedMessage: string;
  snapshot: WorkspaceSnapshot;
}

const dashboardRowStyle = {
  background: "color-mix(in srgb, var(--si-color-muted-surface) 82%, transparent)",
  borderColor: "color-mix(in srgb, var(--si-color-border) 72%, transparent)",
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--si-color-border-soft) 44%, transparent)"
} as const;

export default function WorkspaceDashboardPageContent({
  text,
  locale,
  loading,
  error,
  degradedMessage,
  snapshot
}: WorkspaceDashboardPageContentProps) {
  const queueInsightRows = buildWorkspaceQueueInsightRows(snapshot, text);
  const riskWatchlist = buildWorkspaceRiskWatchlist(snapshot.queueEntries);

  return (
    <WorkspaceMainColumn>
      {loading ? (
        <WorkspaceSectionAnchor id="workspace-overview">
          <WorkspaceSurfaceCard tone="panel">
            <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.8rem" }}>{text.loading}</Typography.Text>
          </WorkspaceSurfaceCard>
        </WorkspaceSectionAnchor>
      ) : null}

      {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
      {!loading && degradedMessage ? <Alert type="warning" showIcon message={degradedMessage || text.degradedData} /> : null}

      {!loading && !error ? (
        <>
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

          <PrototypeStack>
            <WorkspaceSurfaceCard tone="panel">
              <WorkspacePanelHeading>{text.queueInsights}</WorkspacePanelHeading>
              <WorkspaceQueueLegend>
                <Tag>{`${text.queueAll}: ${snapshot.queueCounts.all}`}</Tag>
                <Tag color="gold">{`${text.queuePending}: ${snapshot.queueCounts.pending}`}</Tag>
                <Tag color="cyan">{`${text.queueRunning}: ${snapshot.queueCounts.running}`}</Tag>
                <Tag color="red">{`${text.queueRisk}: ${snapshot.queueCounts.risk}`}</Tag>
              </WorkspaceQueueLegend>
              <PrototypeList>
                {queueInsightRows.map((item) => (
                  <PrototypeListRow key={item.id} style={dashboardRowStyle}>
                    <PrototypeSplitRow>
                      <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.76rem" }}>{item.label}</Typography.Text>
                      <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.84rem" }}>
                        {item.value}
                      </Typography.Text>
                    </PrototypeSplitRow>
                  </PrototypeListRow>
                ))}
              </PrototypeList>
            </WorkspaceSurfaceCard>

            <WorkspaceSurfaceCard tone="panel">
              <WorkspacePanelHeading>{text.riskWatchlist}</WorkspacePanelHeading>
              <WorkspaceMutedText>{text.riskWatchlistHint}</WorkspaceMutedText>
              <PrototypeList>
                {riskWatchlist.length > 0 ? (
                  riskWatchlist.map((entry) => (
                    <PrototypeListRow key={entry.id} style={dashboardRowStyle}>
                      <PrototypeListMain>
                        <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.8rem" }}>
                          {entry.name}
                        </Typography.Text>
                        <PrototypeListActions>
                          <Tag color={workspaceStatusColor(entry.status)}>{text.queueRisk}</Tag>
                          <Tag>{`${text.queueOwner}: ${entry.owner}`}</Tag>
                          <Tag>{`${text.queueUpdated}: ${formatWorkspaceDate(entry.updatedAt, locale)}`}</Tag>
                        </PrototypeListActions>
                      </PrototypeListMain>
                    </PrototypeListRow>
                  ))
                ) : (
                  <WorkspaceMutedText>{text.noRiskItems}</WorkspaceMutedText>
                )}
              </PrototypeList>
            </WorkspaceSurfaceCard>
          </PrototypeStack>
        </>
      ) : null}
    </WorkspaceMainColumn>
  );
}
