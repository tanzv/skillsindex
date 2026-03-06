import { Alert, Button, Segmented, Space, Tag, Typography } from "antd";
import type { CSSProperties } from "react";

import type { AppLocale } from "../lib/i18n";
import {
  PrototypeCodeBlock,
  PrototypeDeckColumns,
  PrototypeFieldLabel,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeMetricGrid,
  PrototypeSplitRow,
  PrototypeStack
} from "./prototypeCssInJs";
import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { formatWorkspaceDate, workspaceStatusColor } from "./WorkspaceCenterPage.helpers";
import {
  WorkspaceActionRow,
  WorkspaceMainColumn,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQueueLegend,
  WorkspaceQuickActionGrid,
  WorkspaceSectionAnchor,
  WorkspaceSegmentHint,
  WorkspaceTagCloud
} from "./WorkspaceCenterPage.styles";
import type { WorkspaceQueueEntry, WorkspaceQueueFilter, WorkspaceSnapshot } from "./WorkspaceCenterPage.types";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

interface WorkspaceCenterPageContentProps {
  text: WorkspaceCenterCopy;
  locale: AppLocale;
  loading: boolean;
  error: string;
  degradedMessage: string;
  snapshot: WorkspaceSnapshot;
  queueFilter: WorkspaceQueueFilter;
  filteredQueue: WorkspaceQueueEntry[];
  selectedQueueEntry: WorkspaceQueueEntry | null;
  commandPreview: string;
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
  onQueueFilterChange: (filter: WorkspaceQueueFilter) => void;
  onQueueSelect: (queueID: number) => void;
  onCopyCommandPreview: () => void;
}

const activityRowStyle: CSSProperties = {
  background: "color-mix(in srgb, var(--si-color-muted-surface) 82%, transparent)",
  borderColor: "color-mix(in srgb, var(--si-color-border) 72%, transparent)",
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--si-color-border-soft) 44%, transparent)"
};

function resolveQueueRowStyle(selected: boolean): CSSProperties {
  if (!selected) {
    return {
      background: "color-mix(in srgb, var(--si-color-muted-surface) 82%, transparent)",
      borderColor: "color-mix(in srgb, var(--si-color-border) 72%, transparent)"
    };
  }
  return {
    background: "linear-gradient(155deg, color-mix(in srgb, var(--si-color-accent) 36%, transparent), color-mix(in srgb, var(--si-color-panel) 90%, transparent))",
    borderColor: "color-mix(in srgb, var(--si-color-accent) 62%, transparent)",
    boxShadow: "0 10px 22px color-mix(in srgb, var(--si-color-accent) 24%, transparent)"
  };
}

