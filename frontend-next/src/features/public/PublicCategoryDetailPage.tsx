"use client";

import { useMemo } from "react";

import { PublicMarketWebclientRegistration } from "@/src/components/shared/PublicMarketWebclientSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import {
  publicCategoriesRoute,
  publicHomeRoute
} from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceCategoryRail } from "./marketplace/MarketplaceCategoryRail";
import { MarketplaceChipControlGroup } from "./marketplace/MarketplaceChipControlGroup";
import { MarketplaceRecentSearchesCard } from "./marketplace/MarketplaceRecentSearchesCard";
import { MarketplacePagination } from "./marketplace/MarketplacePagination";
import { MarketplaceResultsListSection } from "./marketplace/MarketplaceResultsListSection";
import { MarketplaceSearchForm } from "./marketplace/MarketplaceSearchForm";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import { MarketplaceSupportCard } from "./marketplace/MarketplaceSupportCard";
import { MarketplaceSupportLinkList } from "./marketplace/MarketplaceSupportLinkList";
import { MarketplaceSupportMetricsList } from "./marketplace/MarketplaceSupportMetricsList";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { useMarketplaceRecentSearches } from "./marketplace/useMarketplaceRecentSearches";
import { buildPublicCategoryDetailPageModel } from "./publicCategoryDetailPageModel";

interface PublicCategoryDetailPageProps {
  marketplace: PublicMarketplaceResponse;
  activeCategory: string;
  query?: string;
  semanticQuery?: string;
  activeSubcategory?: string;
  sort?: string;
  mode?: string;
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
  const model = useMemo(
    () =>
      buildPublicCategoryDetailPageModel({
        marketplace,
        messages,
        activeCategory,
        query,
        semanticQuery,
        activeSubcategory,
        sort,
        mode,
        resolvePath: toPublicPath,
        resolveLinkTarget: toPublicLinkTarget
      }),
    [activeCategory, activeSubcategory, marketplace, messages, mode, query, semanticQuery, sort, toPublicLinkTarget, toPublicPath]
  );
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageCategories,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath(publicHomeRoute), label: messages.shellHome },
          { href: toPublicPath(publicCategoriesRoute), label: messages.shellCategories },
          ...(model.categorySummary ? [{ label: model.categorySummary.name, isCurrent: true }] : [])
        ]}
      />
    )
  });
  usePublicSkillBatchWarmup(model.skillWarmupTargets);

  if (!model.categorySummary) {
    return (
      <div className="marketplace-main-column">
        <PublicMarketWebclientRegistration slots={shellSlots} />

        <section className="marketplace-section-card">
          <div className="marketplace-empty-state">
            <h3>{messages.resultsEmptyTitle}</h3>
            <p>{messages.resultsBrowseCategories}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="marketplace-main-column marketplace-category-index-stage">
      <PublicMarketWebclientRegistration slots={shellSlots} />

      <div className="marketplace-category-reference-layout">
        <MarketplaceCategoryRail
          categories={marketplace.categories}
          activeCategory={model.activeRailCategory}
          description={messages.categoryHubBrowseDescription}
          navigationItems={model.railItems}
        />

        <div className="marketplace-category-reference-stream" data-testid="categories-stream">
          <section className="marketplace-section-card marketplace-category-detail-stage" data-testid="category-detail-stage">
            <div className="marketplace-category-section-head">
              <div className="marketplace-section-header">
                <p className="marketplace-kicker">{messages.resultsCategoryContextTitle}</p>
                <h1 className="marketplace-category-detail-title">
                  {model.categorySummary.name} {messages.categoryResultsSuffix}
                </h1>
                <p>{model.categorySummary.description}</p>
              </div>
              <div className="marketplace-pill-row">
                <span className="marketplace-search-utility-pill" data-testid="category-detail-matching-count">
                  {model.matchingSkillCount} {messages.statMatchingSkills}
                </span>
                <span className="marketplace-search-utility-pill">{model.activeSortLabel}</span>
                <span className="marketplace-search-utility-pill">{model.activeModeLabel}</span>
              </div>
            </div>

            <MarketplaceChipControlGroup
              label={messages.categoryAllSubcategories}
              items={model.subcategoryItems}
            />

            <MarketplaceSearchForm
              action={model.actionPath}
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
                ...(model.normalizedSort !== "relevance" ? [{ name: "sort", value: model.normalizedSort }] : []),
                ...(model.normalizedMode !== "hybrid" ? [{ name: "mode", value: model.normalizedMode }] : [])
              ]}
              onSubmit={(event) => {
                const formData = new FormData(event.currentTarget);
                addEntry(model.actionPath, String(formData.get("q") || ""), String(formData.get("tags") || ""));
              }}
            />

            <div className="marketplace-category-filter-grid">
              <MarketplaceChipControlGroup
                label={messages.searchSortLabel}
                items={model.sortItems}
              />

              <MarketplaceChipControlGroup
                label={messages.searchModeLabel}
                items={model.modeItems}
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
                description={model.categorySummary.description}
                hasResults={model.visibleItems.length > 0}
                testId="category-results-section"
                resultsContent={model.visibleItems.map((item) => (
                  <MarketplaceSkillCard key={item.id} item={item} />
                ))}
                footerMeta={
                  <MarketplacePagination
                    basePath={model.actionPath}
                    currentPage={marketplace.pagination.page}
                    totalPages={marketplace.pagination.total_pages}
                    prevPage={marketplace.pagination.prev_page}
                    nextPage={marketplace.pagination.next_page}
                    summaryLabel={`${messages.paginationPageLabel} ${marketplace.pagination.page} / ${marketplace.pagination.total_pages}`}
                    previousLabel={messages.paginationPrevious}
                    nextLabel={messages.paginationNext}
                    query={{
                      q: query || undefined,
                      page_size: marketplace.pagination.page_size || undefined,
                      tags: semanticQuery || undefined,
                      subcategory: activeSubcategory || undefined,
                      sort: model.normalizedSort !== "relevance" ? model.normalizedSort : undefined,
                      mode: model.normalizedMode !== "hybrid" ? model.normalizedMode : undefined
                    }}
                  />
                }
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
                <MarketplaceRecentSearchesCard />

                <MarketplaceSupportCard
                  title={messages.resultsDiscoveryNotesTitle}
                  description={messages.resultsDiscoveryNotesDescription}
                  className="marketplace-category-context-card"
                >
                  <MarketplaceSupportLinkList
                    className="marketplace-category-context-links"
                    items={model.contextLinks.map((option) => ({
                      key: option.key,
                      href: option.href,
                      label: option.label,
                      meta: `${option.count} ${messages.skillCountSuffix}`,
                      isActive: option.isActive
                    }))}
                  />

                  <MarketplaceSupportMetricsList metrics={model.summaryMetrics} className="marketplace-category-context-metrics" />
                </MarketplaceSupportCard>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
