import type { MarketplaceCategory } from "@/src/lib/schemas/public";

export interface MarketplaceCategoryNavigationItem {
  slug: string;
  name: string;
  count: number;
}

export function buildMarketplaceCategoryNavigation(categories: MarketplaceCategory[]): MarketplaceCategoryNavigationItem[] {
  return [...categories]
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category.count
    }));
}
