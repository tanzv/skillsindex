import type { MarketplaceCategory, MarketplaceSkill, MarketplaceSubcategory } from "@/src/lib/schemas/public";

import { filterMarketplaceItemsByCategory, resolveFeaturedMarketplaceItems, resolveLatestMarketplaceItems } from "./marketplaceViewModel";
import { buildMarketplaceCategoryCatalog } from "./marketplaceCategoryCatalog";

export type MarketplaceCategoryHubSectionSlug = "most-installed" | "popular" | "featured" | "recently-updated";
export type MarketplaceCategoryHubAudience = "agent" | "human";

export interface MarketplaceCategoryHubNavigationItem {
  slug: string;
  name: string;
  count: number;
  anchorId: string;
}

export interface MarketplaceCategoryHubSkillSection {
  slug: MarketplaceCategoryHubSectionSlug;
  items: MarketplaceSkill[];
}

export interface MarketplaceCategoryHubSpotlight {
  slug: string;
  name: string;
  description: string;
  count: number;
  anchorId: string;
  subcategories: MarketplaceSubcategory[];
  featuredSkills: MarketplaceSkill[];
  previewSkills: MarketplaceSkill[];
}

export interface MarketplaceCategoryHubModel {
  navigationItems: MarketplaceCategoryHubNavigationItem[];
  skillSections: MarketplaceCategoryHubSkillSection[];
  categorySpotlights: MarketplaceCategoryHubSpotlight[];
}

function buildCategorySpotlightAnchorId(categorySlug: string): string {
  return `category-spotlight-${String(categorySlug || "").trim().toLowerCase()}`;
}

function sortByStars(left: MarketplaceSkill, right: MarketplaceSkill): number {
  if (right.star_count !== left.star_count) {
    return right.star_count - left.star_count;
  }

  if (right.quality_score !== left.quality_score) {
    return right.quality_score - left.quality_score;
  }

  return left.name.localeCompare(right.name);
}

function sortByPopularity(left: MarketplaceSkill, right: MarketplaceSkill): number {
  if (right.quality_score !== left.quality_score) {
    return right.quality_score - left.quality_score;
  }

  if (right.star_count !== left.star_count) {
    return right.star_count - left.star_count;
  }

  return Date.parse(right.updated_at || "") - Date.parse(left.updated_at || "");
}

function sortByAgentReadiness(left: MarketplaceSkill, right: MarketplaceSkill): number {
  if (left.source_type !== right.source_type) {
    if (left.source_type === "repository") {
      return -1;
    }

    if (right.source_type === "repository") {
      return 1;
    }
  }

  return sortByStars(left, right);
}

function sortByHumanReadiness(left: MarketplaceSkill, right: MarketplaceSkill): number {
  if (left.source_type !== right.source_type) {
    if (left.source_type === "manual") {
      return -1;
    }

    if (right.source_type === "manual") {
      return 1;
    }
  }

  return sortByPopularity(left, right);
}

function takeTopMarketplaceItems(items: MarketplaceSkill[], limit: number, comparator: (left: MarketplaceSkill, right: MarketplaceSkill) => number) {
  return [...items].sort(comparator).slice(0, limit);
}

function mergeSpotlightSubcategories(category: MarketplaceCategory, limit: number): MarketplaceSubcategory[] {
  return [...category.subcategories]
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, limit);
}

function buildAudienceSkillSections(
  items: MarketplaceSkill[],
  sectionLimit: number,
  audience: MarketplaceCategoryHubAudience
): MarketplaceCategoryHubSkillSection[] {
  const sectionsBySlug: Record<MarketplaceCategoryHubSectionSlug, MarketplaceSkill[]> = {
    "most-installed": takeTopMarketplaceItems(items, sectionLimit, sortByAgentReadiness),
    popular: takeTopMarketplaceItems(items, sectionLimit, sortByPopularity),
    featured:
      audience === "human"
        ? takeTopMarketplaceItems(items, sectionLimit, sortByHumanReadiness)
        : resolveFeaturedMarketplaceItems(items, sectionLimit),
    "recently-updated": resolveLatestMarketplaceItems(items, sectionLimit)
  };
  const orderedSlugs: MarketplaceCategoryHubSectionSlug[] =
    audience === "human"
      ? ["featured", "popular", "recently-updated", "most-installed"]
      : ["most-installed", "popular", "featured", "recently-updated"];

  return orderedSlugs.map((slug) => ({
    slug,
    items: sectionsBySlug[slug]
  }));
}

export function buildMarketplaceCategoryHubNavigationItems(
  categories: MarketplaceCategory[]
): MarketplaceCategoryHubNavigationItem[] {
  return buildMarketplaceCategoryCatalog(categories).map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.count,
    anchorId: buildCategorySpotlightAnchorId(category.slug)
  }));
}

export function buildMarketplaceCategoryHubModel(
  categories: MarketplaceCategory[],
  items: MarketplaceSkill[],
  sectionLimit = 6,
  audience: MarketplaceCategoryHubAudience = "agent"
): MarketplaceCategoryHubModel {
  const catalogCategories = buildMarketplaceCategoryCatalog(categories);
  const navigationItems = buildMarketplaceCategoryHubNavigationItems(categories);
  const spotlightComparator = audience === "human" ? sortByHumanReadiness : sortByAgentReadiness;
  const skillSections = buildAudienceSkillSections(items, sectionLimit, audience);

  const categorySpotlights = catalogCategories.map((category) => {
    const categoryItems = filterMarketplaceItemsByCategory(items, category.slug);
    const featuredSkills = takeTopMarketplaceItems(categoryItems, 4, spotlightComparator);

    return {
      slug: category.slug,
      name: category.name,
      description: category.description,
      count: category.count,
      anchorId: buildCategorySpotlightAnchorId(category.slug),
      subcategories: mergeSpotlightSubcategories(category, 4),
      featuredSkills,
      previewSkills: featuredSkills.slice(0, 1)
    };
  });

  return {
    navigationItems,
    skillSections,
    categorySpotlights
  };
}
