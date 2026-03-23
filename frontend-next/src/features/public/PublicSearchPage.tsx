"use client";

import dynamic from "next/dynamic";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { PublicMarketWebclientRegistration } from "@/src/components/shared/PublicMarketWebclientSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import {
  publicCategoriesRoute,
  publicHomeRoute,
  publicRankingsRoute,
  publicResultsRoute
} from "@/src/lib/routing/publicRouteRegistry";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceResultsListSection } from "./marketplace/MarketplaceResultsListSection";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import type { PublicSearchPageModel } from "./publicSearchPageModel";

const ResultsSearchPanel = dynamic(() =>
  import("./marketplace/MarketplaceSearchPanel").then((module) => module.MarketplaceSearchPanel),
  {
    loading: () => <div className="marketplace-section-card" aria-hidden="true" />
  }
);

const ResultsDiscoverySidebar = dynamic(() =>
  import("./marketplace/MarketplaceDiscoverySidebar").then((module) => module.MarketplaceDiscoverySidebar),
  {
    loading: () => <div className="marketplace-side-column" aria-hidden="true" />
  }
);

interface PublicSearchPageProps {
  marketplace: PublicMarketplaceResponse;
  model: PublicSearchPageModel;
  query: string;
  semanticQuery?: string;
  sort?: string;
  mode?: string;
  formAction?: string;
  activeSubcategory?: string;
}

export function PublicSearchPage({
  marketplace,
  model,
  query,
  semanticQuery = "",
  sort = "relevance",
  mode = "hybrid",
  formAction = publicResultsRoute,
  activeSubcategory
}: PublicSearchPageProps) {
  const { messages } = usePublicI18n();
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageResults,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: publicHomeRoute, label: messages.shellHome },
          ...(model.categorySummary
            ? [
                { href: publicCategoriesRoute, label: messages.shellCategories },
                { label: model.categorySummary.name, isCurrent: true }
              ]
            : [{ label: model.resolvedTitle, isCurrent: true }])
        ]}
        testId="search-shell-breadcrumb"
      />
    )
  });

  usePublicSkillBatchWarmup(model.skillWarmupTargets);

  return (
    <div className="marketplace-main-column">
      <PublicMarketWebclientRegistration slots={shellSlots} />

      <ResultsSearchPanel
        variant="results"
        action={formAction}
        query={query}
        title={model.resolvedTitle}
        description={model.resolvedDescription}
        submitLabel={messages.searchButton}
        suggestions={marketplace.top_tags.map((tag) => tag.name)}
        contextLabel={model.contextLabel}
        semanticQuery={semanticQuery}
        showSemanticField
        currentSort={sort}
        currentMode={mode}
        hiddenFields={[
          ...(activeSubcategory ? [{ name: "subcategory", value: activeSubcategory }] : []),
          ...(sort !== "relevance" ? [{ name: "sort", value: sort }] : []),
          ...(mode !== "hybrid" ? [{ name: "mode", value: mode }] : [])
        ]}
      />

      <MarketplaceResultsStage
        layoutTestId="results-layout"
        mainTestId="results-main"
        sideTestId="results-support"
        mainContent={
          <MarketplaceResultsListSection
            title={model.resolvedTitle}
            description={model.resolvedDescription}
            hasResults={model.visibleItems.length > 0}
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
            resultsContent={model.visibleItems.map((item) => (
              <MarketplaceSkillCard key={item.id} item={item} />
            ))}
            emptyContent={
              <div className="marketplace-empty-state">
                <h3>{messages.resultsEmptyTitle}</h3>
                <p>{messages.resultsEmptyDescription}</p>
                <div className="marketplace-pill-row">
                  <PublicLink href={publicRankingsRoute} className="marketplace-topbar-button is-primary">
                    {messages.resultsOpenRankings}
                  </PublicLink>
                  <PublicLink href={publicCategoriesRoute} className="marketplace-topbar-button">
                    {messages.resultsBrowseCategories}
                  </PublicLink>
                </div>
              </div>
            }
          />
        }
        sideContent={
          <ResultsDiscoverySidebar
            wrapInColumn={false}
            categoryTitle={model.categorySummary ? messages.resultsCategoryContextTitle : messages.resultsCategoryPivotsTitle}
            categoryDescription={model.categorySummary ? model.categorySummary.description : messages.resultsCategoryPivotsDescription}
            categoryLinks={model.categoryLinks.map((item) => ({
              ...item,
              isActive: item.isActive || Boolean(activeSubcategory && item.href.includes(`subcategory=${activeSubcategory}`))
            }))}
            summaryMetrics={model.summaryMetrics}
          />
        }
      />
    </div>
  );
}
