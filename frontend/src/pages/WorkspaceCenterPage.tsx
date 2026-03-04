import { Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";

import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import PublicStandardTopbar from "./PublicStandardTopbar";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { PrototypeUtilityShell } from "./prototypeCssInJs";
import { isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { buildWorkspaceCommandPreview, buildWorkspaceSnapshot, filterWorkspaceQueue } from "./WorkspaceCenterPage.helpers";
import { buildWorkspaceSidebarNavigation, type WorkspaceSidebarItem } from "./WorkspaceCenterPage.navigation";
import {
  buildWorkspaceCenterTopbarPrimaryActions,
  buildWorkspaceCenterTopbarUtilityActions
} from "./WorkspaceCenterPage.topbar";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import {
  WorkspaceContentLayout,
  WorkspaceSidebarCard,
  WorkspaceSidebarHeader,
  WorkspaceSidebarGroup,
  WorkspaceSidebarGroupTitle,
  WorkspaceSidebarHint,
  WorkspaceSidebarItemButton,
  WorkspaceSidebarMetaPill,
  WorkspaceSidebarMetaRow
} from "./WorkspaceCenterPage.styles";
import { WorkspaceQueueFilter } from "./WorkspaceCenterPage.types";

interface WorkspaceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

export default function WorkspaceCenterPage({ locale, currentPath, onNavigate, sessionUser }: WorkspaceCenterPageProps) {
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
  const [activeSidebarItemID, setActiveSidebarItemID] = useState("section-overview");

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

  const topbarPrimaryActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarPrimaryActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        labels: {
          navCategories: text.navCategories,
          navRankings: text.navRankings
        }
      }),
    [onNavigate, pageNavigator.toPublic, text.navCategories, text.navRankings]
  );

  const topbarUtilityActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarUtilityActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        hasSessionUser: Boolean(sessionUser),
        labels: {
          signIn: text.signIn,
          openDashboard: text.openDashboard
        }
      }),
    [onNavigate, pageNavigator.toAdmin, pageNavigator.toPublic, sessionUser, text.openDashboard, text.signIn]
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

  async function handleCopyCommandPreview(): Promise<void> {
    try {
      await window.navigator.clipboard.writeText(commandPreview);
      void message.success(text.copySuccess);
    } catch {
      void message.error(text.copyFailed);
    }
  }

  function handleSidebarItemSelect(item: WorkspaceSidebarItem): void {
    setActiveSidebarItemID(item.id);

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

  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const lightBrandSubtitle = "User Portal";
  const topbarBrandTitle = "SkillsIndex";
  const topbarBrandSubtitle = isLightTheme ? lightBrandSubtitle : text.brandSubtitle;
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${isLightTheme ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home${isLightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />

      <div className={rootClassName}>
        <PublicStandardTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle={topbarBrandTitle}
          brandSubtitle={topbarBrandSubtitle}
          onBrandClick={() => onNavigate(pageNavigator.toPublic("/"))}
          isLightTheme={isLightTheme}
          primaryActions={topbarPrimaryActions}
          utilityActions={topbarUtilityActions}
          statusLabel={sessionUser ? "Signed In" : "Signed Out"}
          secondaryCtaLabel={text.openMarketplace}
          onSecondaryCtaClick={() => onNavigate(pageNavigator.toPublic("/"))}
          ctaLabel={sessionUser ? text.openDashboard : text.signIn}
          onCtaClick={() => onNavigate(sessionUser ? pageNavigator.toAdmin("/admin/overview") : pageNavigator.toPublic("/login"))}
        />

        <PrototypeUtilityShell>
          <WorkspaceContentLayout>
            <WorkspaceSidebarCard aria-label={text.sidebarMenuTitle}>
              <WorkspaceSidebarHeader>
                <Typography.Title level={5} style={{ margin: 0, color: "var(--si-color-text-primary)" }}>
                  {text.sidebarMenuTitle}
                </Typography.Title>
                <WorkspaceSidebarHint>{text.sidebarMenuHint}</WorkspaceSidebarHint>
                <WorkspaceSidebarMetaRow>
                  <WorkspaceSidebarMetaPill $tone="accent">{`${snapshot.metrics.alerts} ${text.alerts}`}</WorkspaceSidebarMetaPill>
                  <WorkspaceSidebarMetaPill>{`${snapshot.metrics.healthScore.toFixed(1)} ${text.healthScore}`}</WorkspaceSidebarMetaPill>
                </WorkspaceSidebarMetaRow>
              </WorkspaceSidebarHeader>

              {sidebarGroups.map((group) => (
                <WorkspaceSidebarGroup key={group.id}>
                  <WorkspaceSidebarGroupTitle>{group.title}</WorkspaceSidebarGroupTitle>
                  <div style={{ display: "grid", gap: 6 }}>
                    {group.items.map((item) => (
                      <WorkspaceSidebarItemButton
                        key={item.id}
                        type="button"
                        $active={activeSidebarItemID === item.id}
                        onClick={() => handleSidebarItemSelect(item)}
                        aria-current={activeSidebarItemID === item.id ? "page" : undefined}
                      >
                        {item.label}
                      </WorkspaceSidebarItemButton>
                    ))}
                  </div>
                </WorkspaceSidebarGroup>
              ))}
            </WorkspaceSidebarCard>

            <WorkspaceCenterPageContent
              text={text}
              locale={locale}
              loading={loading}
              error={error}
              degradedMessage={degradedMessage}
              sessionUser={sessionUser}
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
