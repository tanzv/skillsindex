import { useEffect, useMemo, useState } from "react";

import { PublicMarketplaceResponse, SessionUser } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import GovernanceCenterPageContent, { type GovernanceCenterPageContentText } from "./GovernanceCenterPageContent";
import { buildWorkspaceSnapshot } from "../workspace/WorkspaceCenterPage.helpers";
import { buildWorkspaceSidebarNavigation } from "../workspace/WorkspaceCenterPage.navigation";
import { getWorkspaceCenterCopy } from "../workspace/WorkspaceCenterPage.copy";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import WorkspacePrototypePageShell from "../workspace/WorkspacePrototypePageShell";

interface GovernanceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

const baseCopy: GovernanceCenterPageContentText & {
  loading: string;
  requestFailed: string;
  degradedData: string;
} = {
  title: "Governance Center",
  subtitle: "Coordinate policy guardrails, audit signals, and operator controls without leaving the workspace navigation stack.",
  eyebrow: "Control Plane",
  loading: "Loading governance center",
  requestFailed: "Request failed",
  degradedData: "Live governance data is unavailable. Some workspace insights are currently unavailable.",
  policyEngine: "Policy Engine",
  auditLedger: "Audit Ledger",
  controlPosture: "Control Posture",
  operationalControls: "Operational Controls",
  incidentResponse: "Incident Response",
  controlVisibilityTitle: "Visibility Gates",
  controlVisibility: "Visibility gates stay attached to every queue candidate and destination surface.",
  controlSyncTitle: "Synchronization Checks",
  controlSync: "Synchronization checks verify repository lineage, records parity, and import policy alignment.",
  controlAccessTitle: "Access Windows",
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
  responseCaptureTitle: "Capture",
  responseCapture: "Capture policy drift, operator overrides, and rollback triggers in one timeline.",
  responseReviewTitle: "Review",
  responseReview: "Keep reviewer assignment, evidence, and remediation actions grouped by control family.",
  responseDrillTitle: "Drill",
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
      sidebarTitle={workspaceText.sidebarMenuTitle}
      eyebrow={text.eyebrow}
      title={text.title}
      subtitle={text.subtitle}
      hideSummaryHeader
      loading={loading}
      loadingText={text.loading}
      error={error}
      notice={degradedMessage}
    >
      <GovernanceCenterPageContent
        text={text}
        workspaceText={workspaceText}
        snapshot={snapshot}
        onNavigate={onNavigate}
        toPublicPath={pageNavigator.toPublic}
        toAdminPath={pageNavigator.toAdmin}
      />
    </WorkspacePrototypePageShell>
  );
}
