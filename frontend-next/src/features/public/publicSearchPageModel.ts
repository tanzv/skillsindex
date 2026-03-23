import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { MarketplaceSkill, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import {
  buildMarketplaceSummaryMetrics,
  filterMarketplaceItems,
  resolveMarketplaceCategorySummary,
  type MarketplaceSummaryMetric
} from "./marketplace/marketplaceViewModel";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";

export type PublicSearchPageMessages = Pick<
  PublicMarketplaceMessages,
  | "metricCategoryFamilies"
  | "metricDiscoveryWindow"
  | "metricPublicAssets"
  | "metricTopTagPivots"
  | "resultsCategoryContextTitle"
  | "resultsLedgerDescription"
  | "resultsLedgerTitle"
  | "stageResults"
  | "statCategories"
  | "statMatchingSkills"
  | "statTopTags"
  | "statTotalSkills"
>;

export type PublicSearchPageCategorySummary = NonNullable<
  ReturnType<typeof resolveMarketplaceCategorySummary>
>;

export interface PublicSearchPageCategoryLink {
  href: string;
  label: string;
  count: number;
  isActive: boolean;
}

export interface PublicSearchPageModel {
  visibleItems: MarketplaceSkill[];
  summaryMetrics: MarketplaceSummaryMetric[];
  categorySummary: PublicSearchPageCategorySummary | null;
  categoryLinks: PublicSearchPageCategoryLink[];
  resolvedTitle: string;
  resolvedDescription: string;
  contextLabel: string;
  skillWarmupTargets: string[];
}

export interface BuildPublicSearchPageModelInput {
  marketplace: PublicMarketplaceResponse;
  messages: PublicSearchPageMessages;
  query: string;
  semanticQuery?: string;
  title?: string;
  description?: string;
  formAction?: string;
  activeCategory?: string;
  activeSubcategory?: string;
}

export function buildPublicSearchPageModel({
  marketplace,
  messages,
  query,
  semanticQuery = "",
  title,
  description,
  activeCategory,
  activeSubcategory
}: BuildPublicSearchPageModelInput): PublicSearchPageModel {
  const categorySummary = resolveMarketplaceCategorySummary(marketplace.categories, activeCategory, marketplace.items);
  const visibleItems = filterMarketplaceItems(marketplace.items, {
    activeCategory,
    activeSubcategory,
    query,
    semanticQuery
  });

  return {
    visibleItems,
    summaryMetrics: buildMarketplaceSummaryMetrics(marketplace, messages),
    categorySummary,
    categoryLinks: categorySummary
      ? categorySummary.subcategories.map((subcategory) => ({
          href: `/categories/${categorySummary.slug}?subcategory=${subcategory.slug}`,
          label: subcategory.name,
          count: subcategory.count,
          isActive: activeSubcategory === subcategory.slug
        }))
      : marketplace.categories.map((category) => ({
          href: `/categories/${category.slug}`,
          label: category.name,
          count: category.count,
          isActive: false
        })),
    resolvedTitle: title || messages.resultsLedgerTitle,
    resolvedDescription: description || messages.resultsLedgerDescription,
    contextLabel: categorySummary ? `${messages.resultsCategoryContextTitle} · ${categorySummary.name}` : messages.stageResults,
    skillWarmupTargets: buildPublicSkillBatchWarmupTargets(visibleItems)
  };
}
