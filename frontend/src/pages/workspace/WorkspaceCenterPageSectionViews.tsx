import { Button, Tag, Typography } from "antd";

import {
  PrototypeDeckColumns,
  PrototypeFieldLabel,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeSplitRow,
  PrototypeStack
} from "../prototype/prototypeCssInJs";
import {
  buildWorkspaceOwnerCoverageRows,
  resolveWorkspaceExecutionSpotlight,
  resolveWorkspaceRunbookEntry,
  type WorkspaceQueueInsightRow
} from "./WorkspaceCenterPageContent.helpers";
import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { buildWorkspaceCommandPreview, formatWorkspaceDate, workspaceStatusColor } from "./WorkspaceCenterPage.helpers";
import {
  WorkspaceActionCluster,
  WorkspaceActionClusterTitle,
  WorkspaceActionRow,
  WorkspaceCodeBlock,
  WorkspaceInlineMetricGrid,
  WorkspaceInlineMetricItem,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQueueLegend,
  WorkspaceQuickActionGrid,
  WorkspaceSectionAnchor,
  WorkspaceSubpageGrid,
  WorkspaceSubpageRail,
  WorkspaceTagCloud
} from "./WorkspaceCenterPage.styles";
import type { WorkspaceQueueEntry, WorkspaceSnapshot } from "./WorkspaceCenterPage.types";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";
import type { AppLocale } from "../../lib/i18n";

export interface WorkspaceSectionLayoutContext {
  text: WorkspaceCenterCopy;
  locale: AppLocale;
  snapshot: WorkspaceSnapshot;
  queueInsightRows: WorkspaceQueueInsightRow[];
  recentActivity: WorkspaceQueueEntry[];
  riskWatchlist: WorkspaceQueueEntry[];
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
}

const activityRowStyle = {
  background: "color-mix(in srgb, var(--si-color-muted-surface) 82%, transparent)",
  borderColor: "color-mix(in srgb, var(--si-color-border) 72%, transparent)",
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--si-color-border-soft) 44%, transparent)"
} as const;

const queueInsightRowStyle = {
  background: "color-mix(in srgb, var(--si-color-muted-surface) 82%, transparent)",
  borderColor: "color-mix(in srgb, var(--si-color-border) 72%, transparent)"
} as const;

function resolveWorkspaceStatusLabel(status: WorkspaceQueueEntry["status"], text: WorkspaceCenterCopy): string {
  if (status === "risk") {
    return text.queueRisk;
  }
  if (status === "running") {
    return text.queueRunning;
  }
  return text.queuePending;
}

export function renderActivitySection(context: WorkspaceSectionLayoutContext) {
  const { locale, onNavigate, recentActivity, snapshot, text, toPublicPath } = context;
  const ownerCoverageRows = buildWorkspaceOwnerCoverageRows(snapshot.queueEntries);

  return (
    <WorkspaceSubpageGrid>
      <WorkspaceSectionAnchor id="workspace-activity">
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.activityFeed}</WorkspacePanelHeading>
          <WorkspaceMutedText>{text.activityHint}</WorkspaceMutedText>
          <PrototypeList>
            {recentActivity.length > 0 ? (
              recentActivity.map((entry) => (
                <PrototypeListRow key={entry.id} style={activityRowStyle}>
                  <PrototypeListMain>
                    <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.82rem" }}>
                      {entry.name}
                    </Typography.Text>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem", lineHeight: 1.45 }}>
                      {entry.category} / {entry.subcategory}
                    </Typography.Text>
                    <WorkspaceMutedText>{entry.summary}</WorkspaceMutedText>
                    <PrototypeListActions>
                      <Tag color={workspaceStatusColor(entry.status)}>{resolveWorkspaceStatusLabel(entry.status, text)}</Tag>
                      <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.72rem" }}>
                        {text.queueUpdated}: {formatWorkspaceDate(entry.updatedAt, locale)}
                      </Typography.Text>
                    </PrototypeListActions>
                  </PrototypeListMain>
                  <Button size="small" onClick={() => onNavigate(toPublicPath(`/skills/${entry.id}`))}>
                    {text.openDetail}
                  </Button>
                </PrototypeListRow>
              ))
            ) : (
              <WorkspaceMutedText>{text.emptyQueue}</WorkspaceMutedText>
            )}
          </PrototypeList>
        </WorkspaceSurfaceCard>
      </WorkspaceSectionAnchor>

      <WorkspaceSubpageRail>
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.activityHighlights}</WorkspacePanelHeading>
          <WorkspaceInlineMetricGrid>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.queueRunning}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{snapshot.queueCounts.running}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.queueRisk}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{snapshot.queueCounts.risk}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.alerts}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{snapshot.metrics.alerts}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.healthScore}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{snapshot.metrics.healthScore.toFixed(1)}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
          </WorkspaceInlineMetricGrid>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.ownerCoverage}</WorkspacePanelHeading>
          <PrototypeList>
            {ownerCoverageRows.map((row) => (
              <PrototypeListRow key={row.owner} style={queueInsightRowStyle}>
                <PrototypeListMain>
                  <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.78rem" }}>
                    {row.owner}
                  </Typography.Text>
                  <PrototypeListActions>
                    <Tag>{`${row.itemCount} ${text.itemsLabel}`}</Tag>
                    <Tag color={row.riskCount > 0 ? "red" : "cyan"}>{`${row.riskCount} ${text.queueRisk}`}</Tag>
                    <Tag>{`${text.qualityScoreShort}: ${row.averageQuality}`}</Tag>
                  </PrototypeListActions>
                </PrototypeListMain>
              </PrototypeListRow>
            ))}
          </PrototypeList>
        </WorkspaceSurfaceCard>
      </WorkspaceSubpageRail>
    </WorkspaceSubpageGrid>
  );
}

