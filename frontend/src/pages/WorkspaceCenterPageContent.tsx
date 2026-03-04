import { Alert, Button, Card, Segmented, Space, Tag, Typography } from "antd";

import type { SessionUser } from "../lib/api";
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
  PrototypeSideLinks,
  PrototypeStack,
  PrototypeSplitRow
} from "./prototypeCssInJs";
import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { formatWorkspaceDate, workspaceStatusColor } from "./WorkspaceCenterPage.helpers";
import { WorkspaceMainColumn, WorkspaceSectionAnchor } from "./WorkspaceCenterPage.styles";
import type { WorkspaceQueueEntry, WorkspaceQueueFilter, WorkspaceSnapshot } from "./WorkspaceCenterPage.types";

interface WorkspaceCenterPageContentProps {
  text: WorkspaceCenterCopy;
  locale: AppLocale;
  loading: boolean;
  error: string;
  degradedMessage: string;
  sessionUser: SessionUser | null;
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

export default function WorkspaceCenterPageContent({
  text,
  locale,
  loading,
  error,
  degradedMessage,
  sessionUser,
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
        <Card
          variant="borderless"
          style={{
            borderRadius: 16,
            border: "none",
            background: "color-mix(in srgb, var(--si-color-panel) 82%, transparent)",
            boxShadow: "none",
            backdropFilter: "blur(10px)"
          }}
          styles={{ body: { padding: "14px 16px" } }}
        >
          <PrototypeSplitRow>
            <div>
              <Typography.Title
                level={2}
                style={{
                  margin: 0,
                  color: "var(--si-color-text-primary)",
                  fontFamily: '"Syne", sans-serif',
                  fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)",
                  lineHeight: 1.2
                }}
              >
                {text.title}
              </Typography.Title>
              <Typography.Paragraph style={{ margin: "6px 0 0", color: "var(--si-color-text-secondary)", fontSize: "0.8rem" }}>
                {text.subtitle}
              </Typography.Paragraph>
            </div>
            <Space wrap>
              <Button onClick={() => onNavigate(toPublicPath("/"))}>{text.openMarketplace}</Button>
              <Button onClick={() => onNavigate(toPublicPath("/rankings"))}>{text.openCompare}</Button>
              <Button type="primary" onClick={() => onNavigate(sessionUser ? toAdminPath("/admin/overview") : toPublicPath("/login"))}>
                {sessionUser ? text.openDashboard : text.signIn}
              </Button>
            </Space>
          </PrototypeSplitRow>
        </Card>

        {loading ? (
          <Card
            variant="borderless"
            style={{
              borderRadius: 12,
              border: "none",
              background: "color-mix(in srgb, var(--si-color-surface) 76%, transparent)",
              boxShadow: "none"
            }}
            styles={{ body: { padding: 12 } }}
          >
            <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.8rem" }}>{text.loading}</Typography.Text>
          </Card>
        ) : null}

        {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
        {!loading && degradedMessage ? <Alert type="warning" showIcon message={degradedMessage || text.degradedData} /> : null}

        {!loading && !error ? (
          <PrototypeMetricGrid>
            <Card
              variant="borderless"
              style={{
                borderRadius: 12,
                border: "none",
                background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                boxShadow: "none"
              }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.installed}
              </Typography.Text>
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "1.06rem" }}>
                {snapshot.metrics.installedSkills}
              </Typography.Text>
            </Card>
            <Card
              variant="borderless"
              style={{
                borderRadius: 12,
                border: "none",
                background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                boxShadow: "none"
              }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.runsToday}
              </Typography.Text>
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "1.06rem" }}>
                {snapshot.metrics.automationRuns}
              </Typography.Text>
            </Card>
            <Card
              variant="borderless"
              style={{
                borderRadius: 12,
                border: "none",
                background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                boxShadow: "none"
              }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.healthScore}
              </Typography.Text>
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "1.06rem" }}>
                {snapshot.metrics.healthScore.toFixed(1)}
              </Typography.Text>
            </Card>
            <Card
              variant="borderless"
              style={{
                borderRadius: 12,
                border: "none",
                background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                boxShadow: "none"
              }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.alerts}
              </Typography.Text>
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "1.06rem" }}>
                {snapshot.metrics.alerts}
              </Typography.Text>
            </Card>
          </PrototypeMetricGrid>
        ) : null}
      </WorkspaceSectionAnchor>

      {!loading && !error ? (
        <PrototypeDeckColumns>
          <PrototypeStack>
            <WorkspaceSectionAnchor id="workspace-activity">
              <Card
                variant="borderless"
                style={{
                  borderRadius: 13,
                  border: "none",
                  background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                  boxShadow: "none"
                }}
                styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "var(--si-color-text-primary)", fontSize: "0.95rem" }}>
                  {text.activityFeed}
                </Typography.Title>
                <PrototypeList>
                  {snapshot.queueEntries.slice(0, 8).map((entry) => (
                    <PrototypeListRow
                      key={entry.id}
                      style={{
                        background: "color-mix(in srgb, var(--si-color-muted-surface) 70%, transparent)",
                        borderColor: "color-mix(in srgb, var(--si-color-border) 70%, transparent)"
                      }}
                    >
                      <PrototypeListMain>
                        <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.8rem" }}>
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
              </Card>
            </WorkspaceSectionAnchor>

            <WorkspaceSectionAnchor id="workspace-policy">
              <Card
                variant="borderless"
                style={{
                  borderRadius: 13,
                  border: "none",
                  background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                  boxShadow: "none"
                }}
                styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "var(--si-color-text-primary)", fontSize: "0.95rem" }}>
                  {text.policySummary}
                </Typography.Title>
                {snapshot.policySignals.map((signal) => (
                  <PrototypeSplitRow key={signal.key}>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.78rem" }}>{signal.label}</Typography.Text>
                    <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.78rem" }}>
                      {signal.value}
                    </Typography.Text>
                  </PrototypeSplitRow>
                ))}
                <PrototypeFieldLabel>{text.topTags}</PrototypeFieldLabel>
                <Space wrap>
                  {snapshot.topTags.length > 0
                    ? snapshot.topTags.map((tag) => (
                        <Tag key={tag.name} color="blue">
                          {tag.name} ({tag.count})
                        </Tag>
                      ))
                    : [<Tag key="none">{text.queueTagNone}</Tag>]}
                </Space>
              </Card>
            </WorkspaceSectionAnchor>
          </PrototypeStack>

          <PrototypeStack>
            <WorkspaceSectionAnchor id="workspace-queue">
              <Card
                variant="borderless"
                style={{
                  borderRadius: 13,
                  border: "none",
                  background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                  boxShadow: "none"
                }}
                styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "var(--si-color-text-primary)", fontSize: "0.95rem" }}>
                  {text.queuePanel}
                </Typography.Title>
                <Space wrap>
                  <Tag>
                    {text.queueAll}: {snapshot.queueCounts.all}
                  </Tag>
                  <Tag color="gold">
                    {text.queuePending}: {snapshot.queueCounts.pending}
                  </Tag>
                  <Tag color="cyan">
                    {text.queueRunning}: {snapshot.queueCounts.running}
                  </Tag>
                  <Tag color="red">
                    {text.queueRisk}: {snapshot.queueCounts.risk}
                  </Tag>
                </Space>
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
                <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem" }}>{text.queueSelectHint}</Typography.Text>
                <PrototypeList>
                  {filteredQueue.length > 0 ? (
                    filteredQueue.slice(0, 6).map((entry) => {
                      const isSelected = selectedQueueEntry?.id === entry.id;
                      return (
                        <PrototypeListRow
                          key={entry.id}
                          style={{
                            background: isSelected
                              ? "color-mix(in srgb, var(--si-color-accent) 46%, transparent)"
                              : "color-mix(in srgb, var(--si-color-muted-surface) 72%, transparent)",
                            borderColor: isSelected
                              ? "color-mix(in srgb, var(--si-color-accent) 56%, transparent)"
                              : "color-mix(in srgb, var(--si-color-border) 70%, transparent)"
                          }}
                        >
                          <PrototypeListMain>
                            <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.8rem" }}>
                              {entry.name}
                            </Typography.Text>
                            <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.74rem", lineHeight: 1.45 }}>
                              {entry.summary}
                            </Typography.Text>
                            <Space wrap size={4}>
                              <Tag color={workspaceStatusColor(entry.status)}>{entry.status}</Tag>
                              <Tag>
                                {text.queueOwner}: {entry.owner}
                              </Tag>
                            </Space>
                          </PrototypeListMain>
                          <PrototypeListActions>
                            <Button size="small" onClick={() => onQueueSelect(entry.id)}>
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
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.78rem" }}>{text.emptyQueue}</Typography.Text>
                  )}
                </PrototypeList>
              </Card>
            </WorkspaceSectionAnchor>

            <WorkspaceSectionAnchor id="workspace-runbook">
              <Card
                variant="borderless"
                style={{
                  borderRadius: 13,
                  border: "none",
                  background: "color-mix(in srgb, var(--si-color-surface) 78%, transparent)",
                  boxShadow: "none"
                }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "var(--si-color-text-primary)", fontSize: "0.95rem" }}>
                  {text.runbook}
                </Typography.Title>
                <PrototypeCodeBlock>{commandPreview}</PrototypeCodeBlock>
                <Space wrap>
                  <Button onClick={onCopyCommandPreview}>{text.copyScript}</Button>
                  <Button onClick={() => onNavigate(toPublicPath("/rollout"))}>{text.openRollout}</Button>
                </Space>
              </Card>
            </WorkspaceSectionAnchor>

            <WorkspaceSectionAnchor id="workspace-quick-actions">
              <Card
                variant="borderless"
                style={{
                  borderRadius: 13,
                  border: "none",
                  background: "color-mix(in srgb, var(--si-color-accent) 84%, transparent)",
                  boxShadow: "none"
                }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "var(--si-color-accent-contrast)", fontSize: "0.95rem" }}>
                  {text.quickActions}
                </Typography.Title>
                <PrototypeSideLinks>
                  <Button block onClick={() => onNavigate(toPublicPath("/rankings"))}>
                    {text.openQueueCompare}
                  </Button>
                  <Button block onClick={() => onNavigate(toPublicPath("/rollout"))}>
                    {text.openQueueRollout}
                  </Button>
                  <Button block onClick={() => onNavigate(toAdminPath("/admin/skills"))}>
                    {text.openSkills}
                  </Button>
                  <Button block onClick={() => onNavigate(toAdminPath("/admin/records/sync-jobs"))}>
                    {text.openRecords}
                  </Button>
                  <Button block onClick={() => onNavigate(toPublicPath("/categories"))}>
                    {text.openDocs}
                  </Button>
                  <Button block onClick={() => onNavigate(toAdminPath("/admin/ops/audit-export"))}>
                    {text.openAudit}
                  </Button>
                </PrototypeSideLinks>
              </Card>
            </WorkspaceSectionAnchor>
          </PrototypeStack>
        </PrototypeDeckColumns>
      ) : null}
    </WorkspaceMainColumn>
  );
}
