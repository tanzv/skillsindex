import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarketplaceQueryParams, PublicMarketplaceResponse, SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import {
  buildMergedLatestCards,
  buildMarketplaceFallback,
  buildMarketplacePath,
  buildPrototypeCardGroups,
  buildLightTopbarPrimaryActions,
  buildLightTopbarUtilityActions,
  defaultFilterForm,
  MarketplacePublicLocaleThemeSwitch,
  MarketplacePublicResultsContent,
  MarketplacePublicSkillCard,
  mergeMarketplacePayloadForHomeAutoLoad,
  parseQueryState,
  resolveMarketplaceAutoLoadConfig,
  resolveMarketplaceCategorySubcategoryState,
  resolveMarketplaceHomeMode,
  normalizeUnavailableLiveMarketplacePayload
} from "./marketplacePublic/MarketplacePublicShared";
import type {
  MarketplaceFilterForm,
  MarketplaceHomeMode,
  PrototypeCardEntry,
  TopbarActionItem
} from "./marketplacePublic/MarketplacePublicShared";
import MarketplacePublicPageShell from "./marketplacePublic/MarketplacePublicPageShell";
import MarketplaceCategoryDetailFilters from "./MarketplaceCategoryDetailFilters";
import {
  resolveMarketplaceCategoryDetailFilterOptions
} from "./MarketplaceCategoryDetailFilters.config";
import { buildMarketplaceText } from "./marketplaceText";
import { normalizeFilterFormQuery, normalizeRouteCategorySlug } from "./MarketplacePublicQuery";
import PublicStandardTopbar from "./PublicStandardTopbar";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { isLightPrototypePath } from "./prototypePageTheme";
import { loadMarketplaceWithFallback } from "./prototypeDataFallback";

interface MarketplaceCategoryDetailPageProps {
  locale: AppLocale;
  sessionUser: SessionUser | null;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  locationKey: string;
  categorySlug?: string | null;
}