export function renderQueueSection(context: WorkspaceSectionLayoutContext) {
  const { onNavigate, queueInsightRows, snapshot, text, toAdminPath, toPublicPath } = context;
  const spotlightEntry = resolveWorkspaceExecutionSpotlight(snapshot.queueEntries);

  return (
    <WorkspaceSubpageGrid>
      <WorkspaceSectionAnchor id="workspace-queue">
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.executionSpotlight}</WorkspacePanelHeading>
          {spotlightEntry ? (
            <>
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.94rem" }}>
                {spotlightEntry.name}
              </Typography.Text>
              <WorkspaceMutedText>{spotlightEntry.summary}</WorkspaceMutedText>
              <WorkspaceQueueLegend>
                <Tag color={workspaceStatusColor(spotlightEntry.status)}>{resolveWorkspaceStatusLabel(spotlightEntry.status, text)}</Tag>
                <Tag>{`${text.queueOwner}: ${spotlightEntry.owner}`}</Tag>
                <Tag>{`${text.qualityScoreShort}: ${spotlightEntry.qualityScore.toFixed(1)}`}</Tag>
              </WorkspaceQueueLegend>
              <WorkspaceTagCloud>
                {(spotlightEntry.tags.length > 0 ? spotlightEntry.tags : [text.queueTagNone]).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </WorkspaceTagCloud>
              <WorkspaceActionRow>
                <Button onClick={() => onNavigate(toPublicPath(`/skills/${spotlightEntry.id}`))}>{text.openDetail}</Button>
                <Button onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>{text.openRecords}</Button>
              </WorkspaceActionRow>
            </>
          ) : (
            <WorkspaceMutedText>{text.emptyQueue}</WorkspaceMutedText>
          )}
        </WorkspaceSurfaceCard>
      </WorkspaceSectionAnchor>

      <WorkspaceSubpageRail>
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
              <PrototypeListRow key={item.id} style={queueInsightRowStyle}>
                <PrototypeListMain>
                  <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem" }}>{item.label}</Typography.Text>
                  <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.86rem" }}>
                    {item.value}
                  </Typography.Text>
                </PrototypeListMain>
              </PrototypeListRow>
            ))}
          </PrototypeList>
        </WorkspaceSurfaceCard>
      </WorkspaceSubpageRail>
    </WorkspaceSubpageGrid>
  );
}

export function renderPolicySection(context: WorkspaceSectionLayoutContext) {
  const { onNavigate, snapshot, text, toAdminPath, toPublicPath } = context;

  return (
    <WorkspaceSubpageGrid>
      <WorkspaceSectionAnchor id="workspace-policy">
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.governancePriorities}</WorkspacePanelHeading>
          {snapshot.policySignals.map((signal) => (
            <PrototypeSplitRow key={signal.key}>
              <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.77rem" }}>{signal.label}</Typography.Text>
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.78rem" }}>
                {signal.value}
              </Typography.Text>
            </PrototypeSplitRow>
          ))}
          <WorkspaceActionRow>
            <Button onClick={() => onNavigate(toPublicPath("/governance"))}>{text.sidebarGovernance}</Button>
            <Button onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>{text.sidebarRecords}</Button>
          </WorkspaceActionRow>
        </WorkspaceSurfaceCard>
      </WorkspaceSectionAnchor>

      <WorkspaceSubpageRail>
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.reviewPressure}</WorkspacePanelHeading>
          <WorkspaceInlineMetricGrid>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.alerts}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{snapshot.metrics.alerts}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.queueRisk}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{snapshot.queueCounts.risk}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
          </WorkspaceInlineMetricGrid>
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
      </WorkspaceSubpageRail>
    </WorkspaceSubpageGrid>
  );
}

