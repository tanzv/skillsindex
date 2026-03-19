"use client";

import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceCategoryRail } from "./marketplace/MarketplaceCategoryRail";
import { MarketplaceChipControlGroup } from "./marketplace/MarketplaceChipControlGroup";
import { MarketplaceRecentSearchesCard } from "./marketplace/MarketplaceRecentSearchesCard";
import { MarketplaceResultsListSection } from "./marketplace/MarketplaceResultsListSection";
import { MarketplaceSearchForm } from "./marketplace/MarketplaceSearchForm";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import { MarketplaceSupportCard } from "./marketplace/MarketplaceSupportCard";
import { MarketplaceSupportLinkList } from "./marketplace/MarketplaceSupportLinkList";
import { MarketplaceSupportMetricsList } from "./marketplace/MarketplaceSupportMetricsList";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { resolveCategoryDetailControlState } from "./marketplace/categoryDetailModel";
import { buildMarketplaceCategoryHubNavigationItems } from "./marketplace/marketplaceCategoryHubModel";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";
import { isPresentationCategorySlug, resolveMarketplaceSkillCategorySlug } from "./marketplace/marketplaceTaxonomy";
import {
  buildMarketplaceSummaryMetrics,
  filterMarketplaceItems,
  resolveMarketplaceCategorySummary
} from "./marketplace/marketplaceViewModel";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { useMarketplaceRecentSearches } from "./marketplace/useMarketplaceRecentSearches";

interface PublicCategoryDetailPageProps {
  marketplace: PublicMarketplaceResponse;
  activeCategory: string;
  query?: string;
  semanticQuery?: string;
  activeSubcategory?: string;
  sort?: string;
  mode?: string;
}

function normalizeQueryValue(rawValue: string | undefined, fallback: string): string {
  const normalizedValue = String(rawValue || "")
    .trim()
    .toLowerCase();

  return normalizedValue || fallback;
}

