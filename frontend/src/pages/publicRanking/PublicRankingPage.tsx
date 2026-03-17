import { Alert, Spin } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicMarketplaceResponse, SessionUser } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import { ThemeMode } from "../../lib/themeModePath";
import MarketplacePageBreadcrumb, { type MarketplacePageBreadcrumbItem } from "../../components/MarketplacePageBreadcrumb";
import MarketplaceHomeLocaleThemeSwitch from "../marketplaceHome/MarketplaceHomeLocaleThemeSwitch";
import {
  buildMarketplaceTopbarActionBundle
} from "../marketplaceHome/MarketplaceHomePage.lightTopbar";
import { marketplaceHomeCopy } from "../marketplaceHome/MarketplaceHomePage.copy";
import { buildMarketplaceFallback } from "../marketplaceHome/MarketplaceHomePage.fallback";
import { buildMarketplaceWorkspaceAccessRightRegistrations } from "../marketplacePublic/MarketplaceTopbarRightRegistrations";
import MarketplaceHomePageStyles from "../marketplaceHome/MarketplaceHomePage.styles";
import MarketplaceTopbar from "../marketplacePublic/MarketplaceTopbar";
import {
  PrototypeUtilityLoading,
  PrototypeUtilityPanel,
  PrototypeUtilityShell
} from "../prototype/prototypeCssInJs";
import { buildEmptyMarketplacePayload, loadMarketplaceWithFallback, resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { isLightPrototypePath } from "../prototype/prototypePageTheme";
import { buildShellStageClassName } from "../prototype/pageShellLayoutContract";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import {
  RankingSortKey,
  buildRankingCategoriesPath,
  buildRankingSkillPath,
  buildRankingSummaryMetrics,
  resolveRankingSourceItems,
  sortRankingItems,
  splitRankingSections
} from "./PublicRankingPage.helpers";
import { resolvePublicRankingCopy } from "./PublicRankingPage.copy";
import { PublicRankingContentPanel } from "./PublicRankingPage.sections";

export interface PublicRankingPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  sessionUser: SessionUser | null;
}

export default function PublicRankingPage({
  locale,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  sessionUser
}: PublicRankingPageProps) {
  const currentPath = window.location.pathname;
  const text = resolvePublicRankingCopy(locale);
  const [sortKey, setSortKey] = useState<RankingSortKey>("stars");
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const lightTheme = isLightPrototypePath(currentPath);
  const topbarThemeMode: ThemeMode = lightTheme ? "light" : "dark";
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const shellClassName = buildShellStageClassName({ isMobileLayout, isLightTheme: lightTheme });
  const rootClassName = `marketplace-home is-ranking-page${lightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const toPublicPath = navigator.toPublic;
  const topbarLocaleCopy = useMemo(() => marketplaceHomeCopy[locale] || marketplaceHomeCopy.en, [locale]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const fallbackPayload = useMemo(
    () => buildMarketplaceFallback({ sort: "stars", page: 1 }, locale, sessionUser),
    [locale, sessionUser]
  );
  const emptyLivePayload = useMemo(
    () => buildEmptyMarketplacePayload({ sort: "stars", page: 1 }, sessionUser),
    [sessionUser]
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);

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
    setErrorMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "stars", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setPayload(result.payload);
        setErrorMessage(result.degraded ? result.errorMessage || text.loadError : "");
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setPayload(dataMode === "live" ? emptyLivePayload : fallbackPayload);
        setErrorMessage(error instanceof Error ? error.message : text.loadError);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, emptyLivePayload, fallbackPayload, locale, sessionUser, text.loadError]);

  const sourceItems = useMemo(() => resolveRankingSourceItems(payload, fallbackPayload), [fallbackPayload, payload]);
  const rankedItems = useMemo(() => sortRankingItems(sourceItems, sortKey).slice(0, 10), [sourceItems, sortKey]);
  const rankingSections = useMemo(() => splitRankingSections(rankedItems), [rankedItems]);
  const rankingSummary = useMemo(() => buildRankingSummaryMetrics(rankedItems), [rankedItems]);
  const categoriesPath = useMemo(() => buildRankingCategoriesPath(currentPath), [currentPath]);
  const toSkillPath = useCallback((skillID: number) => buildRankingSkillPath(currentPath, skillID), [currentPath]);

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
        activeActionID: "download-ranking",
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
    [
      onNavigate,
      sessionUser,
      toPublicPath,
      topbarLocaleCopy.openWorkspace,
      topbarLocaleCopy.signIn,
      topbarLocaleCopy.signedIn,
      topbarLocaleCopy.signedOut
    ]
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

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />
      <div className={rootClassName}>
        <MarketplaceTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle="SkillsIndex"
          brandSubtitle={text.topbar.brandSubtitle}
          onBrandClick={() => onNavigate(navigator.toPublic("/"))}
          isLightTheme={lightTheme}
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
            ariaLabel="Ranking page breadcrumb"
            testIdPrefix="ranking-page-breadcrumb"
          />

          {errorMessage ? <Alert type="warning" showIcon message={errorMessage} /> : null}

          {loading ? (
            <PrototypeUtilityPanel>
              <PrototypeUtilityLoading>
                <Spin size="large" />
              </PrototypeUtilityLoading>
            </PrototypeUtilityPanel>
          ) : null}

          {!loading ? (
            <PublicRankingContentPanel
              text={text}
              locale={locale}
              isMobileLayout={isMobileLayout}
              sortKey={sortKey}
              rankingSummary={rankingSummary}
              rankingSections={rankingSections}
              rankedItemsCount={rankedItems.length}
              categoriesPath={categoriesPath}
              onSortKeyChange={setSortKey}
              onNavigate={onNavigate}
              toSkillPath={toSkillPath}
            />
          ) : null}
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