export function renderRunbookSection(context: WorkspaceSectionLayoutContext) {
  const { onNavigate, riskWatchlist, snapshot, text, toAdminPath, toPublicPath } = context;
  const runbookEntry = resolveWorkspaceRunbookEntry(snapshot.queueEntries);

  return (
    <WorkspaceSubpageGrid>
      <WorkspaceSectionAnchor id="workspace-runbook">
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.riskWatchlist}</WorkspacePanelHeading>
          <WorkspaceMutedText>{text.riskWatchlistHint}</WorkspaceMutedText>
          <PrototypeList>
            {riskWatchlist.length > 0 ? (
              riskWatchlist.map((entry) => (
                <PrototypeListRow key={entry.id} style={queueInsightRowStyle}>
                  <PrototypeListMain>
                    <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.8rem" }}>
                      {entry.name}
                    </Typography.Text>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem" }}>
                      {text.queueOwner}: {entry.owner}
                    </Typography.Text>
                    <PrototypeListActions>
                      <Tag color="red">{resolveWorkspaceStatusLabel(entry.status, text)}</Tag>
                      <Tag>{`${text.qualityScoreShort}: ${entry.qualityScore.toFixed(1)}`}</Tag>
                    </PrototypeListActions>
                  </PrototypeListMain>
                  <Button size="small" onClick={() => onNavigate(toPublicPath(`/skills/${entry.id}`))}>
                    {text.openDetail}
                  </Button>
                </PrototypeListRow>
              ))
            ) : (
              <WorkspaceMutedText>{text.noRiskItems}</WorkspaceMutedText>
            )}
          </PrototypeList>
        </WorkspaceSurfaceCard>
      </WorkspaceSectionAnchor>

      <WorkspaceSubpageRail>
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.responseCommandPreview}</WorkspacePanelHeading>
          <WorkspaceCodeBlock>{buildWorkspaceCommandPreview(runbookEntry)}</WorkspaceCodeBlock>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.responseChecklist}</WorkspacePanelHeading>
          <WorkspaceActionRow>
            <Button onClick={() => onNavigate(toPublicPath("/governance"))}>{text.sidebarGovernance}</Button>
            <Button onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>{text.openRecords}</Button>
          </WorkspaceActionRow>
        </WorkspaceSurfaceCard>
      </WorkspaceSubpageRail>
    </WorkspaceSubpageGrid>
  );
}

export function renderActionsSection(context: WorkspaceSectionLayoutContext) {
  const { onNavigate, text, toAdminPath, toPublicPath } = context;

  return (
    <PrototypeDeckColumns>
      <WorkspaceSectionAnchor id="workspace-quick-actions">
        <WorkspaceSurfaceCard tone="panel">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.marketplaceActions}</WorkspaceActionClusterTitle>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(toPublicPath("/"))}>{text.openMarketplace}</Button>
              <Button onClick={() => onNavigate(toPublicPath("/rankings"))}>{text.openQueueCompare}</Button>
              <Button onClick={() => onNavigate(toPublicPath("/categories"))}>{text.openDocs}</Button>
              <Button onClick={() => onNavigate(toPublicPath("/rankings?scope=top"))}>{text.navTop}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>
      </WorkspaceSectionAnchor>

      <PrototypeStack>
        <WorkspaceSurfaceCard tone="panel">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.controlCenterActions}</WorkspaceActionClusterTitle>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(toAdminPath("/admin/skills"))}>{text.openSkills}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>{text.openRecords}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/ops/audit-export"))}>{text.openAudit}</Button>
              <Button onClick={() => onNavigate(toPublicPath("/governance"))}>{text.sidebarGovernance}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="quick">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.linkedHubActions}</WorkspaceActionClusterTitle>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(toPublicPath("/governance"))}>{text.sidebarGovernance}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>{text.sidebarRecords}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/accounts"))}>{text.sidebarPersonnelManagement}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/roles"))}>{text.sidebarRoleManagement}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>
      </PrototypeStack>
    </PrototypeDeckColumns>
  );
}
