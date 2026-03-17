import type { MarketplaceCategory, MarketplaceSkill, MarketplaceSubcategory } from "@/src/lib/schemas/public";

import { filterMarketplaceItemsByCategory, resolveFeaturedMarketplaceItems, resolveLatestMarketplaceItems } from "./marketplaceViewModel";
import { buildMarketplaceCategoryNavigation } from "./marketplaceCategoryNavigation";

export type MarketplaceCategoryHubSectionSlug = "most-installed" | "popular" | "featured" | "recently-updated";

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

function takeTopMarketplaceItems(items: MarketplaceSkill[], limit: number, comparator: (left: MarketplaceSkill, right: MarketplaceSkill) => number) {
  return [...items].sort(comparator).slice(0, limit);
}

export function buildMarketplaceCategoryHubModel(
  categories: MarketplaceCategory[],
  items: MarketplaceSkill[],
  sectionLimit = 6
): MarketplaceCategoryHubModel {
  const orderedCategories = buildMarketplaceCategoryNavigation(categories);
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const navigationItems = orderedCategories.map((category) => ({
    ...category,
    anchorId: buildCategorySpotlightAnchorId(category.slug)
  }));

  const skillSections: MarketplaceCategoryHubSkillSection[] = [
    {
      slug: "most-installed",
      items: takeTopMarketplaceItems(items, sectionLimit, sortByStars)
    },
    {
      slug: "popular",
      items: takeTopMarketplaceItems(items, sectionLimit, sortByPopularity)
    },
    {
      slug: "featured",
      items: resolveFeaturedMarketplaceItems(items, sectionLimit)
    },
    {
      slug: "recently-updated",
      items: resolveLatestMarketplaceItems(items, sectionLimit)
    }
  ];

  const categorySpotlights = orderedCategories.map((category) => {
    const categorySummary = categoriesBySlug.get(category.slug);

    if (!categorySummary) {
      return {
        slug: category.slug,
        name: category.name,
        description: "",
        count: category.count,
        anchorId: buildCategorySpotlightAnchorId(category.slug),
        subcategories: [],
        previewSkills: []
      };
    }

    const categoryItems = takeTopMarketplaceItems(filterMarketplaceItemsByCategory(items, category.slug), 1, sortByStars);

    return {
      slug: category.slug,
      name: categorySummary.name,
      description: categorySummary.description,
      count: categorySummary.count,
      anchorId: buildCategorySpotlightAnchorId(category.slug),
      subcategories: categorySummary.subcategories.slice(0, 4),
      previewSkills: categoryItems
    };
  });

  return {
    navigationItems,
    skillSections,
    categorySpotlights
  };
}
