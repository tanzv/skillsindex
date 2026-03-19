"use client";

import Link from "next/link";
import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { MarketplaceCategory, MarketplaceSubcategory, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceDiscoverySidebar } from "./marketplace/MarketplaceDiscoverySidebar";
import { MarketplaceResultsListSection } from "./marketplace/MarketplaceResultsListSection";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSearchPanel } from "./marketplace/MarketplaceSearchPanel";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import {
  buildMarketplaceSummaryMetrics,
  filterMarketplaceItems,
  resolveMarketplaceCategorySummary
} from "./marketplace/marketplaceViewModel";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";

interface PublicSearchPageProps {
  marketplace: PublicMarketplaceResponse;
  query: string;
  semanticQuery?: string;
  title?: string;
  description?: string;
  formAction?: string;
  activeCategory?: string;
  activeSubcategory?: string;
}

export function PublicSearchPage({
  marketplace,
  query,
  semanticQuery = "",
  title,
  description,
  formAction = "/results",
  activeCategory,
  activeSubcategory
}: PublicSearchPageProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const categorySummary = resolveMarketplaceCategorySummary(marketplace.categories, activeCategory, marketplace.items);
  const visibleItems = filterMarketplaceItems(marketplace.items, {
    activeCategory,
    activeSubcategory,
    query,
    semanticQuery
  });
  const skillWarmupTargets = buildPublicSkillBatchWarmupTargets(visibleItems, toPublicPath);
  const summaryMetrics = buildMarketplaceSummaryMetrics(marketplace, messages);
  const resolvedTitle = title || messages.resultsLedgerTitle;
  const resolvedDescription = description || messages.resultsLedgerDescription;
  const contextLabel = categorySummary ? `${messages.resultsCategoryContextTitle} · ${categorySummary.name}` : messages.stageResults;
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageResults,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath("/"), label: messages.shellHome },
          ...(categorySummary
            ? [
                { href: toPublicPath("/categories"), label: messages.shellCategories },
                { label: categorySummary.name, isCurrent: true }
              ]
            : [{ label: resolvedTitle, isCurrent: true }])
        ]}
        testId="search-shell-breadcrumb"
      />
    )
  });
  const categoryLinks: Array<{ href: string; label: string; count: number }> = categorySummary
    ? categorySummary.subcategories.map((subcategory: MarketplaceSubcategory) => ({
        href: toPublicPath(`/categories/${categorySummary.slug}?subcategory=${subcategory.slug}`),
        label: subcategory.name,
        count: subcategory.count
      }))
    : marketplace.categories.map((category: MarketplaceCategory) => ({
        href: toPublicPath(`/categories/${category.slug}`),
      label: category.name,
      count: category.count
      }));

  usePublicSkillBatchWarmup(skillWarmupTargets);

  return (
    <div className="marketplace-main-column">
      <PublicShellRegistration slots={shellSlots} />

      <MarketplaceSearchPanel
        variant="results"
        action={formAction}
        query={query}
        title={resolvedTitle}
        description={resolvedDescription}
        submitLabel={messages.searchButton}
        suggestions={marketplace.top_tags.map((tag) => tag.name)}
        contextLabel={contextLabel}
        semanticQuery={semanticQuery}
        showSemanticField
        hiddenFields={activeSubcategory ? [{ name: "subcategory", value: activeSubcategory }] : []}
      />

      <MarketplaceResultsStage
        layoutTestId="results-layout"
        mainTestId="results-main"
        sideTestId="results-support"
        mainContent={
          <MarketplaceResultsListSection
            title={resolvedTitle}
            description={resolvedDescription}
            hasResults={visibleItems.length > 0}
            headerMeta={
              <div className="marketplace-pill-row">
                <span className="marketplace-search-utility-pill">
                  {marketplace.pagination.total_items} {messages.statMatchingSkills}
                </span>
                <span className="marketplace-search-utility-pill">
                  {marketplace.pagination.page} / {marketplace.pagination.total_pages}
                </span>
              </div>
            }
            resultsContent={visibleItems.map((item) => (
              <MarketplaceSkillCard key={item.id} item={item} />
            ))}
            emptyContent={
              <div className="marketplace-empty-state">
                <h3>{messages.resultsEmptyTitle}</h3>
                <p>{messages.resultsEmptyDescription}</p>
                <div className="marketplace-pill-row">
                  <Link href={toPublicPath("/rankings")} className="marketplace-topbar-button is-primary">
                    {messages.resultsOpenRankings}
                  </Link>
                  <Link href={toPublicPath("/categories")} className="marketplace-topbar-button">
                    {messages.resultsBrowseCategories}
                  </Link>
                </div>
              </div>
            }
          />
        }
        sideContent={
          <MarketplaceDiscoverySidebar
            wrapInColumn={false}
            fallbackLinks={[
              { href: "/results?q=release", label: "release" },
              { href: "/results?q=repository", label: "repository" },
              { href: "/rankings", label: messages.shellRankings }
            ]}
            categoryTitle={categorySummary ? messages.resultsCategoryContextTitle : messages.resultsCategoryPivotsTitle}
            categoryDescription={categorySummary ? categorySummary.description : messages.resultsCategoryPivotsDescription}
            categoryLinks={categoryLinks.map((item) => ({
              ...item,
              isActive: Boolean(activeSubcategory && item.href.includes(`subcategory=${activeSubcategory}`))
            }))}
            summaryMetrics={summaryMetrics}
          />
        }
      />
    </div>
  );
}
