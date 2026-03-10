import { Alert, Spin } from "antd";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import WorkspaceSidebarMenu from "../../components/WorkspaceSidebarMenu";
import WorkspaceSecondarySidebarMenu from "../../components/WorkspaceSecondarySidebarMenu";
import type { WorkspaceSidebarMenuMetaItem } from "../../components/WorkspaceSidebarMenu.types";
import AppGlobalTopbar from "../../components/AppGlobalTopbar";
import { SessionUser } from "../../lib/api";
import { createGlobalUserControlService } from "../../lib/globalUserControlService";
import { AppLocale } from "../../lib/i18n";
import { createSystemUserControlRegistrations } from "../../lib/systemUserControlRegistrations";
import type { ThemeMode } from "../../lib/themeModePath";
import MarketplaceHomePageStyles from "../marketplaceHome/MarketplaceHomePage.styles";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import {
  collapseWorkspaceSidebarGroupsForTopbar,
  resolveWorkspaceSidebarActiveGroupID,
  resolveWorkspaceSidebarPrimaryGroupEntries,
  type WorkspaceSidebarGroup
} from "./WorkspaceCenterPage.navigation";
import {
  buildWorkspaceCenterTopbarPrimaryActions,
  buildWorkspaceCenterTopbarUtilityActions
} from "./WorkspaceCenterPage.topbar";
import {
  WorkspaceActionRow,
  WorkspaceHeroSubtitle,
  WorkspaceHeroTextStack,
  WorkspaceHeroTitle,
  WorkspaceMainColumn,
  WorkspaceMetricLabel,
  WorkspaceMetricValue
} from "./WorkspaceCenterPage.styles";
import {
  WorkspacePrototypeContentLayoutFrame,
  WorkspacePrototypeContentScroll,
  WorkspacePrototypeEyebrow,
  WorkspacePrototypePageGrid,
  WorkspacePrototypeRoot,
  WorkspacePrototypeStage,
  WorkspacePrototypeSummaryHeader,
  WorkspacePrototypeSummaryMetricCard,
  WorkspacePrototypeSummaryMetricGrid,
  WorkspacePrototypeUtilityFrame
} from "./WorkspacePrototypePageShell.styles";
import { buildWorkspaceTopbarMenuActions } from "./WorkspaceTopbarMenuActions.helpers";
import { resolveWorkspacePrototypeLayoutVariant } from "./WorkspacePrototypePageShell.helpers";
import { PrototypeLoadingCenter } from "../prototype/prototypeCssInJs";
import { isLightPrototypePath } from "../prototype/prototypePageTheme";
import { buildShellStageClassName } from "../prototype/pageShellLayoutContract";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

interface WorkspaceShellSummaryMetric {
  id: string;
  label: string;
  value: string;
}

interface WorkspacePrototypePageShellProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
  activeMenuID: string;
  sidebarGroups: WorkspaceSidebarGroup[];
  topbarMenuGroups?: WorkspaceSidebarGroup[];
  sidebarTitle?: string;
  sidebarHint?: string;
  sidebarMeta?: WorkspaceSidebarMenuMetaItem[];
  sidebarMode?: "auto" | "default" | "secondary";
  layoutVariant?: "default" | "full-width";
  mobileLayout?: boolean;
  showSidebar?: boolean;
  eyebrow?: string;
  title: string;
  subtitle: string;
  summaryMetrics?: WorkspaceShellSummaryMetric[];
  summaryActions?: ReactNode;
  hideSummaryHeader?: boolean;
  loading?: boolean;
  loadingText?: string;
  error?: string;
  notice?: string;
  success?: string;
  children: ReactNode;
}

