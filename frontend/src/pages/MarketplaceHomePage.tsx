import { CSSProperties, KeyboardEvent, useEffect, useMemo, useState } from "react";
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
import MarketplaceHomeSkillCard from "./MarketplaceHomeSkillCard";
import MarketplaceHomeTopRecommendations from "./MarketplaceHomeTopRecommendations";
import MarketplaceResultsPage from "./MarketplaceResultsPage";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import PublicStandardTopbar from "./PublicStandardTopbar";
import {
  HomeChipFilter,
  MarketplaceHomeMode,
  resolveMarketplaceAutoLoadConfig,
  buildHomeChipFilters,
  resolveMarketplaceHomeMode,
  statsTrendBars,
  statsTrendXAxis,
  statsTrendYAxis
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
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  locationKey: string;
  isResultsPage?: boolean;
}

export default function MarketplaceHomePage({
  locale,
  sessionUser,
  onNavigate,
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
  const fallbackData = useMemo(() => buildMarketplaceFallback(queryState, locale, sessionUser), [queryState, locale, sessionUser]);
  const hasLiveQueryConstraints = Boolean(
    queryState.q ||
      queryState.tags ||
      queryState.category ||
      queryState.subcategory ||
      Number(queryState.page || 1) > 1
  );

  useEffect(() => {
    setForm({
      q: queryState.q || "",
      tags: queryState.tags || "",
      category: queryState.category || "",
      subcategory: queryState.subcategory || "",
      sort: queryState.sort || "recent",
      mode: queryState.mode || "keyword"
    });
  }, [queryState]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadMarketplaceWithFallback({
      query: queryState,
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
            ? normalizeUnavailableLiveMarketplacePayload(result.payload, queryState.page)
            : result.payload;
        setData((previousPayload) =>
          mergeMarketplacePayloadForHomeAutoLoad({
            previousPayload,
            nextPayload: payload,
            nextQuery: queryState
          })
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }
        const fallbackPayload =
          homeMode === "live" && hasLiveQueryConstraints
            ? normalizeUnavailableLiveMarketplacePayload(fallbackData, queryState.page)
            : fallbackData;
        setData((previousPayload) =>
          mergeMarketplacePayloadForHomeAutoLoad({
            previousPayload,
            nextPayload: fallbackPayload,
            nextQuery: queryState
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
  }, [queryState, fallbackData, homeMode, locale, sessionUser, autoLoadConfig.prototypeDataDelayMs, hasLiveQueryConstraints]);

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
  const trendPathData = useMemo(() => {
    const viewWidth = 680;
    const viewHeight = 250;
    const chartPadding = {
      top: 12,
      right: 14,
      bottom: 14,
      left: 14
    };
    const usableWidth = viewWidth - chartPadding.left - chartPadding.right;
    const usableHeight = viewHeight - chartPadding.top - chartPadding.bottom;
    const maxValue = Math.max(...statsTrendBars, 1);
    const points = statsTrendBars.map((value, index) => {
      const denominator = Math.max(1, statsTrendBars.length - 1);
      const x = chartPadding.left + (index / denominator) * usableWidth;
      const y = chartPadding.top + (1 - value / maxValue) * usableHeight;
      return { x, y };
    });
    const pointSegments = points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    const linePath = pointSegments.length > 0 ? `M ${pointSegments.join(" L ")}` : "";
    const areaPath =
      points.length > 0
        ? `M ${points[0].x.toFixed(2)} ${(chartPadding.top + usableHeight).toFixed(2)} L ${pointSegments.join(" L ")} L ${points[
            points.length - 1
          ].x.toFixed(2)} ${(chartPadding.top + usableHeight).toFixed(2)} Z`
        : "";
    return {
      viewWidth,
      viewHeight,
      linePath,
      areaPath
    };
  }, []);

  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const isLightTheme = isLightPrototypePath(currentPath);
  const currentThemeMode: ThemeMode = isLightTheme ? "light" : "dark";
  const hasActiveHomeFilters = Boolean(queryState.q || queryState.tags || queryState.category || queryState.subcategory);
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
  const latestCards = useMemo(
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

  useEffect(() => {
    if (!isResultsPage || isMobileLayout) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isResultsPage, isMobileLayout]);

  const stageStyle: CSSProperties = {
    width: "100%",
    minHeight: "100dvh",
    height: "auto"
  };

  const rootStyle: CSSProperties = {
    width: "100%",
    height: "auto",
    minHeight: "100dvh",
    margin: 0
  };

  function toHomePath(): string {
    return marketplaceBasePath;
  }

  function toPublicPath(path: string): string {
    return navigator.toPublic(path);
  }

  function normalizeQueryText(rawValue: string): string {
    return String(rawValue || "").trim().replace(/\s+/g, " ");
  }

  function normalizeFilterFormQuery(nextForm: MarketplaceFilterForm): MarketplaceQueryParams {
    return {
      ...nextForm,
      q: normalizeQueryText(nextForm.q),
      tags: normalizeQueryText(nextForm.tags),
      category: normalizeQueryText(nextForm.category),
      subcategory: normalizeQueryText(nextForm.subcategory)
    };
  }

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
    commitQuery({ ...normalizeFilterFormQuery(form), page: 1 }, "results");
  }

  function handleSearchEntryOpen() {
    commitQuery({ ...normalizeFilterFormQuery(form), page: 1 }, "results");
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
    commitQuery({ ...queryState, page }, "home");
  }

  function handleSkillOpen(skillID: number | null) {
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
    commitQuery({ ...normalizeFilterFormQuery(form), page: 1 }, "results");
  }

  function handleResultsClose() {
    const latestQuery = parseQueryState(window.location.search);
    onNavigate(buildMarketplacePath(latestQuery, marketplaceBasePath));
  }

  const ctaPath = sessionUser ? toPublicPath("/workspace") : toPublicPath("/login");
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
        hasSessionUser: Boolean(sessionUser)
      }),
    [onNavigate, sessionUser, toPublicPath]
  );
  const lightBrandTitle = "SkillsIndex";
  const lightBrandSubtitle = "User Portal";
  const topbarBrandTitle = isLightTheme ? lightBrandTitle : text.brandTitle;
  const topbarBrandSubtitle = isLightTheme ? lightBrandSubtitle : text.brandSubtitle;
  const rootClasses = [
    "marketplace-home",
    isLightTheme ? "is-light-theme" : "",
    isMobileLayout ? "is-mobile" : ""
  ]
    .filter(Boolean)
    .join(" ");

  function renderSkillCard(card: PrototypeCardEntry, key: string): JSX.Element {
    return <MarketplaceHomeSkillCard card={card} cardKey={key} onOpen={handleSkillOpen} />;
  }

  return (
    <div
      className={`prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${isLightTheme ? " is-light-stage" : ""}`}
      style={stageStyle}
      data-testid="marketplace-home-stage"
    >
      <MarketplaceHomePageStyles />

      <div className={rootClasses} style={rootStyle} data-testid="marketplace-home-root">
        <PublicStandardTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle={topbarBrandTitle}
          brandSubtitle={topbarBrandSubtitle}
          onBrandClick={() => onNavigate(toHomePath())}
          isLightTheme={isLightTheme}
          primaryActions={lightTopbarPrimaryActions}
          utilityActions={lightTopbarUtilityActions}
          statusLabel={sessionUser ? text.signedIn : text.signedOut}
          ctaLabel={sessionUser ? text.openWorkspace : text.signIn}
          onCtaClick={() => onNavigate(ctaPath)}
          localeThemeSwitch={
            <MarketplaceHomeLocaleThemeSwitch
              locale={locale}
              currentThemeMode={currentThemeMode}
              onThemeModeChange={onThemeModeChange}
              onLocaleChange={onLocaleChange}
            />
          }
        />

        <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
          <section className="marketplace-top-stats-card" aria-label="Marketplace stats overview">
            <div className="marketplace-top-stats-left">
              <p className="marketplace-top-stats-overline">{text.brandSubtitle}</p>
              <h2 className="marketplace-top-stats-main">
                <span className="marketplace-top-stats-main-line">{text.brandTitle}</span>
                <span className="marketplace-top-stats-main-line is-metric">{text.statsMain}</span>
              </h2>
              <p className="marketplace-top-stats-promo">{text.statsPromo}</p>
              <div className="marketplace-top-stats-metrics" aria-hidden="true">
                <div className="marketplace-top-stats-metric">
                  <span className="marketplace-top-stats-metric-label">{text.statsSub}</span>
                  <strong className="marketplace-top-stats-metric-value">{text.statsDeltaLeft}</strong>
                </div>
                <div className="marketplace-top-stats-metric">
                  <span className="marketplace-top-stats-metric-label">{text.statsTrendLabel}</span>
                  <strong className="marketplace-top-stats-metric-value">{text.statsDeltaRight}</strong>
                </div>
              </div>
            </div>
            <div className="marketplace-top-stats-trend">
              <div className="marketplace-top-stats-trend-chart" aria-hidden="true">
                <div className="marketplace-top-stats-plot-wrap">
                  <div className="marketplace-top-stats-y-ticks">
                    {statsTrendYAxis.map((label) => (
                      <span key={`trend-y-${label}`} className="marketplace-top-stats-axis-label">
                        {label}
                      </span>
                    ))}
                  </div>
                  <svg
                    className="marketplace-top-stats-plot"
                    viewBox={`0 0 ${trendPathData.viewWidth} ${trendPathData.viewHeight}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="marketplaceTopTrendArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(232, 232, 232, 0.56)" />
                        <stop offset="100%" stopColor="rgba(232, 232, 232, 0.08)" />
                      </linearGradient>
                    </defs>
                    <path className="marketplace-top-stats-trend-area" d={trendPathData.areaPath} />
                    <path className="marketplace-top-stats-trend-line" d={trendPathData.linePath} />
                  </svg>
                </div>
                <div className="marketplace-top-stats-x-labels">
                  {statsTrendXAxis.map((label, index) => (
                    <span key={`trend-x-${index}-${label}`} className="marketplace-top-stats-axis-label">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <p className="marketplace-top-stats-chart-note">{text.statsTrendLabel}</p>
            </div>
          </section>

          <MarketplaceHomeTopRecommendations label={text.recommendedLabel} filters={hotFilters} onApply={handleHotFilterApply} />

          <div className="marketplace-search-main-row">
            <label className="marketplace-search-input is-query">
              <input
                aria-label="Keyword query"
                type="text"
                value={form.q}
                readOnly
                placeholder={text.queryPlaceholder}
                onClick={handleSearchEntryOpen}
                onKeyDown={handleSearchInputKeyDown}
              />
            </label>
            <button type="button" className="marketplace-search-submit" onClick={handleSearchSubmit} disabled={homeMode === "live" && loading}>
              {text.search}
            </button>
            <button type="button" className="marketplace-search-filter-btn" onClick={handleQuickFilterOpen}>
              {text.advanced}
            </button>
          </div>

          <div className="marketplace-search-utility-row" aria-label="Search utility">
            <div className="marketplace-search-utility-left">
              <span className="is-active">{text.modeLabel}</span>
              <span>{text.sortLabel}</span>
              <span>{text.viewLabel}</span>
            </div>
            <div className="marketplace-search-utility-right">
              <span className="is-queue">{text.queueLabel}</span>
            </div>
          </div>
        </section>

        <main className="marketplace-layout animated-fade-up delay-2" data-animated="true">
          <MarketplaceHomeResultsContent
            isResultsPage={false}
            text={text}
            currentPage={currentPage}
            totalPages={totalPages}
            latestCards={latestCards}
            featuredCards={featuredCards}
            autoLoadConfig={autoLoadConfig}
            onPageChange={handlePageChange}
            renderSkillCard={renderSkillCard}
          />
        </main>

        {isResultsPage ? (
          <MarketplaceResultsPage
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
        ) : null}
      </div>
    </div>
  );
}
