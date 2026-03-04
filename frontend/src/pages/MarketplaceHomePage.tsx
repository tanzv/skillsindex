import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MarketplaceQueryParams,
  PublicMarketplaceResponse,
  SessionUser
} from "../lib/api";
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
  TopbarActionItem,
  buildLightTopbarPrimaryActions,
  buildLightTopbarUtilityActions
} from "./MarketplaceHomePage.lightTopbar";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import MarketplaceHomeSearchOverlay from "./MarketplaceHomeSearchOverlay";
import MarketplaceHomeSkillCard from "./MarketplaceHomeSkillCard";
import MarketplaceHomeTopStatsCard from "./MarketplaceHomeTopStatsCard";
import MarketplaceHomeTopRecommendations from "./MarketplaceHomeTopRecommendations";
import MarketplaceGlobalSearchBar from "../components/MarketplaceGlobalSearchBar";
import { buildMarketplaceTrendPathData } from "./MarketplaceHomePage.trend";
import { normalizeFilterFormQuery } from "./MarketplacePublicQuery";
import MarketplacePublicPageShell from "./marketplacePublic/MarketplacePublicPageShell";
import PublicStandardTopbar from "./PublicStandardTopbar";
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
      mode: homeMode,
      prototypeDelayMs: homeMode === "prototype" ? autoLoadConfig.prototypeDataDelayMs : 0
    })
      .then((result) => {
        if (!active) {
          return;
        }
        const payload =
          homeMode === "live" && result.degraded && hasLiveQueryConstraints
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
          homeMode === "live" && hasLiveQueryConstraints
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
    homeMode,
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
    setIsSearchOverlayOpen(false);
    commitQuery({ ...normalizeFilterFormQuery(form), page: 1 }, "results");
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
    setForm(nextForm);
    setIsSearchOverlayOpen(false);
    commitQuery({ ...normalizeFilterFormQuery(nextForm), page: 1 }, "results");
  }

  function handleFilterFieldChange(field: keyof MarketplaceFilterForm, value: string) {
    const nextForm: MarketplaceFilterForm = {
      ...form,
      [field]: value
    };
    setForm(nextForm);
  }

  function handleQuickFilterOpen() {
    setIsSearchOverlayOpen(true);
  }

  function handleResultsClose() {
    setIsSearchOverlayOpen(false);
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

  const lightTopbarPrimaryActions = useMemo<TopbarActionItem[]>(
    () =>
      buildLightTopbarPrimaryActions({
        onNavigate,
        toPublicPath,
        labels: {
          categoryNav: text.categoryNav,
          downloadRankingNav: text.downloadRankingNav
        }
      }),
    [onNavigate, text.categoryNav, text.downloadRankingNav, toPublicPath]
  );
  const lightTopbarUtilityActions = useMemo<TopbarActionItem[]>(
    () =>
      buildLightTopbarUtilityActions({
        onNavigate,
        toPublicPath,
        hasSessionUser: Boolean(sessionUser),
        authActionLabel: sessionUser ? text.signOut : text.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, onNavigate, sessionUser, text.signIn, text.signOut, toPublicPath]
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
      <PublicStandardTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle={topbarBrandTitle}
        brandSubtitle={topbarBrandSubtitle}
        onBrandClick={() => onNavigate(toHomePath())}
        isLightTheme={isLightTheme}
        primaryActions={lightTopbarPrimaryActions}
        utilityActions={lightTopbarUtilityActions}
        secondaryCtaLabel={text.openWorkspace}
        onSecondaryCtaClick={handleTopbarConsoleAction}
        ctaLabel={sessionUser ? text.signOut : text.signIn}
        onCtaClick={handleTopbarAuthAction}
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
          <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
            <MarketplaceGlobalSearchBar
              queryAriaLabel={text.queryKeyword}
              queryValue={form.q}
              queryPlaceholder={text.queryPlaceholder}
              onQueryChange={(value) => handleFilterFieldChange("q", value)}
              onQueryKeyDown={handleSearchInputKeyDown}
              semanticAriaLabel={text.querySemantic}
              semanticValue={form.tags}
              semanticPlaceholder={text.semanticPlaceholder}
              onSemanticChange={(value) => handleFilterFieldChange("tags", value)}
              submitLabel={text.search}
              onSubmit={handleSearchSubmit}
              submitDisabled={homeMode === "live" && loading}
            />

            <MarketplaceHomeTopRecommendations
              label={text.recommendedLabel}
              filters={hotFilters}
              onApply={handleHotFilterApply}
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

            <MarketplaceHomeTopRecommendations label={text.recommendedLabel} filters={hotFilters} onApply={handleHotFilterApply} />

            <MarketplaceGlobalSearchBar
              queryAriaLabel="Keyword query"
              queryValue={form.q}
              queryPlaceholder={text.queryPlaceholder}
              queryReadOnly
              onQueryClick={handleSearchEntryOpen}
              onQueryKeyDown={handleSearchInputKeyDown}
              submitLabel={text.search}
              onSubmit={handleSearchSubmit}
              submitDisabled={homeMode === "live" && loading}
              filterLabel={text.advanced}
              onFilterClick={handleQuickFilterOpen}
            />

            <div className="marketplace-search-utility-row" aria-label="Search utility">
              <div className="marketplace-search-utility-left">
                <span className="is-active">{text.modeLabel}</span>
                <span>{text.sortLabel}</span>
                <span>{text.viewLabel}</span>
              </div>
            </div>
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
        resultItems={items}
        resultTotal={resolvedData.pagination.total_items || 0}
        hotFilters={hotFilters}
        isLightTheme={isLightTheme}
        onFilterFieldChange={(field, value) => handleFilterFieldChange(field, value)}
        onSearchSubmit={handleSearchSubmit}
        onSearchInputKeyDown={handleSearchInputKeyDown}
        onHotFilterApply={handleHotFilterApply}
        onResultOpen={(skillID) => handleSkillOpen(skillID)}
        onClose={handleResultsClose}
      />
    </MarketplacePublicPageShell>
  );
}
