import { useEffect, useMemo, useState } from "react";

import { SessionUser } from "../lib/api";
import WorkspaceSidebarMenu from "../components/WorkspaceSidebarMenu";
import { createGlobalUserControlService } from "../lib/globalUserControlService";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { PrototypeUtilityShell } from "./prototypeCssInJs";
import { isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { buildWorkspaceSnapshot } from "./WorkspaceCenterPage.helpers";
import {
  buildWorkspaceSidebarNavigation,
  collapseWorkspaceSidebarGroupsForTopbar,
  resolveWorkspaceSidebarActiveGroupID,
  resolveWorkspaceSidebarPrimaryGroupEntries,
  resolveWorkspaceSectionMenuItemID,
  resolveWorkspaceSectionPage,
} from "./WorkspaceCenterPage.navigation";
import {
  buildWorkspaceCenterTopbarPrimaryActions,
  buildWorkspaceCenterTopbarUtilityActions
} from "./WorkspaceCenterPage.topbar";
import { buildWorkspaceTopbarMenuActions } from "./WorkspaceTopbarMenuActions.helpers";
import WorkspaceTopbar from "./WorkspaceTopbar";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import WorkspaceDashboardPageContent from "./WorkspaceDashboardPageContent";
import { WorkspaceContentLayout } from "./WorkspaceCenterPage.styles";
import { WorkspacePrototypePageGrid } from "./WorkspacePrototypePageShell.styles";

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
  const activeSectionPage = useMemo(() => resolveWorkspaceSectionPage(currentPath), [currentPath]);
  const activeWorkspaceMenuID = useMemo(() => resolveWorkspaceSectionMenuItemID(currentPath), [currentPath]);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degradedMessage, setDegradedMessage] = useState("");
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof loadMarketplaceWithFallback>>["payload"] | null>(null);

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

  const snapshot = useMemo(() => buildWorkspaceSnapshot({ payload, locale }), [locale, payload]);

  const topbarUtilityActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarUtilityActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        hasSessionUser: Boolean(sessionUser)
      }),
    [onNavigate, pageNavigator.toPublic, sessionUser]
  );

  const allSidebarGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        sectionMode: "workspace-route"
      }),
    [text, pageNavigator.toPublic, pageNavigator.toAdmin]
  );
  const sidebarGroups = useMemo(() => allSidebarGroups, [allSidebarGroups]);
  const activeSidebarGroupID = useMemo(
    () => resolveWorkspaceSidebarActiveGroupID(sidebarGroups, activeWorkspaceMenuID),
    [activeWorkspaceMenuID, sidebarGroups]
  );
  const [selectedSidebarPrimaryGroupID, setSelectedSidebarPrimaryGroupID] = useState(activeSidebarGroupID);
  useEffect(() => {
    setSelectedSidebarPrimaryGroupID(activeSidebarGroupID);
  }, [activeSidebarGroupID]);
  const effectiveSidebarGroupID = selectedSidebarPrimaryGroupID || activeSidebarGroupID;
  const activeSidebarGroup = useMemo(
    () => sidebarGroups.find((group) => group.id === effectiveSidebarGroupID) || sidebarGroups[0] || null,
    [effectiveSidebarGroupID, sidebarGroups]
  );
  const sidebarPrimaryEntries = useMemo(() => resolveWorkspaceSidebarPrimaryGroupEntries(sidebarGroups), [sidebarGroups]);
  const topbarMenuGroups = useMemo(
    () => collapseWorkspaceSidebarGroupsForTopbar(sidebarGroups, text.sidebarSectionsTitle),
    [sidebarGroups, text.sidebarSectionsTitle]
  );
  const workspaceMenuPrimaryActions = useMemo(() => {
    return buildWorkspaceTopbarMenuActions({
      sidebarGroups: topbarMenuGroups,
      activeMenuID: activeWorkspaceMenuID,
      onNavigate,
      fallbackPath: pageNavigator.toPublic("/workspace")
    });
  }, [activeWorkspaceMenuID, onNavigate, pageNavigator, topbarMenuGroups]);
  const isDashboardRoute = activeSectionPage === "overview";
  const topbarPrimaryActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarPrimaryActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        hasSessionUser: Boolean(sessionUser),
        labels: {
          categories: text.navCategories,
          rankings: text.navRankings,
          top: text.navTop,
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
      text.openMarketplace,
      text.openDashboard,
      text.signIn,
      workspaceMenuPrimaryActions
    ]
  );

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
  const lightBrandSubtitle = locale === "zh" ? "\u7528\u6237\u95e8\u6237" : "User Portal";
  const topbarBrandTitle = "SkillsIndex";
  const topbarBrandSubtitle = isLightTheme ? lightBrandSubtitle : text.brandSubtitle;
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${isLightTheme ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home${isLightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />

      <div className={rootClassName}>
        <WorkspaceTopbar
          locale={locale}
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
            {isDashboardRoute ? (
              <WorkspaceDashboardPageContent
                text={text}
                locale={locale}
                loading={loading}
                error={error}
                degradedMessage={degradedMessage}
                snapshot={snapshot}
              />
            ) : (
              <WorkspacePrototypePageGrid>
                <WorkspaceSidebarMenu
                  sidebarTitle={text.sidebarMenuTitle}
                  sidebarHint=""
                  primaryGroupTitle={text.sidebarMenuTitle}
                  primaryEntries={sidebarPrimaryEntries}
                  activeSidebarGroupID={effectiveSidebarGroupID}
                  activeSidebarGroup={activeSidebarGroup}
                  activeMenuID={activeWorkspaceMenuID}
                  onSelectPrimaryGroup={(entry) => {
                    setSelectedSidebarPrimaryGroupID(entry.groupID);
                    onNavigate(entry.target);
                  }}
                  onSelectMenuItem={(item) => onNavigate(item.target)}
                />

                <WorkspaceCenterPageContent
                  text={text}
                  locale={locale}
                  loading={loading}
                  error={error}
                  degradedMessage={degradedMessage}
                  snapshot={snapshot}
                  activeSectionPage={activeSectionPage}
                  onNavigate={onNavigate}
                  toPublicPath={pageNavigator.toPublic}
                  toAdminPath={pageNavigator.toAdmin}
                />
              </WorkspacePrototypePageGrid>
            )}
          </WorkspaceContentLayout>
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
