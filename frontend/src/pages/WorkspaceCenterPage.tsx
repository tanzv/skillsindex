import { Alert, Button, Card, Segmented, Space, Tag, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import {
  PrototypeCodeBlock,
  PrototypeDeckColumns,
  PrototypeFieldLabel,
  PrototypeHeaderLayout,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeMetricGrid,
  PrototypePageGrid,
  PrototypeSideLinks,
  PrototypeSplitRow,
  PrototypeStack
} from "./prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath, resolveAdminBase, resolvePublicBase, toPublicRoute } from "./prototypePageTheme";
import {
  buildWorkspaceCommandPreview,
  buildWorkspaceSnapshot,
  filterWorkspaceQueue,
  formatWorkspaceDate,
  workspaceStatusColor
} from "./WorkspaceCenterPage.helpers";
import { WorkspaceQueueFilter } from "./WorkspaceCenterPage.types";

interface WorkspaceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

export default function WorkspaceCenterPage({ locale, currentPath, onNavigate, sessionUser }: WorkspaceCenterPageProps) {
  const text = getWorkspaceCenterCopy(locale);
  const lightMode = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const adminBase = useMemo(() => resolveAdminBase(currentPath), [currentPath]);
  const publicBase = useMemo(() => resolvePublicBase(currentPath), [currentPath]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degradedMessage, setDegradedMessage] = useState("");
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof loadMarketplaceWithFallback>>["payload"] | null>(null);
  const [queueFilter, setQueueFilter] = useState<WorkspaceQueueFilter>("all");
  const [selectedQueueID, setSelectedQueueID] = useState<number>(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setDegradedMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "recent", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setPayload(result.payload);
        setDegradedMessage(result.degraded ? result.errorMessage || text.degradedData : "");
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : text.requestFailed);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, locale, sessionUser, text.degradedData, text.requestFailed]);

  const snapshot = useMemo(() => buildWorkspaceSnapshot({ payload }), [payload]);
  const filteredQueue = useMemo(() => filterWorkspaceQueue(snapshot.queueEntries, queueFilter), [snapshot.queueEntries, queueFilter]);
  const selectedQueueEntry = useMemo(
    () => filteredQueue.find((entry) => entry.id === selectedQueueID) || filteredQueue[0] || null,
    [filteredQueue, selectedQueueID]
  );
  const commandPreview = useMemo(() => buildWorkspaceCommandPreview(selectedQueueEntry), [selectedQueueEntry]);

  useEffect(() => {
    if (!selectedQueueEntry) {
      setSelectedQueueID(0);
      return;
    }
    if (selectedQueueID === selectedQueueEntry.id) {
      return;
    }
    setSelectedQueueID(selectedQueueEntry.id);
  }, [selectedQueueEntry, selectedQueueID]);

  async function copyCommandPreview(): Promise<void> {
    try {
      await navigator.clipboard.writeText(commandPreview);
      void message.success(text.copySuccess);
    } catch {
      void message.error(text.copyFailed);
    }
  }

  return (
    <PrototypePageGrid>
      <Card
        variant="borderless"
        style={{ borderRadius: 16, border: `1px solid ${palette.headerBorder}`, background: palette.headerBackground }}
        styles={{ body: { padding: "14px 16px" } }}
      >
        <PrototypeHeaderLayout>
          <div>
            <Typography.Title
              level={2}
              style={{ margin: 0, color: palette.headerTitle, fontFamily: "\"Syne\", sans-serif", fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)", lineHeight: 1.2 }}
            >
              {text.title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: "6px 0 0", color: palette.headerSubtitle, fontSize: "0.8rem" }}>
              {text.subtitle}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/"))}>{text.openMarketplace}</Button>
            <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/compare"))}>{text.openCompare}</Button>
            <Button type="primary" onClick={() => onNavigate(sessionUser ? `${adminBase}/overview` : "/login")}>
              {sessionUser ? text.openDashboard : text.signIn}
            </Button>
          </Space>
        </PrototypeHeaderLayout>
      </Card>

      {loading ? (
        <Card
          variant="borderless"
          style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { padding: 12 } }}
        >
          <Typography.Text style={{ color: palette.cardText, fontSize: "0.8rem" }}>{text.loading}</Typography.Text>
        </Card>
      ) : null}

      {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
      {!loading && degradedMessage ? <Alert type="warning" showIcon message={degradedMessage || text.degradedData} /> : null}

      {!loading && !error ? (
        <>
          <PrototypeMetricGrid>
            <Card
              variant="borderless"
              style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.installed}
              </Typography.Text>
              <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
                {snapshot.metrics.installedSkills}
              </Typography.Text>
            </Card>
            <Card
              variant="borderless"
              style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.runsToday}
              </Typography.Text>
              <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
                {snapshot.metrics.automationRuns}
              </Typography.Text>
            </Card>
            <Card
              variant="borderless"
              style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.healthScore}
              </Typography.Text>
              <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
                {snapshot.metrics.healthScore.toFixed(1)}
              </Typography.Text>
            </Card>
            <Card
              variant="borderless"
              style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
              styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
            >
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {text.alerts}
              </Typography.Text>
              <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
                {snapshot.metrics.alerts}
              </Typography.Text>
            </Card>
          </PrototypeMetricGrid>

          <PrototypeDeckColumns>
            <PrototypeStack>
              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.activityFeed}
                </Typography.Title>
                <PrototypeList>
                  {snapshot.queueEntries.slice(0, 8).map((entry) => (
                    <PrototypeListRow
                      key={entry.id}
                      style={{ background: lightMode ? "#e6edf7" : "#102a4f", borderColor: lightMode ? "#cbd6e4" : "#2d4f82" }}
                    >
                      <PrototypeListMain>
                        <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.8rem" }}>
                          {entry.name}
                        </Typography.Text>
                        <Typography.Text style={{ color: palette.cardText, fontSize: "0.74rem", lineHeight: 1.45 }}>
                          {entry.category} / {entry.subcategory}
                        </Typography.Text>
                        <PrototypeListActions>
                          <Tag color={workspaceStatusColor(entry.status)}>{entry.status}</Tag>
                          <Typography.Text style={{ color: palette.cardText, fontSize: "0.72rem" }}>
                            {text.queueUpdated}: {formatWorkspaceDate(entry.updatedAt, locale)}
                          </Typography.Text>
                        </PrototypeListActions>
                      </PrototypeListMain>
                      <Button size="small" onClick={() => onNavigate(toPublicRoute(publicBase, `/skills/${entry.id}`))}>
                        {text.openDetail}
                      </Button>
                    </PrototypeListRow>
                  ))}
                </PrototypeList>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.policySummary}
                </Typography.Title>
                {snapshot.policySignals.map((signal) => (
                  <PrototypeSplitRow key={signal.key}>
                    <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{signal.label}</Typography.Text>
                    <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.78rem" }}>
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
            </PrototypeStack>

            <PrototypeStack>
              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.queuePanel}
                </Typography.Title>
                <Space wrap>
                  <Tag>{text.queueAll}: {snapshot.queueCounts.all}</Tag>
                  <Tag color="gold">{text.queuePending}: {snapshot.queueCounts.pending}</Tag>
                  <Tag color="cyan">{text.queueRunning}: {snapshot.queueCounts.running}</Tag>
                  <Tag color="red">{text.queueRisk}: {snapshot.queueCounts.risk}</Tag>
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
                  onChange={(value) => setQueueFilter(value as WorkspaceQueueFilter)}
                />
                <Typography.Text style={{ color: palette.cardText, fontSize: "0.74rem" }}>{text.queueSelectHint}</Typography.Text>
                <PrototypeList>
                  {filteredQueue.length > 0 ? (
                    filteredQueue.slice(0, 6).map((entry) => {
                      const isSelected = selectedQueueEntry?.id === entry.id;
                      return (
                        <PrototypeListRow
                          key={entry.id}
                          style={{
                            background: isSelected ? (lightMode ? "#dce6f3" : "#17406f") : lightMode ? "#e6edf7" : "#102a4f",
                            borderColor: isSelected ? (lightMode ? "#b3c5d7" : "#3f78b7") : lightMode ? "#cbd6e4" : "#2d4f82"
                          }}
                        >
                          <PrototypeListMain>
                            <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.8rem" }}>
                              {entry.name}
                            </Typography.Text>
                            <Typography.Text style={{ color: palette.cardText, fontSize: "0.74rem", lineHeight: 1.45 }}>
                              {entry.summary}
                            </Typography.Text>
                            <Space wrap size={4}>
                              <Tag color={workspaceStatusColor(entry.status)}>{entry.status}</Tag>
                              <Tag>{text.queueOwner}: {entry.owner}</Tag>
                            </Space>
                          </PrototypeListMain>
                          <PrototypeListActions>
                            <Button size="small" onClick={() => setSelectedQueueID(entry.id)}>
                              {text.queueStatus}
                            </Button>
                            <Button size="small" onClick={() => onNavigate(toPublicRoute(publicBase, `/skills/${entry.id}`))}>
                              {text.openDetail}
                            </Button>
                          </PrototypeListActions>
                        </PrototypeListRow>
                      );
                    })
                  ) : (
                    <Typography.Text style={{ color: palette.cardText, fontSize: "0.78rem" }}>{text.emptyQueue}</Typography.Text>
                  )}
                </PrototypeList>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                  {text.runbook}
                </Typography.Title>
                <PrototypeCodeBlock>{commandPreview}</PrototypeCodeBlock>
                <Space wrap>
                  <Button onClick={copyCommandPreview}>{text.copyScript}</Button>
                  <Button onClick={() => onNavigate(toPublicRoute(publicBase, "/rollout"))}>{text.openRollout}</Button>
                </Space>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 13, border: `1px solid ${palette.sideHighlightBorder}`, background: palette.sideHighlightBackground }}
                styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
              >
                <Typography.Title level={4} style={{ margin: 0, color: "#f3fbff", fontSize: "0.95rem" }}>
                  {text.quickActions}
                </Typography.Title>
                <PrototypeSideLinks>
                  <Button block onClick={() => onNavigate(toPublicRoute(publicBase, "/compare"))}>{text.openQueueCompare}</Button>
                  <Button block onClick={() => onNavigate(toPublicRoute(publicBase, "/rollout"))}>{text.openQueueRollout}</Button>
                  <Button block onClick={() => onNavigate(`${adminBase}/skills`)}>{text.openSkills}</Button>
                  <Button block onClick={() => onNavigate(toPublicRoute(publicBase, "/docs"))}>{text.openDocs}</Button>
                  <Button block onClick={() => onNavigate(`${adminBase}/ops/audit-export`)}>{text.openAudit}</Button>
                </PrototypeSideLinks>
              </Card>
            </PrototypeStack>
          </PrototypeDeckColumns>
        </>
      ) : null}
    </PrototypePageGrid>
  );
}
