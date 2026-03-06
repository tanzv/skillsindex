import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MarketplaceQueryParams,
  PublicMarketplaceResponse,
  SessionUser
} from "../lib/api";
import {
  appendMarketplaceSearchHistory,
  clearMarketplaceSearchHistory,
  readMarketplaceSearchHistory,
  type MarketplaceSearchHistoryEntry
} from "../lib/marketplaceSearchHistory";
import { AppLocale } from "../lib/i18n";
import {
  MarketplaceFilterForm,
  PrototypeCardEntry,
  buildMarketplacePath,
  buildPrototypeCardGroups,
  defaultFilterForm,
  parseQueryState
} from "./MarketplaceHomePage.helpers";
import { buildMergedLatestCards } from "./MarketplaceHomePage.cardAggregation";
import {
  mergeMarketplacePayloadForHomeAutoLoad,
  normalizeUnavailableLiveMarketplacePayload
} from "./MarketplaceHomeAutoLoad.helpers";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import MarketplaceHomeResultsContent from "./MarketplaceHomeResultsContent";
import {
  buildMarketplaceTopbarActionBundle
} from "./MarketplaceHomePage.lightTopbar";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import MarketplaceHomeSearchOverlay from "./MarketplaceHomeSearchOverlay";
import MarketplaceHomeSkillCard from "./MarketplaceHomeSkillCard";
import MarketplaceHomeTopStatsCard from "./MarketplaceHomeTopStatsCard";
import MarketplaceSearchStrip from "../components/MarketplaceSearchStrip";
import MarketplacePageBreadcrumb, { type MarketplacePageBreadcrumbItem } from "../components/MarketplacePageBreadcrumb";
import { buildMarketplaceWorkspaceAuthRightRegistrations } from "./MarketplaceTopbarRightRegistrations";
import { buildMarketplaceTrendPathData } from "./MarketplaceHomePage.trend";
import { normalizeFilterFormQuery } from "./MarketplacePublicQuery";
import MarketplacePublicPageShell from "./marketplacePublic/MarketplacePublicPageShell";
import MarketplaceTopbar from "./MarketplaceTopbar";
import {
  HomeChipFilter,
  MarketplaceHomeMode,
  resolveMarketplaceAutoLoadConfig,
  buildHomeChipFilters,
  resolveMarketplaceHomeMode,
  statsTrendBars
} from "./MarketplaceHomePage.config";
import { buildMarketplaceText } from "./marketplaceText";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { isLightPrototypePath } from "./prototypePageTheme";
import { loadMarketplaceWithFallback } from "./prototypeDataFallback";
import type { ThemeMode } from "../lib/themeModePath";

interface MarketplaceHomePageProps {
  locale: AppLocale;
  sessionUser: SessionUser | null;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  locationKey: string;
  isResultsPage?: boolean;
}

