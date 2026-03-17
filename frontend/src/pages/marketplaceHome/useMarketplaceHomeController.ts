import { useCallback, useEffect, useMemo, useState } from "react";

import type { AppLocale } from "../../lib/i18n";
import {
  readMarketplaceSearchHistory,
  type MarketplaceSearchHistoryEntry
} from "../../lib/marketplaceSearchHistory";
import type { MarketplaceQueryParams, PublicMarketplaceResponse, SessionUser } from "../../lib/api";
import type { ThemeMode } from "../../lib/themeModePath";
import type { MarketplacePageBreadcrumbItem } from "../../components/MarketplacePageBreadcrumb";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import {
  type MarketplaceFilterForm,
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
import { buildMarketplaceTopbarActionBundle } from "./MarketplaceHomePage.lightTopbar";
import { buildMarketplaceWorkspaceAuthRightRegistrations } from "../marketplacePublic/MarketplaceTopbarRightRegistrations";
import { buildMarketplaceTrendPathData } from "./MarketplaceHomePage.trend";
import {
  type MarketplaceHomeMode,
  buildHomeChipFilters,
  resolveMarketplaceAutoLoadConfig,
  resolveMarketplaceHomeMode,
  statsTrendBars
} from "./MarketplaceHomePage.config";
import { normalizeFilterFormQuery } from "../marketplacePublic/MarketplacePublicQuery";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { isLightPrototypePath } from "../prototype/prototypePageTheme";
import { buildEmptyMarketplacePayload, loadMarketplaceWithFallback } from "../prototype/prototypeDataFallback";
import type { MarketplaceText } from "../marketplacePublic/marketplaceText";
import { useMarketplaceHomeActions } from "./useMarketplaceHomeActions";

interface MarketplaceHomeControllerOptions {
  locale: AppLocale;
  sessionUser: SessionUser | null;
  text: MarketplaceText;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  locationKey: string;
  isResultsPage: boolean;
}

export function useMarketplaceHomeController({
  locale,
  sessionUser,
  text,
  onNavigate,
  onLogout,
  locationKey,
  isResultsPage
}: MarketplaceHomeControllerOptions) {
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
  const effectiveDataMode: MarketplaceHomeMode = isResultsPage ? "live" : homeMode;
  const autoLoadConfig = useMemo(() => resolveMarketplaceAutoLoadConfig(import.meta.env), []);
  const queryState = useMemo(() => parseQueryState(window.location.search), [locationKey]);
  const effectiveQueryState = useMemo(() => ({ ...queryState }), [queryState]);
  const fallbackData = useMemo(
    () => buildMarketplaceFallback(effectiveQueryState, locale, sessionUser),
    [effectiveQueryState, locale, sessionUser]
  );
  const emptyLiveData = useMemo(
    () => buildEmptyMarketplacePayload(effectiveQueryState, sessionUser),
    [effectiveQueryState, sessionUser]
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
            ? normalizeUnavailableLiveMarketplacePayload(emptyLiveData, effectiveQueryState.page)
            : effectiveDataMode === "live"
              ? emptyLiveData
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
    emptyLiveData,
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

  const resolvedData = data || (effectiveDataMode === "live" ? emptyLiveData : fallbackData);
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

  const toHomePath = useCallback(() => marketplaceBasePath, [marketplaceBasePath]);
  const toPublicPath = useCallback((path: string) => navigator.toPublic(path), [navigator]);

  const commitQuery = useCallback(
    (next: MarketplaceQueryParams, target: "home" | "results" = "results") => {
      const basePath = target === "home" ? marketplaceBasePath : marketplaceResultsPath;
      const nextPath = buildMarketplacePath(normalizeFilterFormQuery(next as MarketplaceFilterForm), basePath);
      const currentPathWithSearch = `${window.location.pathname}${window.location.search}`;
      if (nextPath === currentPathWithSearch) {
        return;
      }
      onNavigate(nextPath);
    },
    [marketplaceBasePath, marketplaceResultsPath, onNavigate]
  );

  const {
    handleBrandClick,
    handleSearchSubmit,
    handleSearchEntryOpen,
    handleSearchInputKeyDown,
    handlePageChange,
    handleSkillOpen,
    handleHotFilterApply,
    handleFilterFieldChange,
    handleOverlayClose,
    handleRecentSearchApply,
    handleRecentSearchClear,
    handleTopbarAuthAction,
    handleTopbarConsoleAction
  } = useMarketplaceHomeActions({
    form,
    currentPage,
    totalPages,
    isResultsPage,
    isSearchOverlayOpen,
    effectiveQueryState,
    sessionUser,
    onNavigate,
    onLogout,
    toHomePath,
    toPublicPath,
    commitQuery,
    setForm,
    setRecentSearches,
    setIsSearchOverlayOpen
  });

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

  const topbarBrandTitle = isLightTheme ? "SkillsIndex" : text.brandTitle;
  const topbarBrandSubtitle = isLightTheme ? "User Portal" : text.brandSubtitle;
  const rootClassName = [
    "marketplace-home",
    isResultsPage ? "is-results-page" : "",
    isLightTheme ? "is-light-theme" : "",
    isMobileLayout ? "is-mobile" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const shouldDisableSearchSubmit = effectiveDataMode === "live" && loading;

  return {
    form,
    loading,
    recentSearches,
    isSearchOverlayOpen,
    isMobileLayout,
    isLightTheme,
    currentThemeMode,
    rootClassName,
    topbarBrandTitle,
    topbarBrandSubtitle,
    topbarActionBundle,
    topbarRightRegistrations,
    resultsPageBreadcrumbItems,
    hotFilters,
    trendPathData,
    featuredCards,
    resultCards,
    currentPage,
    totalPages,
    autoLoadConfig,
    shouldDisableSearchSubmit,
    handleBrandClick,
    handleSearchSubmit,
    handleSearchEntryOpen,
    handleSearchInputKeyDown,
    handlePageChange,
    handleSkillOpen,
    handleHotFilterApply,
    handleFilterFieldChange,
    handleOverlayClose,
    handleRecentSearchApply,
    handleRecentSearchClear
  };
}
