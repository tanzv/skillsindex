import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import {
  isPresentationCategorySlug,
  resolveMarketplaceSkillCategorySlug
} from "@/src/lib/marketplace/taxonomy";
import { publicCategoriesRoute } from "@/src/lib/routing/publicRouteRegistry";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import {
  resolveCategoryDetailControlState,
  type CategoryDetailSubcategoryOption
} from "./marketplace/categoryDetailModel";
import { buildMarketplaceCategoryNavigation } from "./marketplace/marketplaceCategoryNavigation";
import {
  buildMarketplaceSummaryMetrics,
  filterMarketplaceItems,
  resolveMarketplaceCategorySummary,
  type MarketplaceSummaryMetric
} from "./marketplace/marketplaceViewModel";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";

export type PublicCategoryDetailPageMessages = Pick<
  PublicMarketplaceMessages,
  | "categoryAllSubcategories"
  | "categoryHubAllCategories"
  | "categoryModeAI"
  | "categoryModeHybrid"
  | "categoryModeKeyword"
  | "categorySortQuality"
  | "categorySortRecent"
  | "categorySortRelevance"
  | "categorySortStars"
  | "metricCategoryFamilies"
  | "metricDiscoveryWindow"
  | "metricPublicAssets"
  | "metricTopTagPivots"
  | "resultsCategoryContextTitle"
  | "statCategories"
  | "statMatchingSkills"
  | "statTopTags"
  | "statTotalSkills"
>;

export interface PublicCategoryDetailNavigationItem {
  slug: string;
  name: string;
  count: number;
  href: string;
  isActive: boolean;
}

export interface PublicCategoryDetailChipItem {
  key: string;
  href: string;
  label: string;
  isActive: boolean;
  secondaryLabel?: number;
  count?: number;
  value?: string;
}

export interface PublicCategoryDetailPageModel {
  categorySummary: ReturnType<typeof resolveMarketplaceCategorySummary>;
  visibleItems: PublicMarketplaceResponse["items"];
  summaryMetrics: MarketplaceSummaryMetric[];
  skillWarmupTargets: string[];
  railItems: PublicCategoryDetailNavigationItem[];
  subcategoryItems: PublicCategoryDetailChipItem[];
  sortItems: PublicCategoryDetailChipItem[];
  modeItems: PublicCategoryDetailChipItem[];
  contextLinks: PublicCategoryDetailChipItem[];
  activeRailCategory: string;
  actionPath: string;
  activeSortLabel: string;
  activeModeLabel: string;
  matchingSkillCount: number;
  normalizedSort: string;
  normalizedMode: string;
}

interface PublicLinkTarget {
  href: string;
  as?: string;
}

export interface BuildPublicCategoryDetailPageModelInput {
  marketplace: PublicMarketplaceResponse;
  messages: PublicCategoryDetailPageMessages;
  activeCategory: string;
  query?: string;
  semanticQuery?: string;
  activeSubcategory?: string;
  sort?: string;
  mode?: string;
  resolvePath: (route: string) => string;
  resolveLinkTarget: (route: string) => PublicLinkTarget;
}

function normalizeQueryValue(rawValue: string | undefined, fallback: string): string {
  const normalizedValue = String(rawValue || "")
    .trim()
    .toLowerCase();

  return normalizedValue || fallback;
}

