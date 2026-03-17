"use client";

import { Search } from "lucide-react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceCategoryRail } from "./marketplace/MarketplaceCategoryRail";
import { MarketplaceRecentSearchesCard } from "./marketplace/MarketplaceRecentSearchesCard";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { resolveCategoryDetailControlState } from "./marketplace/categoryDetailModel";
import { isPresentationCategorySlug, resolveMarketplaceSkillCategorySlug } from "./marketplace/marketplaceTaxonomy";
import {
  buildMarketplaceSummaryMetrics,
  filterMarketplaceItems,
  resolveMarketplaceCategorySummary
} from "./marketplace/marketplaceViewModel";
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
  const { toPublicPath } = usePublicRouteState();
  const { addEntry } = useMarketplaceRecentSearches();
  const categorySummary = resolveMarketplaceCategorySummary(marketplace.categories, activeCategory, marketplace.items);
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

  const normalizedSort = normalizeQueryValue(sort, "relevance");
  const normalizedMode = normalizeQueryValue(mode, "hybrid");
  const visibleItems = filterMarketplaceItems(marketplace.items, {
    activeCategory,
    activeSubcategory,
    query,
    semanticQuery,
    sort: normalizedSort
  });
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

            <div className="marketplace-control-group">
              <span className="marketplace-control-label">{messages.categoryAllSubcategories}</span>
              <div className="marketplace-chip-control-row">
                {controlState.subcategoryOptions.map((option) => (
                  <PublicLink
                    key={`subcategory-${option.value || "all"}`}
                    href={buildCategoryHref({ subcategory: option.value })}
                    aria-current={option.isActive ? "page" : undefined}
                    className={`marketplace-chip-control${option.isActive ? " is-active" : ""}`}
                  >
                    <span>{option.label}</span>
                    <span>{option.count}</span>
                  </PublicLink>
                ))}
              </div>
            </div>

            <form
              action={actionPath}
              className="marketplace-search-form"
              onSubmit={(event) => {
                const formData = new FormData(event.currentTarget);
                addEntry(actionPath, String(formData.get("q") || ""), String(formData.get("tags") || ""));
              }}
            >
              <div className="marketplace-search-row">
                <label className="marketplace-search-field">
                  <Search size={18} aria-hidden="true" />
                  <input name="q" defaultValue={query} placeholder={messages.searchPlaceholder} aria-label={messages.searchButton} />
                </label>
                <label className="marketplace-search-field">
                  <input
                    name="tags"
                    defaultValue={semanticQuery}
                    placeholder={messages.searchSemanticPlaceholder}
                    aria-label={messages.searchSemanticLabel}
                  />
                </label>
                {activeSubcategory.trim() ? <input type="hidden" name="subcategory" value={activeSubcategory.trim()} /> : null}
                {normalizedSort !== "relevance" ? <input type="hidden" name="sort" value={normalizedSort} /> : null}
                {normalizedMode !== "hybrid" ? <input type="hidden" name="mode" value={normalizedMode} /> : null}
                <button className="marketplace-search-submit">{messages.searchButton}</button>
              </div>
            </form>

            <div className="marketplace-category-filter-grid">
              <section className="marketplace-control-group" aria-label={messages.searchSortLabel}>
                <span className="marketplace-control-label">{messages.searchSortLabel}</span>
                <div className="marketplace-chip-control-row">
                  {controlState.sortOptions.map((option) => (
                    <PublicLink
                      key={`sort-${option.value}`}
                      href={buildCategoryHref({ sort: option.value })}
                      aria-current={option.isActive ? "page" : undefined}
                      className={`marketplace-chip-control${option.isActive ? " is-active" : ""}`}
                    >
                      {option.label}
                    </PublicLink>
                  ))}
                </div>
              </section>

              <section className="marketplace-control-group" aria-label={messages.searchModeLabel}>
                <span className="marketplace-control-label">{messages.searchModeLabel}</span>
                <div className="marketplace-chip-control-row">
                  {controlState.modeOptions.map((option) => (
                    <PublicLink
                      key={`mode-${option.value}`}
                      href={buildCategoryHref({ mode: option.value })}
                      aria-current={option.isActive ? "page" : undefined}
                      className={`marketplace-chip-control${option.isActive ? " is-active" : ""}`}
                    >
                      {option.label}
                    </PublicLink>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <section className="marketplace-section-card" data-testid="category-results-section">
            <div className="marketplace-section-header">
              <h2>{messages.resultsCategoryContextTitle}</h2>
              <p>{categorySummary.description}</p>
            </div>

            <div className="marketplace-list-stack">
              {visibleItems.length > 0 ? (
                visibleItems.map((item) => <MarketplaceSkillCard key={item.id} item={item} />)
              ) : (
                <div className="marketplace-empty-state">
                  <h3>{messages.resultsEmptyTitle}</h3>
                  <p>{messages.resultsEmptyDescription}</p>
                </div>
              )}
            </div>
          </section>

          <div className="marketplace-category-detail-support-grid">
            <MarketplaceRecentSearchesCard
              fallbackLinks={[
                { href: "/results?q=release", label: "release" },
                { href: "/results?q=repository", label: "repository" },
                { href: "/rankings", label: messages.shellRankings }
              ]}
            />

            <section className="marketplace-section-card marketplace-category-context-card">
              <div className="marketplace-section-header">
                <h3>{messages.resultsDiscoveryNotesTitle}</h3>
                <p>{messages.resultsDiscoveryNotesDescription}</p>
              </div>

              <div className="marketplace-simple-link-list marketplace-category-context-links">
                {contextLinks.map((option) => (
                  <PublicLink
                    key={`context-${option.value || "all"}`}
                    href={buildCategoryHref({ subcategory: option.value })}
                    aria-current={option.isActive ? "page" : undefined}
                    className={`marketplace-simple-link-item${option.isActive ? " is-active" : ""}`}
                  >
                    <span className="marketplace-sidebar-link">{option.label}</span>
                    <span className="marketplace-meta-text">
                      {option.count} {messages.skillCountSuffix}
                    </span>
                  </PublicLink>
                ))}
              </div>

              <div className="marketplace-category-context-metrics">
                {summaryMetrics.slice(0, 3).map((metric) => (
                  <div key={metric.label} className="marketplace-stat-card">
                    <div className="marketplace-stat-card-label">{metric.label}</div>
                    <div className="marketplace-stat-card-value">{metric.value}</div>
                    <div className="marketplace-stat-card-detail">{metric.detail}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