export default function MarketplaceHomePage({
  locale,
  sessionUser,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  locationKey,
  isResultsPage = false
}: MarketplaceHomePageProps) {
  const { t } = useTranslation();
  const text = useMemo(() => buildMarketplaceText(t), [t, locale]);
  const [data, setData] = useState<PublicMarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<MarketplaceFilterForm>(defaultFilterForm);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<MarketplaceSearchHistoryEntry[]>(() => readMarketplaceSearchHistory());
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const currentPath = window.location.pathname;
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [locationKey, currentPath]);
  const marketplaceBasePath = navigator.toPublic("/");
  const marketplaceResultsPath = navigator.toPublic("/results");
  const homeMode = useMemo<MarketplaceHomeMode>(
    () => resolveMarketplaceHomeMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE),
    []
  );
  const shouldForceLiveSearch = isResultsPage;
  const effectiveDataMode: MarketplaceHomeMode = shouldForceLiveSearch ? "live" : homeMode;
  const autoLoadConfig = useMemo(() => resolveMarketplaceAutoLoadConfig(import.meta.env), []);
  const queryState = useMemo(() => parseQueryState(window.location.search), [locationKey]);
  const effectiveQueryState = useMemo(
    () => ({
      ...queryState
    }),
    [queryState]
  );
  const fallbackData = useMemo(
    () => buildMarketplaceFallback(effectiveQueryState, locale, sessionUser),
    [effectiveQueryState, locale, sessionUser]
  );
  const hasLiveQueryConstraints = Boolean(
    effectiveQueryState.q ||
      effectiveQueryState.tags ||
      effectiveQueryState.category ||
      effectiveQueryState.subcategory ||
      Number(effectiveQueryState.page || 1) > 1
  );

  useEffect(() => {
    setForm({
      q: effectiveQueryState.q || "",
      tags: effectiveQueryState.tags || "",
      category: effectiveQueryState.category || "",
      subcategory: effectiveQueryState.subcategory || "",
      sort: effectiveQueryState.sort || "recent",
      mode: effectiveQueryState.mode || "keyword"
    });
  }, [effectiveQueryState]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadMarketplaceWithFallback({
      query: effectiveQueryState,
      locale,
      sessionUser,
      mode: effectiveDataMode,
      prototypeDelayMs: effectiveDataMode === "prototype" ? autoLoadConfig.prototypeDataDelayMs : 0
    })
      .then((result) => {
        if (!active) {
          return;
        }
        const payload =
          effectiveDataMode === "live" && result.degraded && hasLiveQueryConstraints
            ? normalizeUnavailableLiveMarketplacePayload(result.payload, effectiveQueryState.page)
            : result.payload;
        setData((previousPayload) =>
          mergeMarketplacePayloadForHomeAutoLoad({
            previousPayload,
            nextPayload: payload,
            nextQuery: effectiveQueryState
          })
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }
        const fallbackPayload =
          effectiveDataMode === "live" && hasLiveQueryConstraints
            ? normalizeUnavailableLiveMarketplacePayload(fallbackData, effectiveQueryState.page)
            : fallbackData;
        setData((previousPayload) =>
          mergeMarketplacePayloadForHomeAutoLoad({
            previousPayload,
            nextPayload: fallbackPayload,
            nextQuery: effectiveQueryState
          })
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    effectiveQueryState,
    fallbackData,
    effectiveDataMode,
    locale,
    sessionUser,
    autoLoadConfig.prototypeDataDelayMs,
    hasLiveQueryConstraints
  ]);

  useEffect(() => {
    if (!isResultsPage) {
      return;
    }
    setIsSearchOverlayOpen(false);
  }, [isResultsPage]);

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

  const resolvedData = data || fallbackData;
  const items = resolvedData.items || [];
  const currentPage = resolvedData.pagination.page || 1;
  const pageSize = resolvedData.pagination.page_size || 24;
  const totalPages = resolvedData.pagination.total_pages || 1;
  const trendPathData = useMemo(() => buildMarketplaceTrendPathData(statsTrendBars), []);

  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const isLightTheme = isLightPrototypePath(currentPath);
  const currentThemeMode: ThemeMode = isLightTheme ? "light" : "dark";
  const hasActiveHomeFilters = Boolean(
    effectiveQueryState.q ||
      effectiveQueryState.tags ||
      effectiveQueryState.category ||
      effectiveQueryState.subcategory
  );
  const shouldUseSkillPayloadForCards = homeMode !== "prototype" || isResultsPage || currentPage > 1 || hasActiveHomeFilters;
  const cardGroups = useMemo(
    () =>
      buildPrototypeCardGroups(items, locale, {
        theme: isLightTheme ? "light" : "dark",
        useSkillPayload: shouldUseSkillPayloadForCards
      }),
    [items, locale, isLightTheme, shouldUseSkillPayloadForCards]
  );
  const featuredCards = useMemo(() => cardGroups.featured.slice(0, 3), [cardGroups.featured]);
  const resultCards = useMemo(
    () =>
      buildMergedLatestCards({
        items,
        pageSize,
        locale,
        isLightTheme,
        useSkillPayload: shouldUseSkillPayloadForCards,
        fallbackLatestCards: cardGroups.latest
      }),
    [cardGroups.latest, isLightTheme, items, locale, pageSize, shouldUseSkillPayloadForCards]
  );
  const hotFilters = useMemo(() => buildHomeChipFilters(text), [text]);
  const resultsPageBreadcrumbItems = useMemo<MarketplacePageBreadcrumbItem[]>(
    () => [
      {
        key: "home",
        label: "SkillsIndex",
        onClick: () => onNavigate(marketplaceBasePath)
      },
      {
        key: "current",
        label: text.resultsTitle
      }
    ],
    [marketplaceBasePath, onNavigate, text.resultsTitle]
  );

  function toHomePath(): string { return marketplaceBasePath; }
  function toPublicPath(path: string): string { return navigator.toPublic(path); }

  function commitQuery(next: MarketplaceQueryParams, target: "home" | "results" = "results") {
    const basePath = target === "home" ? marketplaceBasePath : marketplaceResultsPath;
    const nextPath = buildMarketplacePath(normalizeFilterFormQuery(next as MarketplaceFilterForm), basePath);
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) {
      return;
    }
    onNavigate(nextPath);
  }

  function handleSearchSubmit() {
    if (!isResultsPage && !isSearchOverlayOpen) {
      setIsSearchOverlayOpen(true);
      return;
    }
    const normalizedForm = normalizeFilterFormQuery(form);
    setRecentSearches(
      appendMarketplaceSearchHistory({
        q: normalizedForm.q,
        tags: normalizedForm.tags
      })
    );
    setIsSearchOverlayOpen(false);
    commitQuery({ ...normalizedForm, page: 1 }, "results");
  }

  function handleSearchEntryOpen() {
    setIsSearchOverlayOpen(true);
  }

  function handleSearchInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    handleSearchSubmit();
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    commitQuery({ ...effectiveQueryState, page }, isResultsPage ? "results" : "home");
  }

  function handleSkillOpen(skillID: number | null) {
    setIsSearchOverlayOpen(false);
    if (skillID) {
      onNavigate(toPublicPath(`/skills/${skillID}`));
      return;
    }
    onNavigate(toHomePath());
  }

  function handleHotFilterApply(filter: HomeChipFilter) {
    const nextForm: MarketplaceFilterForm = {
      ...form,
      tags: filter.queryTags
    };
    const normalizedNextForm = normalizeFilterFormQuery(nextForm);
    setForm(nextForm);
    setRecentSearches(
      appendMarketplaceSearchHistory({
        q: normalizedNextForm.q,
        tags: normalizedNextForm.tags
      })
    );
    setIsSearchOverlayOpen(false);
    commitQuery({ ...normalizedNextForm, page: 1 }, "results");
  }

  function handleFilterFieldChange(field: keyof MarketplaceFilterForm, value: string) {
    const nextForm: MarketplaceFilterForm = {
      ...form,
      [field]: value
    };
    setForm(nextForm);
  }

  function handleResultsClose() {
    setIsSearchOverlayOpen(false);
  }

  function handleRecentSearchApply(entry: MarketplaceSearchHistoryEntry) {
    const nextForm: MarketplaceFilterForm = {
      ...form,
      q: entry.q,
      tags: entry.tags
    };
    const normalizedNextForm = normalizeFilterFormQuery(nextForm);
    setForm(nextForm);
    setRecentSearches(
      appendMarketplaceSearchHistory({
        q: normalizedNextForm.q,
        tags: normalizedNextForm.tags
      })
    );
    setIsSearchOverlayOpen(false);
    commitQuery({ ...normalizedNextForm, page: 1 }, "results");
  }

  function handleRecentSearchClear() {
    clearMarketplaceSearchHistory();
    setRecentSearches([]);
  }

  function handleTopbarAuthAction(): void {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
  }

  function handleTopbarConsoleAction(): void {
    onNavigate("/workspace");
  }

  const topbarActionBundle = useMemo(
    () =>
      buildMarketplaceTopbarActionBundle({
        onNavigate,
        toPublicPath,
        locale,
        hasSessionUser: Boolean(sessionUser),
        authActionLabel: sessionUser ? text.signOut : text.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, locale, onNavigate, sessionUser, text.signIn, text.signOut, toPublicPath]
  );
  const topbarRightRegistrations = useMemo(
    () =>
      buildMarketplaceWorkspaceAuthRightRegistrations({
        sessionUser,
        workspaceLabel: text.openWorkspace,
        signInLabel: text.signIn,
        signOutLabel: text.signOut,
        onWorkspaceClick: handleTopbarConsoleAction,
        onAuthClick: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, handleTopbarConsoleAction, sessionUser, text.openWorkspace, text.signIn, text.signOut]
  );
  const lightBrandTitle = "SkillsIndex";
  const lightBrandSubtitle = "User Portal";
  const topbarBrandTitle = isLightTheme ? lightBrandTitle : text.brandTitle;
  const topbarBrandSubtitle = isLightTheme ? lightBrandSubtitle : text.brandSubtitle;
  const rootClasses = [
    "marketplace-home",
    isResultsPage ? "is-results-page" : "",
    isLightTheme ? "is-light-theme" : "",
    isMobileLayout ? "is-mobile" : ""
  ]
    .filter(Boolean)
    .join(" ");

  function renderSkillCard(card: PrototypeCardEntry, key: string): JSX.Element {
    return <MarketplaceHomeSkillCard card={card} cardKey={key} onOpen={handleSkillOpen} />;
  }

  return (
    <MarketplacePublicPageShell
      isResultsStage={isResultsPage}
      isMobileLayout={isMobileLayout}
      isLightTheme={isLightTheme}
      rootClassName={rootClasses}
      rootTestId="marketplace-home-root"
    >
      <MarketplaceTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle={topbarBrandTitle}
        brandSubtitle={topbarBrandSubtitle}
        onBrandClick={() => onNavigate(toHomePath())}
        isLightTheme={isLightTheme}
        primaryActions={topbarActionBundle.primaryActions}
        utilityActions={topbarActionBundle.utilityActions}
        rightRegistrations={topbarRightRegistrations}
        localeThemeSwitch={
          <MarketplaceHomeLocaleThemeSwitch
            locale={locale}
            currentThemeMode={currentThemeMode}
            onThemeModeChange={onThemeModeChange}
            onLocaleChange={onLocaleChange}
          />
        }
      />

      {isResultsPage ? (
        <>
          <section className="marketplace-page-breadcrumb-shell">
            <MarketplacePageBreadcrumb
              items={resultsPageBreadcrumbItems}
              ariaLabel="Results page breadcrumb"
              testIdPrefix="results-page-breadcrumb"
            />
          </section>

          <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
            <MarketplaceSearchStrip
              variant="results"
              text={text}
              form={form}
              submitDisabled={effectiveDataMode === "live" && loading}
              hotFilters={hotFilters}
              onFilterFieldChange={handleFilterFieldChange}
              onSearchInputKeyDown={handleSearchInputKeyDown}
              onSearchSubmit={handleSearchSubmit}
              onHotFilterApply={handleHotFilterApply}
            />
          </section>

          <main className="marketplace-layout animated-fade-up delay-2" data-animated="true">
            <MarketplaceHomeResultsContent
              isResultsPage={true}
              text={text}
              currentPage={currentPage}
              totalPages={totalPages}
              resultCards={resultCards}
              featuredCards={featuredCards}
              autoLoadConfig={autoLoadConfig}
              onPageChange={handlePageChange}
              renderSkillCard={renderSkillCard}
            />
          </main>
        </>
      ) : (
        <>
          <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
            <MarketplaceHomeTopStatsCard text={text} trendPathData={trendPathData} />
            <MarketplaceSearchStrip
              variant="home-entry"
              text={text}
              form={form}
              submitDisabled={effectiveDataMode === "live" && loading}
              hotFilters={hotFilters}
              onFilterFieldChange={handleFilterFieldChange}
              onSearchInputKeyDown={handleSearchInputKeyDown}
              onSearchSubmit={handleSearchSubmit}
              onSearchEntryOpen={handleSearchEntryOpen}
              onHotFilterApply={handleHotFilterApply}
            />
          </section>

          <main className="marketplace-layout animated-fade-up delay-2" data-animated="true">
            <MarketplaceHomeResultsContent
              isResultsPage={false}
              text={text}
              currentPage={currentPage}
              totalPages={totalPages}
              resultCards={resultCards}
              featuredCards={featuredCards}
              autoLoadConfig={autoLoadConfig}
              onPageChange={handlePageChange}
              renderSkillCard={renderSkillCard}
            />
          </main>
        </>
      )}

      <MarketplaceHomeSearchOverlay
        isVisible={!isResultsPage && isSearchOverlayOpen}
        text={text}
        form={form}
        recentSearches={recentSearches}
        isLightTheme={isLightTheme}
        onFilterFieldChange={(field, value) => handleFilterFieldChange(field, value)}
        onSearchSubmit={handleSearchSubmit}
        onSearchInputKeyDown={handleSearchInputKeyDown}
        onRecentSearchApply={handleRecentSearchApply}
        onRecentSearchClear={handleRecentSearchClear}
        onClose={handleResultsClose}
      />

    </MarketplacePublicPageShell>
  );
}