export default function MarketplaceCategoryDetailPage({
  locale,
  sessionUser,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  locationKey,
  categorySlug = null
}: MarketplaceCategoryDetailPageProps) {
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
  const routeCategorySlug = useMemo(() => normalizeRouteCategorySlug(categorySlug), [categorySlug]);
  const homePath = navigator.toPublic("/");
  const categoryResultsPath = routeCategorySlug
    ? navigator.toPublic(`/categories/${encodeURIComponent(routeCategorySlug)}`)
    : navigator.toPublic("/categories");
  const homeMode = useMemo<MarketplaceHomeMode>(
    () => resolveMarketplaceHomeMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE),
    []
  );
  const autoLoadConfig = useMemo(() => resolveMarketplaceAutoLoadConfig(import.meta.env), []);
  const queryState = useMemo(() => parseQueryState(window.location.search), [locationKey]);
  const effectiveQueryState = useMemo(
    () => ({
      ...queryState,
      category: routeCategorySlug || queryState.category
    }),
    [queryState, routeCategorySlug]
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
    autoLoadConfig.prototypeDataDelayMs,
    effectiveQueryState,
    fallbackData,
    hasLiveQueryConstraints,
    homeMode,
    locale,
    sessionUser
  ]);

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
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const isLightTheme = isLightPrototypePath(currentPath);
  const currentThemeMode: ThemeMode = isLightTheme ? "light" : "dark";
  const cardGroups = useMemo(
    () =>
      buildPrototypeCardGroups(items, locale, {
        theme: isLightTheme ? "light" : "dark",
        useSkillPayload: true
      }),
    [items, isLightTheme, locale]
  );
  const resultCards = useMemo(
    () =>
      buildMergedLatestCards({
        items,
        pageSize,
        locale,
        isLightTheme,
        useSkillPayload: true,
        fallbackLatestCards: cardGroups.latest
      }),
    [cardGroups.latest, isLightTheme, items, locale, pageSize]
  );
  const categorySubcategoryState = useMemo(
    () =>
      resolveMarketplaceCategorySubcategoryState(
        Array.isArray(resolvedData.categories) ? resolvedData.categories : [],
        routeCategorySlug || effectiveQueryState.category || "",
        text.categoryNav
      ),
    [effectiveQueryState.category, resolvedData.categories, routeCategorySlug, text.categoryNav]
  );
  const categoryDetailFilterOptions = useMemo(
    () => resolveMarketplaceCategoryDetailFilterOptions(resolvedData, text, routeCategorySlug || effectiveQueryState.category || ""),
    [effectiveQueryState.category, resolvedData, routeCategorySlug, text]
  );
  const toPublicPath = (path: string) => navigator.toPublic(path);

  function commitQuery(next: MarketplaceQueryParams) {
    const nextPath = buildMarketplacePath(normalizeFilterFormQuery(next as MarketplaceFilterForm), categoryResultsPath);
    const currentRoutePath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentRoutePath) {
      return;
    }
    onNavigate(nextPath);
  }
  function handleSearchInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    handleSearchSubmit();
  }
  function handleSearchSubmit() {
    commitQuery({ ...normalizeFilterFormQuery(form), page: 1 });
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    commitQuery({ ...effectiveQueryState, page });
  }
  function handleSkillOpen(skillID: number | null) {
    if (skillID) {
      onNavigate(navigator.toPublic(`/skills/${skillID}`));
      return;
    }
    onNavigate(homePath);
  }
  function applyCategoryFilterPatch(patch: Partial<MarketplaceFilterForm>) {
    const nextForm: MarketplaceFilterForm = { ...form, ...patch };
    setForm(nextForm);
    commitQuery({ ...normalizeFilterFormQuery(nextForm), page: 1 });
  }
  function handleSubcategoryFilterApply(subcategorySlug: string) {
    applyCategoryFilterPatch({
      subcategory: String(subcategorySlug || "").trim()
    });
  }

  function handleSortFilterApply(sortValue: string) {
    const nextSortValue = String(sortValue || "recent").trim().toLowerCase() || "recent";
    applyCategoryFilterPatch({ sort: nextSortValue });
  }

  function handleModeFilterApply(modeValue: string) {
    const nextModeValue = String(modeValue || "keyword").trim().toLowerCase() || "keyword";
    applyCategoryFilterPatch({ mode: nextModeValue });
  }

  function handleFilterFieldChange(field: keyof MarketplaceFilterForm, value: string) {
    const nextForm: MarketplaceFilterForm = {
      ...form,
      [field]: value
    };
    setForm(nextForm);
  }

  function handleTopbarAuthAction(): void {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
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
  const topbarBrandTitle = isLightTheme ? "SkillsIndex" : text.brandTitle;
  const topbarBrandSubtitle = isLightTheme ? "User Portal" : text.brandSubtitle;
  const rootClasses = ["marketplace-home", "is-results-page", "is-category-detail-page", isLightTheme ? "is-light-theme" : "", isMobileLayout ? "is-mobile" : ""]
    .filter(Boolean)
    .join(" ");

  function renderSkillCard(card: PrototypeCardEntry, key: string): JSX.Element {
    return <MarketplacePublicSkillCard card={card} cardKey={key} onOpen={handleSkillOpen} />;
  }

  return (
    <MarketplacePublicPageShell
      isResultsStage
      isMobileLayout={isMobileLayout}
      isLightTheme={isLightTheme}
      rootClassName={rootClasses}
      rootTestId="marketplace-category-detail-page"
    >
      <PublicStandardTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle={topbarBrandTitle}
        brandSubtitle={topbarBrandSubtitle}
        onBrandClick={() => onNavigate(homePath)}
        isLightTheme={isLightTheme}
        primaryActions={lightTopbarPrimaryActions}
        utilityActions={lightTopbarUtilityActions}
        ctaLabel={sessionUser ? text.signOut : text.signIn}
        onCtaClick={handleTopbarAuthAction}
        localeThemeSwitch={
          <MarketplacePublicLocaleThemeSwitch
            locale={locale}
            currentThemeMode={currentThemeMode}
            onThemeModeChange={onThemeModeChange}
            onLocaleChange={onLocaleChange}
          />
        }
      />

      <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
        <MarketplaceCategoryDetailFilters
          text={text}
          categoryName={categorySubcategoryState.categoryName || text.categoryNav}
          form={form}
          categoryOptions={categorySubcategoryState.options}
          sortOptions={categoryDetailFilterOptions.sortOptions}
          modeOptions={categoryDetailFilterOptions.modeOptions}
          submitDisabled={homeMode === "live" && loading}
          onFilterFieldChange={handleFilterFieldChange}
          onSearchInputKeyDown={handleSearchInputKeyDown}
          onSearchSubmit={handleSearchSubmit}
          onSubcategoryFilterApply={handleSubcategoryFilterApply}
          onSortFilterApply={handleSortFilterApply}
          onModeFilterApply={handleModeFilterApply}
        />
      </section>

      <main className="marketplace-layout animated-fade-up delay-2" data-animated="true">
        <MarketplacePublicResultsContent
          isResultsPage={true}
          text={text}
          currentPage={currentPage}
          totalPages={totalPages}
          resultCards={resultCards}
          featuredCards={[]}
          autoLoadConfig={autoLoadConfig}
          onPageChange={handlePageChange}
          renderSkillCard={renderSkillCard}
        />
      </main>
    </MarketplacePublicPageShell>
  );
}