export function PublicCategoryDetailPage({
  marketplace,
  activeCategory,
  query = "",
  semanticQuery = "",
  activeSubcategory = "",
  sort = "relevance",
  mode = "hybrid"
}: PublicCategoryDetailPageProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath, toPublicLinkTarget } = usePublicRouteState();
  const { addEntry } = useMarketplaceRecentSearches();
  const categorySummary = resolveMarketplaceCategorySummary(marketplace.categories, activeCategory, marketplace.items);
  const normalizedSort = normalizeQueryValue(sort, "relevance");
  const normalizedMode = normalizeQueryValue(mode, "hybrid");
  const visibleItems = filterMarketplaceItems(marketplace.items, {
    activeCategory,
    activeSubcategory,
    query,
    semanticQuery,
    sort: normalizedSort
  });
  const skillWarmupTargets = buildPublicSkillBatchWarmupTargets(visibleItems, toPublicPath);
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageCategories,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath("/"), label: messages.shellHome },
          { href: toPublicPath("/categories"), label: messages.shellCategories },
          ...(categorySummary ? [{ label: categorySummary.name, isCurrent: true }] : [])
        ]}
      />
    )
  });
  usePublicSkillBatchWarmup(skillWarmupTargets);

  if (!categorySummary) {
    return (
      <div className="marketplace-main-column">
        <PublicShellRegistration slots={shellSlots} />

        <section className="marketplace-section-card">
          <div className="marketplace-empty-state">
            <h3>{messages.resultsEmptyTitle}</h3>
            <p>{messages.resultsBrowseCategories}</p>
          </div>
        </section>
      </div>
    );
  }
  const summaryMetrics = buildMarketplaceSummaryMetrics(marketplace, messages);
  const controlState = resolveCategoryDetailControlState(categorySummary, messages, {
    activeSubcategory,
    sort: normalizedSort,
    mode: normalizedMode
  });
  const activeRailCategory =
    isPresentationCategorySlug(categorySummary.slug) && categorySummary.slug
      ? categorySummary.slug
      : visibleItems[0]
        ? resolveMarketplaceSkillCategorySlug(visibleItems[0])
        : "";
  const actionPath = toPublicPath(`/categories/${activeCategory}`);
  const activeSortLabel = controlState.sortOptions.find((option) => option.isActive)?.label || messages.categorySortRelevance;
  const activeModeLabel = controlState.modeOptions.find((option) => option.isActive)?.label || messages.categoryModeHybrid;
  const contextLinks = controlState.subcategoryOptions.slice(0, 6);
  const allCategoriesTarget = toPublicLinkTarget("/categories");
  const railItems = [
    {
      slug: "all",
      name: messages.categoryHubAllCategories,
      count: marketplace.stats.total_skills || marketplace.items.length,
      href: allCategoriesTarget.as || allCategoriesTarget.href,
      isActive: false
    },
    ...buildMarketplaceCategoryHubNavigationItems(marketplace.categories).map((item) => ({
      slug: item.slug,
      name: item.name,
      count: item.count,
      href: toPublicPath(`/categories/${item.slug}`),
      isActive: item.slug === activeRailCategory
    }))
  ];

  function buildCategoryHref(overrides: { subcategory?: string; sort?: string; mode?: string }): string {
    const params = new URLSearchParams();
    const nextSubcategory = overrides.subcategory ?? activeSubcategory;
    const nextSort = normalizeQueryValue(overrides.sort ?? normalizedSort, "relevance");
    const nextMode = normalizeQueryValue(overrides.mode ?? normalizedMode, "hybrid");

    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (semanticQuery.trim()) {
      params.set("tags", semanticQuery.trim());
    }
    if (nextSubcategory.trim()) {
      params.set("subcategory", nextSubcategory.trim());
    }
    if (nextSort !== "relevance") {
      params.set("sort", nextSort);
    }
    if (nextMode !== "hybrid") {
      params.set("mode", nextMode);
    }

    const search = params.toString();
    return search ? `${actionPath}?${search}` : actionPath;
  }

  return (
    <div className="marketplace-main-column marketplace-category-index-stage">
      <PublicShellRegistration slots={shellSlots} />

      <div className="marketplace-category-reference-layout">
        <MarketplaceCategoryRail
          categories={marketplace.categories}
          activeCategory={activeRailCategory}
          description={messages.categoryHubBrowseDescription}
          navigationItems={railItems}
        />

        <div className="marketplace-category-reference-stream" data-testid="categories-stream">
          <section className="marketplace-section-card marketplace-category-detail-stage" data-testid="category-detail-stage">
            <div className="marketplace-category-section-head">
              <div className="marketplace-section-header">
                <p className="marketplace-kicker">{messages.resultsCategoryContextTitle}</p>
                <h1 className="marketplace-category-detail-title">
                  {categorySummary.name} {messages.categoryResultsSuffix}
                </h1>
                <p>{categorySummary.description}</p>
              </div>
              <div className="marketplace-pill-row">
                <span className="marketplace-search-utility-pill">
                  {visibleItems.length} {messages.statMatchingSkills}
                </span>
                <span className="marketplace-search-utility-pill">{activeSortLabel}</span>
                <span className="marketplace-search-utility-pill">{activeModeLabel}</span>
              </div>
            </div>

            <MarketplaceChipControlGroup
              label={messages.categoryAllSubcategories}
              items={controlState.subcategoryOptions.map((option) => ({
                key: `subcategory-${option.value || "all"}`,
                href: buildCategoryHref({ subcategory: option.value }),
                label: option.label,
                secondaryLabel: option.count,
                isActive: option.isActive
              }))}
            />

            <MarketplaceSearchForm
              action={actionPath}
              query={query}
              semanticQuery={semanticQuery}
              placeholder={messages.searchPlaceholder}
              semanticPlaceholder={messages.searchSemanticPlaceholder}
              submitLabel={messages.searchButton}
              queryAriaLabel={messages.searchButton}
              semanticAriaLabel={messages.searchSemanticLabel}
              showSemanticField
              rowClassName="marketplace-search-row"
              queryFieldClassName="marketplace-search-field"
              semanticFieldClassName="marketplace-search-field"
              hiddenFields={[
                ...(activeSubcategory.trim() ? [{ name: "subcategory", value: activeSubcategory.trim() }] : []),
                ...(normalizedSort !== "relevance" ? [{ name: "sort", value: normalizedSort }] : []),
                ...(normalizedMode !== "hybrid" ? [{ name: "mode", value: normalizedMode }] : [])
              ]}
              onSubmit={(event) => {
                const formData = new FormData(event.currentTarget);
                addEntry(actionPath, String(formData.get("q") || ""), String(formData.get("tags") || ""));
              }}
            />

            <div className="marketplace-category-filter-grid">
              <MarketplaceChipControlGroup
                label={messages.searchSortLabel}
                items={controlState.sortOptions.map((option) => ({
                  key: `sort-${option.value}`,
                  href: buildCategoryHref({ sort: option.value }),
                  label: option.label,
                  isActive: option.isActive
                }))}
              />

              <MarketplaceChipControlGroup
                label={messages.searchModeLabel}
                items={controlState.modeOptions.map((option) => ({
                  key: `mode-${option.value}`,
                  href: buildCategoryHref({ mode: option.value }),
                  label: option.label,
                  isActive: option.isActive
                }))}
              />
            </div>
          </section>

          <MarketplaceResultsStage
            className="marketplace-category-results-layout"
            sideClassName="marketplace-category-results-side"
            layoutTestId="category-results-layout"
            mainTestId="category-results-main"
            sideTestId="category-results-support"
            mainContent={
              <MarketplaceResultsListSection
                title={messages.resultsCategoryContextTitle}
                description={categorySummary.description}
                hasResults={visibleItems.length > 0}
                testId="category-results-section"
                resultsContent={visibleItems.map((item) => (
                  <MarketplaceSkillCard key={item.id} item={item} />
                ))}
                emptyContent={
                  <div className="marketplace-empty-state">
                    <h3>{messages.resultsEmptyTitle}</h3>
                    <p>{messages.resultsEmptyDescription}</p>
                  </div>
                }
              />
            }
            sideContent={
              <>
                <MarketplaceRecentSearchesCard
                  fallbackLinks={[
                    { href: "/results?q=release", label: "release" },
                    { href: "/results?q=repository", label: "repository" },
                    { href: "/rankings", label: messages.shellRankings }
                  ]}
                />

                <MarketplaceSupportCard
                  title={messages.resultsDiscoveryNotesTitle}
                  description={messages.resultsDiscoveryNotesDescription}
                  className="marketplace-category-context-card"
                >
                  <MarketplaceSupportLinkList
                    className="marketplace-category-context-links"
                    items={contextLinks.map((option) => ({
                      key: `context-${option.value || "all"}`,
                      href: buildCategoryHref({ subcategory: option.value }),
                      label: option.label,
                      meta: `${option.count} ${messages.skillCountSuffix}`,
                      isActive: option.isActive
                    }))}
                  />

                  <MarketplaceSupportMetricsList metrics={summaryMetrics} className="marketplace-category-context-metrics" />
                </MarketplaceSupportCard>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