export default function WorkspaceCenterPageContent({
  text,
  locale,
  loading,
  error,
  degradedMessage,
  snapshot,
  queueFilter,
  filteredQueue,
  selectedQueueEntry,
  commandPreview,
  onNavigate,
  toPublicPath,
  toAdminPath,
  onQueueFilterChange,
  onQueueSelect,
  onCopyCommandPreview
}: WorkspaceCenterPageContentProps) {
  return (
    <WorkspaceMainColumn>
      <WorkspaceSectionAnchor id="workspace-overview">
        {loading ? (
          <WorkspaceSurfaceCard tone="panel">
            <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.8rem" }}>{text.loading}</Typography.Text>
          </WorkspaceSurfaceCard>
        ) : null}

        {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
        {!loading && degradedMessage ? <Alert type="warning" showIcon message={degradedMessage || text.degradedData} /> : null}

        {!loading && !error ? (
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
        ) : null}
      </WorkspaceSectionAnchor>

      {!loading && !error ? (
        <PrototypeDeckColumns>
          <PrototypeStack>
            <WorkspaceSectionAnchor id="workspace-activity">
              <WorkspaceSurfaceCard tone="panel">
                <WorkspacePanelHeading>{text.activityFeed}</WorkspacePanelHeading>
                <PrototypeList>
                  {snapshot.queueEntries.slice(0, 8).map((entry) => (
                    <PrototypeListRow key={entry.id} style={activityRowStyle}>
                      <PrototypeListMain>
                        <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.82rem" }}>
                          {entry.name}
                        </Typography.Text>
                        <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem", lineHeight: 1.45 }}>
                          {entry.category} / {entry.subcategory}
                        </Typography.Text>
                        <PrototypeListActions>
                          <Tag color={workspaceStatusColor(entry.status)}>{entry.status}</Tag>
                          <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.72rem" }}>
                            {text.queueUpdated}: {formatWorkspaceDate(entry.updatedAt, locale)}
                          </Typography.Text>
                        </PrototypeListActions>
                      </PrototypeListMain>
                      <Button size="small" onClick={() => onNavigate(toPublicPath(`/skills/${entry.id}`))}>
                        {text.openDetail}
                      </Button>
                    </PrototypeListRow>
                  ))}
                </PrototypeList>
              </WorkspaceSurfaceCard>
            </WorkspaceSectionAnchor>

            <WorkspaceSectionAnchor id="workspace-policy">
              <WorkspaceSurfaceCard tone="panel">
                <WorkspacePanelHeading>{text.policySummary}</WorkspacePanelHeading>
                {snapshot.policySignals.map((signal) => (
                  <PrototypeSplitRow key={signal.key}>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.77rem" }}>{signal.label}</Typography.Text>
                    <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.78rem" }}>
                      {signal.value}
                    </Typography.Text>
                  </PrototypeSplitRow>
                ))}

                <PrototypeFieldLabel>{text.topTags}</PrototypeFieldLabel>
                <WorkspaceTagCloud>
                  {snapshot.topTags.length > 0
                    ? snapshot.topTags.map((tag) => (
                        <Tag key={tag.name} color="blue">
                          {tag.name} ({tag.count})
                        </Tag>
                      ))
                    : [<Tag key="none">{text.queueTagNone}</Tag>]}
                </WorkspaceTagCloud>
              </WorkspaceSurfaceCard>
            </WorkspaceSectionAnchor>
          </PrototypeStack>

          <PrototypeStack>
            <WorkspaceSectionAnchor id="workspace-queue">
              <WorkspaceSurfaceCard tone="panel">
                <WorkspacePanelHeading>{text.queuePanel}</WorkspacePanelHeading>

                <WorkspaceQueueLegend>
                  <Tag>{`${text.queueAll}: ${snapshot.queueCounts.all}`}</Tag>
                  <Tag color="gold">{`${text.queuePending}: ${snapshot.queueCounts.pending}`}</Tag>
                  <Tag color="cyan">{`${text.queueRunning}: ${snapshot.queueCounts.running}`}</Tag>
                  <Tag color="red">{`${text.queueRisk}: ${snapshot.queueCounts.risk}`}</Tag>
                </WorkspaceQueueLegend>

                <Segmented
                  block
                  value={queueFilter}
                  options={[
                    { label: text.queueAll, value: "all" },
                    { label: text.queuePending, value: "pending" },
                    { label: text.queueRunning, value: "running" },
                    { label: text.queueRisk, value: "risk" }
                  ]}
                  onChange={(value) => onQueueFilterChange(value as WorkspaceQueueFilter)}
                />
                <WorkspaceSegmentHint>{text.queueSelectHint}</WorkspaceSegmentHint>

                <PrototypeList>
                  {filteredQueue.length > 0 ? (
                    filteredQueue.slice(0, 6).map((entry) => {
                      const isSelected = selectedQueueEntry?.id === entry.id;
                      return (
                        <PrototypeListRow key={entry.id} style={resolveQueueRowStyle(isSelected)}>
                          <PrototypeListMain>
                            <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.8rem" }}>
                              {entry.name}
                            </Typography.Text>
                            <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem", lineHeight: 1.45 }}>
                              {entry.summary}
                            </Typography.Text>
                            <Space wrap size={4}>
                              <Tag color={workspaceStatusColor(entry.status)}>{entry.status}</Tag>
                              <Tag>{`${text.queueOwner}: ${entry.owner}`}</Tag>
                            </Space>
                          </PrototypeListMain>
                          <PrototypeListActions>
                            <Button size="small" type={isSelected ? "primary" : "default"} onClick={() => onQueueSelect(entry.id)}>
                              {text.queueStatus}
                            </Button>
                            <Button size="small" onClick={() => onNavigate(toPublicPath(`/skills/${entry.id}`))}>
                              {text.openDetail}
                            </Button>
                          </PrototypeListActions>
                        </PrototypeListRow>
                      );
                    })
                  ) : (
                    <WorkspaceMutedText>{text.emptyQueue}</WorkspaceMutedText>
                  )}
                </PrototypeList>
              </WorkspaceSurfaceCard>
            </WorkspaceSectionAnchor>

            <WorkspaceSectionAnchor id="workspace-runbook">
              <WorkspaceSurfaceCard tone="panel">
                <WorkspacePanelHeading>{text.runbook}</WorkspacePanelHeading>
                <PrototypeCodeBlock>{commandPreview}</PrototypeCodeBlock>
                <WorkspaceActionRow>
                  <Button onClick={onCopyCommandPreview}>{text.copyScript}</Button>
                  <Button onClick={() => onNavigate(toPublicPath("/rollout"))}>{text.openRollout}</Button>
                </WorkspaceActionRow>
              </WorkspaceSurfaceCard>
            </WorkspaceSectionAnchor>

            <WorkspaceSectionAnchor id="workspace-quick-actions">
              <WorkspaceSurfaceCard tone="quick">
                <WorkspacePanelHeading style={{ color: "var(--si-color-accent-contrast)" }}>{text.quickActions}</WorkspacePanelHeading>
                <WorkspaceQuickActionGrid>
                  <Button onClick={() => onNavigate(toPublicPath("/rankings"))}>{text.openQueueCompare}</Button>
                  <Button onClick={() => onNavigate(toPublicPath("/rollout"))}>{text.openQueueRollout}</Button>
                  <Button onClick={() => onNavigate(toAdminPath("/admin/skills"))}>{text.openSkills}</Button>
                  <Button onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>{text.openRecords}</Button>
                  <Button onClick={() => onNavigate(toPublicPath("/categories"))}>{text.openDocs}</Button>
                  <Button onClick={() => onNavigate(toAdminPath("/admin/ops/audit-export"))}>{text.openAudit}</Button>
                </WorkspaceQuickActionGrid>
              </WorkspaceSurfaceCard>
            </WorkspaceSectionAnchor>
          </PrototypeStack>
        </PrototypeDeckColumns>
      ) : null}
    </WorkspaceMainColumn>
  );
}
