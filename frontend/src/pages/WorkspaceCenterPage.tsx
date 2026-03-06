import { message } from "antd";
import { useEffect, useMemo, useState } from "react";

import { SessionUser } from "../lib/api";
import { createGlobalUserControlService } from "../lib/globalUserControlService";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { PrototypeUtilityShell } from "./prototypeCssInJs";
import { isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { buildWorkspaceCommandPreview, buildWorkspaceSnapshot, filterWorkspaceQueue } from "./WorkspaceCenterPage.helpers";
import {
  buildWorkspaceSidebarNavigation,
  flattenWorkspaceSidebarPrimaryMenu,
  type WorkspaceSidebarPrimaryMenuItem
} from "./WorkspaceCenterPage.navigation";
import {
  buildWorkspaceCenterTopbarPrimaryActions,
  buildWorkspaceCenterTopbarUtilityActions
} from "./WorkspaceCenterPage.topbar";
import WorkspaceTopbar from "./WorkspaceTopbar";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import {
  WorkspaceContentLayout
} from "./WorkspaceCenterPage.styles";
import { WorkspaceQueueFilter } from "./WorkspaceCenterPage.types";

interface WorkspaceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

export default function WorkspaceCenterPage({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: WorkspaceCenterPageProps) {
  const text = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const isLightTheme = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degradedMessage, setDegradedMessage] = useState("");
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof loadMarketplaceWithFallback>>["payload"] | null>(null);
  const [queueFilter, setQueueFilter] = useState<WorkspaceQueueFilter>("all");
  const [selectedQueueID, setSelectedQueueID] = useState<number>(0);
  const [activeWorkspaceMenuID, setActiveWorkspaceMenuID] = useState("section-overview");

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const topbarUtilityActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarUtilityActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        hasSessionUser: Boolean(sessionUser)
      }),
    [onNavigate, pageNavigator.toPublic, sessionUser]
  );

  const sidebarGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin
      }),
    [text, pageNavigator.toPublic, pageNavigator.toAdmin]
  );
  const sidebarPrimaryMenuItems = useMemo(
    () => flattenWorkspaceSidebarPrimaryMenu(sidebarGroups),
    [sidebarGroups]
  );

  function handleWorkspaceMenuSelect(item: WorkspaceSidebarPrimaryMenuItem): void {
    if (!item.target || item.kind === "label") {
      return;
    }

    setActiveWorkspaceMenuID(item.id);

    if (item.kind === "route") {
      onNavigate(item.target);
      return;
    }

    const sectionElement = document.getElementById(item.target);
    if (!sectionElement) {
      return;
    }
    sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const workspaceMenuPrimaryActions = useMemo(() => {
    const menuLabelAction = {
      id: "workspace-menu-label",
      label: text.sidebarMenuTitle,
      disabled: true,
      tone: "subtle" as const,
      className: "is-menu-label is-menu-title",
      onClick: () => undefined
    };
    const menuHintAction = {
      id: "workspace-menu-hint",
      label: text.sidebarMenuHint,
      disabled: true,
      tone: "subtle" as const,
      className: "is-menu-label is-menu-hint",
      onClick: () => undefined
    };
    const alertsAction = {
      id: "workspace-menu-alerts",
      label: `${snapshot.metrics.alerts} ${text.alerts}`,
      disabled: true,
      tone: "default" as const,
      className: "is-menu-metric is-alert-metric",
      onClick: () => undefined
    };
    const healthScoreAction = {
      id: "workspace-menu-health-score",
      label: `${snapshot.metrics.healthScore.toFixed(1)} ${text.healthScore}`,
      disabled: true,
      tone: "default" as const,
      className: "is-menu-metric is-health-score-metric",
      onClick: () => undefined
    };

    const registeredMenuActions = sidebarPrimaryMenuItems.map((item) => ({
      id: item.id,
      label: item.label,
      active: item.kind !== "label" && item.id === activeWorkspaceMenuID,
      disabled: item.kind === "label",
      tone: item.kind === "label" ? ("subtle" as const) : ("default" as const),
      className: item.kind === "label" ? "is-menu-label is-menu-group-label" : "is-menu-entry",
      onClick: () => handleWorkspaceMenuSelect(item)
    }));

    return [menuLabelAction, menuHintAction, alertsAction, healthScoreAction, ...registeredMenuActions];
  }, [
    activeWorkspaceMenuID,
    sidebarPrimaryMenuItems,
    snapshot.metrics.alerts,
    snapshot.metrics.healthScore,
    text.alerts,
    text.healthScore,
    text.sidebarMenuHint,
    text.sidebarMenuTitle
  ]);

  const topbarPrimaryActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarPrimaryActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        hasSessionUser: Boolean(sessionUser),
        labels: {
          navCategories: text.navCategories,
          navRankings: text.navRankings,
          navTop: text.navTop,
          openMarketplace: text.openMarketplace,
          openDashboard: text.openDashboard,
          signIn: text.signIn
        },
        extraPrimaryActions: workspaceMenuPrimaryActions
      }),
    [
      onNavigate,
      pageNavigator.toAdmin,
      pageNavigator.toPublic,
      sessionUser,
      text.navCategories,
      text.navRankings,
      text.navTop,
      text.openDashboard,
      text.openMarketplace,
      text.signIn,
      workspaceMenuPrimaryActions
    ]
  );

  async function handleCopyCommandPreview(): Promise<void> {
    try {
      await window.navigator.clipboard.writeText(commandPreview);
      void message.success(text.copySuccess);
    } catch {
      void message.error(text.copyFailed);
    }
  }

  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const currentThemeMode: ThemeMode = isLightTheme ? "light" : "dark";
  const userControlService = useMemo(
    () =>
      createGlobalUserControlService({
        locale,
        themeMode: currentThemeMode,
        onThemeModeChange,
        onLocaleChange,
        onLogout
      }),
    [currentThemeMode, locale, onLocaleChange, onLogout, onThemeModeChange]
  );
  const lightBrandSubtitle = "User Portal";
  const topbarBrandTitle = "SkillsIndex";
  const topbarBrandSubtitle = isLightTheme ? lightBrandSubtitle : text.brandSubtitle;
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${isLightTheme ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home${isLightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;
  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />

      <div className={rootClassName}>
        <WorkspaceTopbar
          isLightTheme={isLightTheme}
          brandTitle={topbarBrandTitle}
          brandSubtitle={topbarBrandSubtitle}
          sessionUser={sessionUser}
          userControlService={userControlService}
          onBrandClick={() => onNavigate(pageNavigator.toPublic("/"))}
          primaryActions={topbarPrimaryActions}
          utilityActions={topbarUtilityActions}
          rightRegistrations={[]}
        />

        <PrototypeUtilityShell>
          <WorkspaceContentLayout>
            <WorkspaceCenterPageContent
              text={text}
              locale={locale}
              loading={loading}
              error={error}
              degradedMessage={degradedMessage}
              snapshot={snapshot}
              queueFilter={queueFilter}
              filteredQueue={filteredQueue}
              selectedQueueEntry={selectedQueueEntry}
              commandPreview={commandPreview}
              onNavigate={onNavigate}
              toPublicPath={pageNavigator.toPublic}
              toAdminPath={pageNavigator.toAdmin}
              onQueueFilterChange={setQueueFilter}
              onQueueSelect={setSelectedQueueID}
              onCopyCommandPreview={() => {
                void handleCopyCommandPreview();
              }}
            />
          </WorkspaceContentLayout>
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
