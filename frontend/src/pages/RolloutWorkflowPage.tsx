import { Button, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";

import { PublicMarketplaceResponse, SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import { buildWorkspaceSnapshot, formatWorkspaceDate, workspaceStatusColor } from "./WorkspaceCenterPage.helpers";
import { buildWorkspaceSidebarNavigation } from "./WorkspaceCenterPage.navigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { WorkspaceMutedText, WorkspacePanelHeading, WorkspaceQuickActionGrid, WorkspaceTagCloud } from "./WorkspaceCenterPage.styles";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { createPublicPageNavigator } from "./publicPageNavigation";
import WorkspacePrototypePageShell from "./WorkspacePrototypePageShell";
import {
  WorkspacePrototypeActionCluster,
  WorkspacePrototypeDataItem,
  WorkspacePrototypeDataLabel,
  WorkspacePrototypeDataList,
  WorkspacePrototypeDataValue,
  WorkspacePrototypeInlineMeta,
  WorkspacePrototypeItemText,
  WorkspacePrototypeItemTitle,
  WorkspacePrototypeList,
  WorkspacePrototypeListItem,
  WorkspacePrototypeMarker,
  WorkspacePrototypePanelGrid,
  WorkspacePrototypePanelStack,
  WorkspacePrototypeTextStack
} from "./WorkspacePrototypePageShell.styles";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

interface RolloutWorkflowPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

const baseCopy = {
  title: "Install and Rollout Workflow",
  subtitle: "Drive intake, validation, publish, and observation from the same workspace navigation system.",
  eyebrow: "Rollout Control",
  loading: "Loading rollout workflow",
  requestFailed: "Request failed",
  degradedData: "Live rollout data is unavailable. Fallback workspace data is currently shown.",
  releaseFlow: "Release Flow",
  queueBoard: "Execution Queue",
  actionDock: "Action Dock",
  guardrails: "Governed Execution",
  stepSourceTitle: "Source Intake",
  stepSourceBody: "Collect manual uploads, repository syncs, archive drops, and partner submissions in one release queue.",
  stepValidationTitle: "Validation",
  stepValidationBody: "Run quality, metadata, and policy checkpoints before any asset is promoted to a public or managed surface.",
  stepPublishTitle: "Publish",
  stepPublishBody: "Roll approved assets into destination channels with a controlled blast radius and clear ownership handoff.",
  stepObserveTitle: "Observe",
  stepObserveBody: "Watch adoption, rollback triggers, and queue health after release without leaving the workspace family.",
  latestQueue: "Latest queue candidates",
  releaseReadiness: "Release readiness",
  rollbackState: "Rollback coverage",
  qualityGate: "Quality gate",
  queueVolume: "Queue volume",
  topTags: "Tracked tags",
  openWorkspace: "Open Workspace",
  openDashboard: "Open Dashboard",
  openRecords: "Open Records",
  openSync: "Open Sync Jobs",
  openDetail: "Open Detail",
  queueLabel: "Queue",
  qualityLabel: "Quality",
  riskLabel: "Risk",
  latestUpdate: "Latest update",
  releaseGreen: "Green lane",
  releaseWatch: "Watch lane",
  itemsReady: "items ready",
  guardedRollback: "guarded rollback",
  riskSignals: "risk signals"
};

const copy: Record<AppLocale, typeof baseCopy> = {
  en: baseCopy,
  zh: baseCopy
};

export default function RolloutWorkflowPage({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: RolloutWorkflowPageProps) {
  const text = copy[locale];
  const workspaceText = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degradedMessage, setDegradedMessage] = useState("");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setDegradedMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "quality", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setPayload(result.payload);
        setDegradedMessage(result.degraded ? text.degradedData : "");
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
  const sidebarGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text: workspaceText,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        sectionMode: "workspace-route"
      }),
    [pageNavigator.toAdmin, pageNavigator.toPublic, workspaceText]
  );
  const primaryQueue = useMemo(() => snapshot.queueEntries.slice(0, 4), [snapshot.queueEntries]);
  const releaseTone = snapshot.metrics.healthScore >= 8.5 ? text.releaseGreen : text.releaseWatch;
  const riskSignals = snapshot.queueCounts.risk;
  const latestUpdate = primaryQueue[0] ? formatWorkspaceDate(primaryQueue[0].updatedAt, locale) : "n/a";
  const visibleTopTags = snapshot.topTags.filter((tag) => String(tag.name || "").trim());

  return (
    <WorkspacePrototypePageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      activeMenuID="hub-rollout"
      sidebarGroups={sidebarGroups}
      sidebarMeta={[
        { id: "rollout-status", label: releaseTone, tone: "accent" },
        { id: "rollout-queue", label: `${snapshot.queueCounts.all} ${text.itemsReady}` }
      ]}
      eyebrow={text.eyebrow}
      title={text.title}
      subtitle={text.subtitle}
      summaryMetrics={[
        { id: "summary-quality", label: text.releaseReadiness, value: `${snapshot.metrics.healthScore.toFixed(1)} / 10` },
        { id: "summary-rollback", label: text.rollbackState, value: `${Math.max(snapshot.queueCounts.running, 1)} ${text.guardedRollback}` },
        { id: "summary-risk", label: text.qualityGate, value: `${riskSignals} ${text.riskSignals}` }
      ]}
      summaryActions={
        <>
          <Button onClick={() => onNavigate(pageNavigator.toPublic("/workspace"))}>{text.openWorkspace}</Button>
          <Button type="primary" onClick={() => onNavigate(pageNavigator.toAdmin("/admin/overview"))}>
            {text.openDashboard}
          </Button>
        </>
      }
      loading={loading}
      loadingText={text.loading}
      error={error}
      notice={degradedMessage}
    >
      <WorkspacePrototypePanelGrid>
        <WorkspacePrototypePanelStack>
          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.releaseFlow}</WorkspacePanelHeading>
            <WorkspacePrototypeList>
              {[
                { id: "01", title: text.stepSourceTitle, body: text.stepSourceBody },
                { id: "02", title: text.stepValidationTitle, body: text.stepValidationBody },
                { id: "03", title: text.stepPublishTitle, body: text.stepPublishBody },
                { id: "04", title: text.stepObserveTitle, body: text.stepObserveBody }
              ].map((step) => (
                <WorkspacePrototypeListItem key={step.id}>
                  <WorkspacePrototypeActionCluster>
                    <WorkspacePrototypeMarker $accent>{step.id}</WorkspacePrototypeMarker>
                    <WorkspacePrototypeTextStack>
                      <WorkspacePrototypeItemTitle>{step.title}</WorkspacePrototypeItemTitle>
                      <WorkspacePrototypeItemText>{step.body}</WorkspacePrototypeItemText>
                    </WorkspacePrototypeTextStack>
                  </WorkspacePrototypeActionCluster>
                </WorkspacePrototypeListItem>
              ))}
            </WorkspacePrototypeList>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.queueBoard}</WorkspacePanelHeading>
            <WorkspaceMutedText>{text.latestQueue}</WorkspaceMutedText>
            <WorkspacePrototypeList>
              {primaryQueue.length > 0 ? (
                primaryQueue.map((entry, index) => (
                  <WorkspacePrototypeListItem key={entry.id}>
                    <WorkspacePrototypeActionCluster>
                      <WorkspacePrototypeMarker>{String(index + 1).padStart(2, "0")}</WorkspacePrototypeMarker>
                      <WorkspacePrototypeTextStack>
                        <WorkspacePrototypeItemTitle>{entry.name}</WorkspacePrototypeItemTitle>
                        <WorkspacePrototypeItemText>{entry.summary}</WorkspacePrototypeItemText>
                        <WorkspacePrototypeInlineMeta>
                          <Tag color={workspaceStatusColor(entry.status)}>{entry.status}</Tag>
                          <Tag>{entry.owner}</Tag>
                          <Tag>{formatWorkspaceDate(entry.updatedAt, locale)}</Tag>
                        </WorkspacePrototypeInlineMeta>
                      </WorkspacePrototypeTextStack>
                    </WorkspacePrototypeActionCluster>
                    <Button size="small" onClick={() => onNavigate(pageNavigator.toPublic(`/skills/${entry.id}`))}>
                      {text.openDetail}
                    </Button>
                  </WorkspacePrototypeListItem>
                ))
              ) : (
                <WorkspaceMutedText>{workspaceText.emptyQueue}</WorkspaceMutedText>
              )}
            </WorkspacePrototypeList>
          </WorkspaceSurfaceCard>
        </WorkspacePrototypePanelStack>

        <WorkspacePrototypePanelStack>
          <WorkspaceSurfaceCard
            tone="panel"
            style={{
              border: "1px solid color-mix(in srgb, var(--si-color-accent) 34%, transparent)",
              background:
                "linear-gradient(165deg, color-mix(in srgb, var(--si-color-accent) 18%, transparent) 0%, transparent 58%), color-mix(in srgb, var(--si-color-panel) 88%, transparent)",
              boxShadow: "0 18px 32px color-mix(in srgb, #05080f 48%, transparent)"
            }}
          >
            <WorkspacePanelHeading>{text.actionDock}</WorkspacePanelHeading>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(pageNavigator.toPublic("/workspace"))}>{text.openWorkspace}</Button>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/overview"))}>{text.openDashboard}</Button>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/records/exports"))}>{text.openRecords}</Button>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/records/sync-jobs"))}>{text.openSync}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.guardrails}</WorkspacePanelHeading>
            <WorkspacePrototypeDataList>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.queueVolume}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{snapshot.queueCounts.all}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.releaseReadiness}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{releaseTone}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.riskLabel}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{riskSignals}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.latestUpdate}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{latestUpdate}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
            </WorkspacePrototypeDataList>

            <WorkspaceTagCloud>
              {visibleTopTags.length > 0 ? (
                visibleTopTags.map((tag) => (
                  <Tag key={tag.name} color="blue">
                    {tag.name} ({tag.count})
                  </Tag>
                ))
              ) : (
                <Tag>{workspaceText.queueTagNone}</Tag>
              )}
            </WorkspaceTagCloud>
          </WorkspaceSurfaceCard>
        </WorkspacePrototypePanelStack>
      </WorkspacePrototypePanelGrid>
    </WorkspacePrototypePageShell>
  );
}