function buildCategoryHref(
  actionPath: string,
  query: string,
  semanticQuery: string,
  activeSubcategory: string,
  normalizedSort: string,
  normalizedMode: string,
  overrides: { subcategory?: string; sort?: string; mode?: string }
): string {
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

function toContextLink(option: CategoryDetailSubcategoryOption, href: string): PublicCategoryDetailChipItem {
  return {
    key: `context-${option.value || "all"}`,
    href,
    label: option.label,
    isActive: option.isActive,
    count: option.count,
    value: option.value
  };
}

export function buildPublicCategoryDetailPageModel({
  marketplace,
  messages,
  activeCategory,
  query = "",
  semanticQuery = "",
  activeSubcategory = "",
  sort = "relevance",
  mode = "hybrid",
  resolvePath,
  resolveLinkTarget
}: BuildPublicCategoryDetailPageModelInput): PublicCategoryDetailPageModel {
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
  const actionPath = resolvePath(`${publicCategoriesRoute}/${activeCategory}`);

  if (!categorySummary) {
    return {
      categorySummary,
      visibleItems,
      summaryMetrics: buildMarketplaceSummaryMetrics(marketplace, messages),
      skillWarmupTargets: buildPublicSkillBatchWarmupTargets(visibleItems, resolvePath),
      railItems: [],
      subcategoryItems: [],
      sortItems: [],
      modeItems: [],
      contextLinks: [],
      activeRailCategory: "",
      actionPath,
      activeSortLabel: messages.categorySortRelevance,
      activeModeLabel: messages.categoryModeHybrid,
      matchingSkillCount: marketplace.stats.matching_skills ?? visibleItems.length,
      normalizedSort,
      normalizedMode
    };
  }

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
  const allCategoriesTarget = resolveLinkTarget(publicCategoriesRoute);
  const railItems = [
    {
      slug: "all",
      name: messages.categoryHubAllCategories,
      count: marketplace.stats.total_skills || marketplace.items.length,
      href: allCategoriesTarget.as || allCategoriesTarget.href,
      isActive: false
    },
    ...buildMarketplaceCategoryNavigation(marketplace.categories).map((item) => ({
      slug: item.slug,
      name: item.name,
      count: item.count,
      href: resolvePath(`${publicCategoriesRoute}/${item.slug}`),
      isActive: item.slug === activeRailCategory
    }))
  ];
  const subcategoryItems = controlState.subcategoryOptions.map((option) => ({
    key: `subcategory-${option.value || "all"}`,
    href: buildCategoryHref(actionPath, query, semanticQuery, activeSubcategory, normalizedSort, normalizedMode, {
      subcategory: option.value
    }),
    label: option.label,
    secondaryLabel: option.count,
    count: option.count,
    isActive: option.isActive,
    value: option.value
  }));
  const sortItems = controlState.sortOptions.map((option) => ({
    key: `sort-${option.value}`,
    href: buildCategoryHref(actionPath, query, semanticQuery, activeSubcategory, normalizedSort, normalizedMode, {
      sort: option.value
    }),
    label: option.label,
    isActive: option.isActive,
    value: option.value
  }));
  const modeItems = controlState.modeOptions.map((option) => ({
    key: `mode-${option.value}`,
    href: buildCategoryHref(actionPath, query, semanticQuery, activeSubcategory, normalizedSort, normalizedMode, {
      mode: option.value
    }),
    label: option.label,
    isActive: option.isActive,
    value: option.value
  }));
  const contextLinks = controlState.subcategoryOptions
    .slice(0, 6)
    .map((option) =>
      toContextLink(
        option,
        buildCategoryHref(actionPath, query, semanticQuery, activeSubcategory, normalizedSort, normalizedMode, {
          subcategory: option.value
        })
      )
    );

  return {
    categorySummary,
    visibleItems,
    summaryMetrics: buildMarketplaceSummaryMetrics(marketplace, messages),
    skillWarmupTargets: buildPublicSkillBatchWarmupTargets(visibleItems, resolvePath),
    railItems,
    subcategoryItems,
    sortItems,
    modeItems,
    contextLinks,
    activeRailCategory,
    actionPath,
    activeSortLabel: controlState.sortOptions.find((option) => option.isActive)?.label || messages.categorySortRelevance,
    activeModeLabel: controlState.modeOptions.find((option) => option.isActive)?.label || messages.categoryModeHybrid,
    matchingSkillCount: marketplace.summary?.category_detail?.matching_skills ?? marketplace.stats.matching_skills ?? visibleItems.length,
    normalizedSort,
    normalizedMode
  };
}
