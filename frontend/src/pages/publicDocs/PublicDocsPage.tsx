import { useCallback, useEffect, useMemo, useState } from "react";

import { SessionUser, buildServerURL } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import MarketplacePageBreadcrumb, { type MarketplacePageBreadcrumbItem } from "../../components/MarketplacePageBreadcrumb";
import MarketplaceHomePageStyles from "../marketplaceHome/MarketplaceHomePage.styles";
import MarketplaceHomeLocaleThemeSwitch from "../marketplaceHome/MarketplaceHomeLocaleThemeSwitch";
import { marketplaceHomeCopy } from "../marketplaceHome/MarketplaceHomePage.copy";
import { buildMarketplaceTopbarActionBundle } from "../marketplaceHome/MarketplaceHomePage.lightTopbar";
import { buildMarketplaceWorkspaceAccessRightRegistrations } from "../marketplacePublic/MarketplaceTopbarRightRegistrations";
import MarketplaceTopbar from "../marketplacePublic/MarketplaceTopbar";
import { PrototypeUtilityShell } from "../prototype/prototypeCssInJs";
import { publicDocsPageCopy } from "./PublicDocsPage.copy";
import { resolvePublicRankingCopy } from "../publicRanking/PublicRankingPage.copy";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { createPrototypePalette, isLightPrototypePath } from "../prototype/prototypePageTheme";
import { buildShellStageClassName } from "../prototype/pageShellLayoutContract";
import { buildDocsByKey, buildEndpointMetadata, buildPublicDocsStats } from "./PublicDocsPage.helpers";
import { PublicDocsHeroCard, PublicDocsMainPanel } from "./PublicDocsPage.sections";

interface PublicDocsPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  sessionUser: SessionUser | null;
}

export default function PublicDocsPage({
  locale,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  sessionUser
}: PublicDocsPageProps) {
  const text = publicDocsPageCopy[locale];
  const currentPath = window.location.pathname;
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const lightMode = isLightPrototypePath(currentPath);
  const topbarThemeMode: ThemeMode = lightMode ? "light" : "dark";
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const shellClassName = buildShellStageClassName({ isMobileLayout, isLightTheme: lightMode });
  const rootClassName = `marketplace-home is-docs-page${lightMode ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;

  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const toPublicPath = navigator.toPublic;
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const topbarCopy = useMemo(() => resolvePublicRankingCopy(locale).topbar, [locale]);
  const topbarLocaleCopy = useMemo(() => marketplaceHomeCopy[locale] || marketplaceHomeCopy.en, [locale]);
  const docsByKey = useMemo(() => buildDocsByKey(text.docs), [text.docs]);
  const docsStats = useMemo(() => buildPublicDocsStats(text.docs), [text.docs]);
  const endpointMetadata = useMemo(() => buildEndpointMetadata(buildServerURL), []);

  const handleTopbarAuthAction = useCallback((): void => {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
  }, [onLogout, onNavigate, sessionUser, toPublicPath]);

  const topbarActionBundle = useMemo(
    () =>
      buildMarketplaceTopbarActionBundle({
        onNavigate,
        toPublicPath,
        locale,
        hasSessionUser: Boolean(sessionUser),
        authActionLabel: sessionUser ? topbarLocaleCopy.signOut : topbarLocaleCopy.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, locale, onNavigate, sessionUser, toPublicPath, topbarLocaleCopy.signIn, topbarLocaleCopy.signOut]
  );

  const topbarRightRegistrations = useMemo(
    () =>
      buildMarketplaceWorkspaceAccessRightRegistrations({
        sessionUser,
        signedInLabel: topbarLocaleCopy.signedIn,
        signedOutLabel: topbarLocaleCopy.signedOut,
        workspaceLabel: topbarLocaleCopy.openWorkspace,
        signInLabel: topbarLocaleCopy.signIn,
        onNavigate,
        toPublicPath
      }),
    [onNavigate, sessionUser, toPublicPath, topbarLocaleCopy.openWorkspace, topbarLocaleCopy.signIn, topbarLocaleCopy.signedIn, topbarLocaleCopy.signedOut]
  );

  const breadcrumbItems = useMemo<MarketplacePageBreadcrumbItem[]>(
    () => [
      {
        key: "home",
        label: "SkillsIndex",
        onClick: () => onNavigate(navigator.toPublic("/"))
      },
      {
        key: "current",
        label: text.title
      }
    ],
    [navigator, onNavigate, text.title]
  );

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

  const openExternal = useCallback((path: string): void => {
    window.open(buildServerURL(path), "_blank", "noopener,noreferrer");
  }, []);

  const openInApp = useCallback(
    (path: string): void => {
      onNavigate(navigator.toApp(path));
    },
    [navigator, onNavigate]
  );

  const openMarketplace = useCallback(() => {
    onNavigate(navigator.toPublic("/"));
  }, [navigator, onNavigate]);

  const openDashboard = useCallback(() => {
    onNavigate(sessionUser ? navigator.toAdmin("/admin/overview") : navigator.toPublic("/login"));
  }, [navigator, onNavigate, sessionUser]);

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />
      <div className={rootClassName}>
        <MarketplaceTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle="SkillsIndex"
          brandSubtitle={topbarCopy.brandSubtitle}
          onBrandClick={openMarketplace}
          isLightTheme={lightMode}
          primaryActions={topbarActionBundle.primaryActions}
          utilityActions={topbarActionBundle.utilityActions}
          rightRegistrations={topbarRightRegistrations}
          localeThemeSwitch={
            <MarketplaceHomeLocaleThemeSwitch
              locale={locale}
              currentThemeMode={topbarThemeMode}
              onThemeModeChange={onThemeModeChange}
              onLocaleChange={onLocaleChange}
            />
          }
        />

        <PrototypeUtilityShell>
          <MarketplacePageBreadcrumb
            items={breadcrumbItems}
            ariaLabel="Docs page breadcrumb"
            testIdPrefix="docs-page-breadcrumb"
          />

          <PublicDocsHeroCard
            text={text}
            palette={palette}
            stats={docsStats}
            isSessionUser={Boolean(sessionUser)}
            onOpenMarketplace={openMarketplace}
            onOpenDashboard={openDashboard}
          />

          <PublicDocsMainPanel
            text={text}
            palette={palette}
            docsByKey={docsByKey}
            endpointMetadata={endpointMetadata}
            onOpenExternal={openExternal}
            onOpenInApp={openInApp}
          />
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