export default function WorkspacePrototypePageShell({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout,
  activeMenuID,
  sidebarGroups,
  topbarMenuGroups,
  sidebarTitle,
  sidebarHint: _sidebarHint,
  sidebarMeta = [],
  sidebarMode = "auto",
  layoutVariant,
  mobileLayout,
  showSidebar = true,
  eyebrow,
  title,
  subtitle,
  summaryMetrics = [],
  summaryActions,
  hideSummaryHeader = false,
  loading = false,
  loadingText,
  error = "",
  notice = "",
  success = "",
  children
}: WorkspacePrototypePageShellProps) {
  const text = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const isLightTheme = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const currentThemeMode: ThemeMode = isLightTheme ? "light" : "dark";
  const resolvedMobileLayout = mobileLayout ?? /^\/mobile(\/|$)/.test(currentPath);
  const userControlRegistrations = useMemo(
    () =>
      sessionUser
        ? createSystemUserControlRegistrations({
            onNavigate,
            currentPath
          })
        : [],
    [currentPath, onNavigate, sessionUser]
  );
  const userControlService = useMemo(
    () =>
      createGlobalUserControlService({
        locale,
        themeMode: currentThemeMode,
        onThemeModeChange,
        onLocaleChange,
        onLogout,
        registrations: userControlRegistrations
      }),
    [currentThemeMode, locale, onLocaleChange, onLogout, onThemeModeChange, userControlRegistrations]
  );

  const effectiveTopbarMenuGroups = useMemo(
    () =>
      collapseWorkspaceSidebarGroupsForTopbar(
        topbarMenuGroups && topbarMenuGroups.length > 0 ? topbarMenuGroups : sidebarGroups,
        text.sidebarSectionsTitle
      ),
    [sidebarGroups, text.sidebarSectionsTitle, topbarMenuGroups]
  );

  const topbarPrimaryActions = useMemo(() => {
    const menuActions = buildWorkspaceTopbarMenuActions({
      sidebarGroups: effectiveTopbarMenuGroups,
      activeMenuID,
      onNavigate,
      fallbackPath: pageNavigator.toPublic("/workspace")
    });

    return buildWorkspaceCenterTopbarPrimaryActions({
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
      extraPrimaryActions: menuActions
    });
  }, [
    activeMenuID,
    effectiveTopbarMenuGroups,
    onNavigate,
    pageNavigator.toAdmin,
    pageNavigator.toPublic,
    sessionUser,
    text.navCategories,
    text.navRankings,
    text.navTop,
    text.openMarketplace,
    text.openDashboard,
    text.signIn
  ]);

  const topbarUtilityActions = useMemo(
    () =>
      buildWorkspaceCenterTopbarUtilityActions({
        onNavigate,
        toPublicPath: pageNavigator.toPublic,
        hasSessionUser: Boolean(sessionUser)
      }),
    [onNavigate, pageNavigator.toPublic, sessionUser]
  );

  const shellClassName = buildShellStageClassName({ isMobileLayout: resolvedMobileLayout, isLightTheme });
  const rootClassName = `marketplace-home is-workspace-shell${isLightTheme ? " is-light-theme" : ""}${resolvedMobileLayout ? " is-mobile" : ""}`;
  const activeSidebarGroupID = useMemo(
    () => resolveWorkspaceSidebarActiveGroupID(sidebarGroups, activeMenuID),
    [activeMenuID, sidebarGroups]
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
  const shouldRenderSidebar = showSidebar && sidebarGroups.length > 0;
  const shouldRenderSecondarySidebar =
    shouldRenderSidebar && (sidebarMode === "secondary" || (sidebarMode === "auto" && sidebarPrimaryEntries.length <= 1));
  const resolvedLayoutVariant = resolveWorkspacePrototypeLayoutVariant({
    layoutVariant,
    shouldRenderSecondarySidebar
  });
  const resolvedSidebarTitle = sidebarTitle || activeSidebarGroup?.title || text.sidebarMenuTitle;
  const resolvedSidebarHint = "";

  return (
    <WorkspacePrototypeStage className={shellClassName}>
      <MarketplaceHomePageStyles />

      <WorkspacePrototypeRoot className={rootClassName} $layoutVariant={resolvedLayoutVariant}>
        <AppGlobalTopbar
          locale={locale}
          isLightTheme={isLightTheme}
          brandTitle="SkillsIndex"
          brandSubtitle={isLightTheme ? (locale === "zh" ? "\u7528\u6237\u95e8\u6237" : "User Portal") : text.brandSubtitle}
          sessionUser={sessionUser}
          userControlService={userControlService}
          onBrandClick={() => onNavigate(pageNavigator.toPublic("/"))}
          primaryActions={topbarPrimaryActions}
          utilityActions={topbarUtilityActions}
          rightRegistrations={[]}
        />

        <WorkspacePrototypeUtilityFrame className="workspace-prototype-utility-frame" $layoutVariant={resolvedLayoutVariant}>
          <WorkspacePrototypeContentLayoutFrame>
            <WorkspacePrototypePageGrid $singleColumn={!shouldRenderSidebar}>
              {shouldRenderSidebar
                ? shouldRenderSecondarySidebar
                  ? (
                    <WorkspaceSecondarySidebarMenu
                      sidebarTitle={resolvedSidebarTitle}
                      sidebarHint={resolvedSidebarHint}
                      sidebarMeta={sidebarMeta}
                      sidebarGroup={activeSidebarGroup}
                      activeMenuID={activeMenuID}
                      onSelectMenuItem={(item) => onNavigate(item.target)}
                    />
                  )
                  : (
                    <WorkspaceSidebarMenu
                      sidebarTitle={resolvedSidebarTitle}
                      sidebarHint={resolvedSidebarHint}
                      sidebarMeta={sidebarMeta}
                      primaryGroupTitle={text.sidebarMenuTitle}
                      primaryEntries={sidebarPrimaryEntries}
                      activeSidebarGroupID={effectiveSidebarGroupID}
                      activeSidebarGroup={activeSidebarGroup}
                      activeMenuID={activeMenuID}
                      onSelectPrimaryGroup={(entry) => {
                        setSelectedSidebarPrimaryGroupID(entry.groupID);
                        onNavigate(entry.target);
                      }}
                      onSelectMenuItem={(item) => onNavigate(item.target)}
                    />
                  )
                : null}

              <WorkspacePrototypeContentScroll className="workspace-shell-content-scroll">
                <WorkspaceMainColumn>
                  {!hideSummaryHeader ? (
                    <WorkspaceSurfaceCard tone="hero">
                      <WorkspacePrototypeSummaryHeader>
                        <WorkspaceHeroTextStack>
                          {eyebrow ? <WorkspacePrototypeEyebrow>{eyebrow}</WorkspacePrototypeEyebrow> : null}
                          <WorkspaceHeroTitle>{title}</WorkspaceHeroTitle>
                          <WorkspaceHeroSubtitle>{subtitle}</WorkspaceHeroSubtitle>
                        </WorkspaceHeroTextStack>
                        {summaryActions ? <WorkspaceActionRow>{summaryActions}</WorkspaceActionRow> : null}
                      </WorkspacePrototypeSummaryHeader>

                      {summaryMetrics.length > 0 ? (
                        <WorkspacePrototypeSummaryMetricGrid>
                          {summaryMetrics.map((metric) => (
                            <WorkspacePrototypeSummaryMetricCard key={metric.id}>
                              <WorkspaceMetricLabel>{metric.label}</WorkspaceMetricLabel>
                              <WorkspaceMetricValue>{metric.value}</WorkspaceMetricValue>
                            </WorkspacePrototypeSummaryMetricCard>
                          ))}
                        </WorkspacePrototypeSummaryMetricGrid>
                      ) : null}
                    </WorkspaceSurfaceCard>
                  ) : null}

                  {notice ? <Alert type="warning" showIcon message={notice} /> : null}
                  {success ? <Alert type="success" showIcon message={success} /> : null}
                  {error ? <Alert type="error" showIcon message={error} /> : null}

                  {loading ? (
                    <PrototypeLoadingCenter>
                      <Spin description={loadingText || text.loading} />
                    </PrototypeLoadingCenter>
                  ) : (
                    children
                  )}
                </WorkspaceMainColumn>
              </WorkspacePrototypeContentScroll>
            </WorkspacePrototypePageGrid>
          </WorkspacePrototypeContentLayoutFrame>
        </WorkspacePrototypeUtilityFrame>
      </WorkspacePrototypeRoot>
    </WorkspacePrototypeStage>
  );
}
