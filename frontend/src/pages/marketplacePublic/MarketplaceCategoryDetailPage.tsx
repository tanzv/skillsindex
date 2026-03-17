import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarketplaceQueryParams, PublicMarketplaceResponse, SessionUser } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import MarketplaceCategorySearchControls from "../../components/MarketplaceCategorySearchControls";
import MarketplacePageBreadcrumb, { type MarketplacePageBreadcrumbItem } from "../../components/MarketplacePageBreadcrumb";
import {
  buildMergedLatestCards,
  buildMarketplaceTopbarActionBundle,
  buildMarketplaceFallback,
  buildMarketplacePath,
  buildPrototypeCardGroups,
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
} from "./MarketplacePublicShared";
import type { MarketplaceFilterForm, MarketplaceHomeMode, PrototypeCardEntry } from "./MarketplacePublicShared";
import MarketplacePublicPageShell from "./MarketplacePublicPageShell";
import {
  resolveMarketplaceCategoryDetailFilterOptions
} from "./MarketplaceCategoryDetailFilters.config";
import { buildMarketplaceWorkspaceAuthRightRegistrations } from "./MarketplaceTopbarRightRegistrations";
import { buildMarketplaceText } from "./marketplaceText";
import { normalizeFilterFormQuery, normalizeRouteCategorySlug } from "./MarketplacePublicQuery";
import MarketplaceTopbar from "./MarketplaceTopbar";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { isLightPrototypePath } from "../prototype/prototypePageTheme";
import { buildEmptyMarketplacePayload, loadMarketplaceWithFallback } from "../prototype/prototypeDataFallback";

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

function interpolateLabelTemplate(template: string, values: Record<string, string | number>): string {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
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
      category: routeCategorySlug || queryState.category,
      tags: ""
    }),
    [queryState, routeCategorySlug]
  );
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
      tags: "",
      category: effectiveQueryState.category || "",
      subcategory: effectiveQueryState.subcategory || "",
      sort: effectiveQueryState.sort || "relevance",
      mode: effectiveQueryState.mode || "hybrid"
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
            ? normalizeUnavailableLiveMarketplacePayload(emptyLiveData, effectiveQueryState.page)
            : homeMode === "live"
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
    autoLoadConfig.prototypeDataDelayMs,
    emptyLiveData,
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

  const resolvedData = data || (homeMode === "live" ? emptyLiveData : fallbackData);
  const items = resolvedData.items || [];
  const totalItems = resolvedData.pagination.total_items || 0;
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
  const categoryResultsToolbarTitle = useMemo(() => {
    const matchedLabel = interpolateLabelTemplate(text.resultsStatMatchedTemplate, {
      total: totalItems
    });
    const categoryName = categorySubcategoryState.categoryName || text.categoryNav;
    return `${categoryName} \u00b7 ${matchedLabel || totalItems}`;
  }, [categorySubcategoryState.categoryName, text.categoryNav, text.resultsStatMatchedTemplate, totalItems]);
  const categoryDetailBreadcrumbItems = useMemo<MarketplacePageBreadcrumbItem[]>(
    () => [
      {
        key: "home",
        label: "SkillsIndex",
        onClick: () => onNavigate(homePath)
      },
      {
        key: "categories",
        label: text.categoryNav,
        onClick: () => onNavigate(navigator.toPublic("/categories"))
      },
      {
        key: "current",
        label: categorySubcategoryState.categoryName || text.categoryNav
      }
    ],
    [categorySubcategoryState.categoryName, homePath, navigator, onNavigate, text.categoryNav]
  );
  const toPublicPath = (path: string) => navigator.toPublic(path);

  function normalizeCategoryDetailQuery(next: MarketplaceQueryParams): MarketplaceQueryParams {
    const normalized = normalizeFilterFormQuery({
      ...defaultFilterForm,
      ...(next as Partial<MarketplaceFilterForm>)
    });
    return {
      ...normalized,
      page: next.page,
      tags: "",
      sort: normalized.sort || "relevance",
      mode: normalized.mode || "hybrid"
    };
  }

  function commitQuery(next: MarketplaceQueryParams) {
    const nextPath = buildMarketplacePath(normalizeCategoryDetailQuery(next), categoryResultsPath);
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
    commitQuery({ ...normalizeCategoryDetailQuery(form), page: 1 });
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
    const nextSortValue = String(sortValue || "relevance").trim().toLowerCase() || "relevance";
    applyCategoryFilterPatch({ sort: nextSortValue });
  }

  function handleModeFilterApply(modeValue: string) {
    const nextModeValue = String(modeValue || "hybrid").trim().toLowerCase() || "hybrid";
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
        activeActionID: "category",
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
      <MarketplaceTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle={topbarBrandTitle}
        brandSubtitle={topbarBrandSubtitle}
        onBrandClick={() => onNavigate(homePath)}
        isLightTheme={isLightTheme}
        primaryActions={topbarActionBundle.primaryActions}
        utilityActions={topbarActionBundle.utilityActions}
        rightRegistrations={topbarRightRegistrations}
        localeThemeSwitch={
          <MarketplacePublicLocaleThemeSwitch
            locale={locale}
            currentThemeMode={currentThemeMode}
            onThemeModeChange={onThemeModeChange}
            onLocaleChange={onLocaleChange}
          />
        }
      />

      <section className="marketplace-page-breadcrumb-shell">
        <MarketplacePageBreadcrumb
          items={categoryDetailBreadcrumbItems}
          ariaLabel="Category detail breadcrumb"
          testIdPrefix="category-detail-breadcrumb"
        />
      </section>

      <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
        <MarketplaceCategorySearchControls
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
          resultsToolbarTitleOverride={categoryResultsToolbarTitle}
          resultsToolbarChips={[]}
          autoLoadConfig={autoLoadConfig}
          onPageChange={handlePageChange}
          renderSkillCard={renderSkillCard}
        />
      </main>
    </MarketplacePublicPageShell>
  );
}
