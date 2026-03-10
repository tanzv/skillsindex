import { Button, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";

import { PublicMarketplaceResponse, SessionUser } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import { buildWorkspaceSnapshot } from "../workspace/WorkspaceCenterPage.helpers";
import { buildWorkspaceSidebarNavigation } from "../workspace/WorkspaceCenterPage.navigation";
import { getWorkspaceCenterCopy } from "../workspace/WorkspaceCenterPage.copy";
import { WorkspaceMutedText, WorkspacePanelHeading, WorkspaceQuickActionGrid, WorkspaceTagCloud } from "../workspace/WorkspaceCenterPage.styles";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import WorkspacePrototypePageShell from "../workspace/WorkspacePrototypePageShell";
import {
  WorkspacePrototypeActionCluster,
  WorkspacePrototypeDataItem,
  WorkspacePrototypeDataLabel,
  WorkspacePrototypeDataList,
  WorkspacePrototypeDataValue,
  WorkspacePrototypeItemText,
  WorkspacePrototypeItemTitle,
  WorkspacePrototypeList,
  WorkspacePrototypeListItem,
  WorkspacePrototypeMarker,
  WorkspacePrototypePanelGrid,
  WorkspacePrototypePanelStack,
  WorkspacePrototypeTextStack
} from "../workspace/WorkspacePrototypePageShell.styles";
import WorkspaceSurfaceCard from "../workspace/WorkspaceSurfaceCard";

interface GovernanceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

const baseCopy = {
  title: "Governance Center",
  subtitle: "Coordinate policy guardrails, audit signals, and operator controls without leaving the workspace navigation stack.",
  eyebrow: "Control Plane",
  loading: "Loading governance center",
  requestFailed: "Request failed",
  degradedData: "Live governance data is unavailable. Fallback workspace signals are currently shown.",
  policyEngine: "Policy Engine",
  auditLedger: "Audit Ledger",
  controlPosture: "Control Posture",
  operationalControls: "Operational Controls",
  incidentResponse: "Incident Response",
  controlVisibility: "Visibility gates stay attached to every queue candidate and destination surface.",
  controlSync: "Synchronization checks verify repository lineage, records parity, and import policy alignment.",
  controlAccess: "Role-based access and escalation windows remain explicit before any release action is executed.",
  ledgerWindow: "Tracked tags",
  ledgerScope: "Coverage scope",
  complianceStatus: "Compliance baseline",
  statusPolicy: "Policy score",
  statusAccess: "Open alerts",
  statusSync: "Protected assets",
  keyLifecycle: "Key lifecycle",
  lifecycleActive: "Active keys",
  lifecycleExpiring: "Expiring soon",
  lifecycleRotation: "Rotation window",
  responseCapture: "Capture policy drift, operator overrides, and rollback triggers in one timeline.",
  responseReview: "Keep reviewer assignment, evidence, and remediation actions grouped by control family.",
  responseDrill: "Use workspace-linked hubs to run drills without losing operational context.",
  access: "Access Management",
  integrations: "Integrations",
  incidents: "Incidents",
  audit: "Audit Export",
  openWorkspace: "Open Workspace",
  openDashboard: "Open Dashboard",
  scoreLabel: "Policy",
  alertsLabel: "Alerts",
  scopeLabel: "Scope"
};

const copy: Record<AppLocale, typeof baseCopy> = {
  en: baseCopy,
  zh: baseCopy
};

export default function GovernanceCenterPage({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: GovernanceCenterPageProps) {
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

  const categoryCount = useMemo(() => new Set(snapshot.queueEntries.map((entry) => entry.category)).size, [snapshot.queueEntries]);
  const openIncidents = snapshot.queueCounts.risk;
  const policyScore = snapshot.metrics.healthScore;
  const activeKeys = snapshot.queueCounts.running + snapshot.queueCounts.pending;
  const expiringKeys = Math.max(snapshot.queueCounts.risk, 1);
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
      activeMenuID="system-governance"
      sidebarGroups={sidebarGroups}
      sidebarMeta={[
        { id: "governance-score", label: `${policyScore.toFixed(1)} ${text.scoreLabel}`, tone: "accent" },
        { id: "governance-alerts", label: `${openIncidents} ${text.alertsLabel}` }
      ]}
      eyebrow={text.eyebrow}
      title={text.title}
      subtitle={text.subtitle}
      summaryMetrics={[
        { id: "summary-policy", label: text.statusPolicy, value: `${policyScore.toFixed(1)} / 10` },
        { id: "summary-alerts", label: text.statusAccess, value: String(openIncidents) },
        { id: "summary-scope", label: text.statusSync, value: `${snapshot.metrics.installedSkills}` }
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
            <WorkspacePanelHeading>{text.policyEngine}</WorkspacePanelHeading>
            <WorkspacePrototypeList>
              {[
                text.controlVisibility,
                text.controlSync,
                text.controlAccess
              ].map((item, index) => (
                <WorkspacePrototypeListItem key={item}>
                  <WorkspacePrototypeActionCluster>
                    <WorkspacePrototypeMarker $accent>{String(index + 1).padStart(2, "0")}</WorkspacePrototypeMarker>
                    <WorkspacePrototypeTextStack>
                      <WorkspacePrototypeItemTitle>{[text.policyEngine, text.auditLedger, text.controlPosture][index] || text.policyEngine}</WorkspacePrototypeItemTitle>
                      <WorkspacePrototypeItemText>{item}</WorkspacePrototypeItemText>
                    </WorkspacePrototypeTextStack>
                  </WorkspacePrototypeActionCluster>
                </WorkspacePrototypeListItem>
              ))}
            </WorkspacePrototypeList>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.auditLedger}</WorkspacePanelHeading>
            <WorkspacePrototypeDataList>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.ledgerWindow}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{snapshot.topTags.length}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.ledgerScope}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{`${categoryCount} ${text.scopeLabel}`}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.complianceStatus}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{policyScore.toFixed(1)}</WorkspacePrototypeDataValue>
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
            <WorkspacePanelHeading>{text.operationalControls}</WorkspacePanelHeading>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/access"))}>{text.access}</Button>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/integrations"))}>{text.integrations}</Button>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/incidents"))}>{text.incidents}</Button>
              <Button onClick={() => onNavigate(pageNavigator.toAdmin("/admin/ops/audit-export"))}>{text.audit}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.controlPosture}</WorkspacePanelHeading>
            <WorkspacePrototypeDataList>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.lifecycleActive}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{activeKeys}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.lifecycleExpiring}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{expiringKeys}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.lifecycleRotation}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>72h</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.statusAccess}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{openIncidents}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
            </WorkspacePrototypeDataList>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.incidentResponse}</WorkspacePanelHeading>
            <WorkspacePrototypeList>
              {[text.responseCapture, text.responseReview, text.responseDrill].map((item, index) => (
                <WorkspacePrototypeListItem key={item}>
                  <WorkspacePrototypeActionCluster>
                    <WorkspacePrototypeMarker>{String(index + 1).padStart(2, "0")}</WorkspacePrototypeMarker>
                    <WorkspacePrototypeTextStack>
                      <WorkspacePrototypeItemTitle>{text.incidentResponse}</WorkspacePrototypeItemTitle>
                      <WorkspacePrototypeItemText>{item}</WorkspacePrototypeItemText>
                    </WorkspacePrototypeTextStack>
                  </WorkspacePrototypeActionCluster>
                </WorkspacePrototypeListItem>
              ))}
            </WorkspacePrototypeList>
            {snapshot.queueEntries.length === 0 ? <WorkspaceMutedText>{workspaceText.emptyQueue}</WorkspaceMutedText> : null}
          </WorkspaceSurfaceCard>
        </WorkspacePrototypePanelStack>
      </WorkspacePrototypePanelGrid>
    </WorkspacePrototypePageShell>
  );
}
