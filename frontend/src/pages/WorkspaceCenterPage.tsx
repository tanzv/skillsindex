import { Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";

import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import { buildLightTopbarPrimaryActions, buildLightTopbarUtilityActions, type TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import PublicStandardTopbar from "./PublicStandardTopbar";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { PrototypeUtilityShell } from "./prototypeCssInJs";
import { isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { buildWorkspaceCommandPreview, buildWorkspaceSnapshot, filterWorkspaceQueue } from "./WorkspaceCenterPage.helpers";
import { buildWorkspaceSidebarNavigation, type WorkspaceSidebarItem } from "./WorkspaceCenterPage.navigation";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import {
  WorkspaceContentLayout,
  WorkspaceSidebarCard,
  WorkspaceSidebarGroup,
  WorkspaceSidebarGroupTitle,
  WorkspaceSidebarItemButton
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

  const topbarPrimaryActions = useMemo<TopbarActionItem[]>(
    () =>
      buildLightTopbarPrimaryActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        labels: {
          categoryNav: text.navCategories,
          downloadRankingNav: text.navRankings,
          workspaceNav: text.navWorkspace,
          executionNav: text.navRollout,
          syncNav: text.navGovernance,
          securityNav: text.navCategories,
          developerNav: text.navRankings
        },
        activeActionID: "workspace",
        primaryActionSpecs: [
          { id: "workspace", label: text.navWorkspace, routePath: "/workspace", tone: "highlight" },
          { id: "category", label: text.navCategories, routePath: "/categories", tone: "subtle", className: "is-category-action" },
          {
            id: "download-ranking",
            label: text.navRankings,
            routePath: "/rankings",
            tone: "default",
            className: "is-download-ranking-action",
            badge: "TOP"
          },
          { id: "rollout", label: text.navRollout, routePath: "/rollout", tone: "default" },
          { id: "governance", label: text.navGovernance, routePath: "/governance", tone: "subtle" }
        ]
      }),
    [
      onNavigate,
      pageNavigator.toPublic,
      text.navCategories,
      text.navGovernance,
      text.navRankings,
      text.navRollout,
      text.navWorkspace
    ]
  );

  const topbarUtilityActions = useMemo(
    () =>
      buildLightTopbarUtilityActions({
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
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${isLightTheme ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home${isLightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />

      <div className={rootClassName}>
        <PublicStandardTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle="SkillsIndex"
          brandSubtitle={text.brandSubtitle}
          onBrandClick={() => onNavigate(pageNavigator.toPublic("/"))}
          isLightTheme={isLightTheme}
          primaryActions={topbarPrimaryActions}
          utilityActions={topbarUtilityActions}
          statusLabel={sessionUser ? "Signed In" : "Signed Out"}
          ctaLabel={sessionUser ? text.openDashboard : text.signIn}
          onCtaClick={() => onNavigate(sessionUser ? pageNavigator.toAdmin("/admin/overview") : pageNavigator.toPublic("/login"))}
        />

        <PrototypeUtilityShell>
          <WorkspaceContentLayout>
            <WorkspaceSidebarCard aria-label={text.sidebarMenuTitle}>
              <div style={{ display: "grid", gap: 4 }}>
                <Typography.Title level={5} style={{ margin: 0, color: "var(--si-color-text-primary)" }}>
                  {text.sidebarMenuTitle}
                </Typography.Title>
                <Typography.Paragraph style={{ margin: 0, color: "var(--si-color-text-secondary)", fontSize: "0.78rem" }}>
                  {text.sidebarMenuHint}
                </Typography.Paragraph>
              </div>

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
