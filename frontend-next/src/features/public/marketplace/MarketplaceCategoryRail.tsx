"use client";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { MarketplaceCategory } from "@/src/lib/schemas/public";

import { PublicLink } from "@/src/components/shared/PublicLink";

import { buildMarketplaceCategoryNavigation } from "./marketplaceCategoryNavigation";

interface MarketplaceCategoryRailItem {
  slug: string;
  name: string;
  count: number;
  href: string;
  isActive?: boolean;
}

interface MarketplaceCategoryRailProps {
  categories: MarketplaceCategory[];
  activeCategory?: string;
  title?: string;
  description?: string;
  dataTestId?: string;
  navigationItems?: MarketplaceCategoryRailItem[];
}

function normalizeCategoryValue(rawValue: string | undefined): string {
  return String(rawValue || "")
    .trim()
    .toLowerCase();
}

export function MarketplaceCategoryRail({
  categories,
  activeCategory,
  title,
  description,
  dataTestId = "categories-rail",
  navigationItems
}: MarketplaceCategoryRailProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const resolvedNavigationItems: MarketplaceCategoryRailItem[] =
    navigationItems ||
    buildMarketplaceCategoryNavigation(categories).map((item) => ({
      ...item,
      href: toPublicPath(`/categories/${item.slug}`)
    }));
  const normalizedActiveCategory = normalizeCategoryValue(activeCategory);

  return (
    <aside className="marketplace-category-reference-sidebar" data-testid={dataTestId}>
      <section className="marketplace-section-card marketplace-category-rail-card">
        <div className="marketplace-section-header">
          <h3>{title || messages.shellCategories}</h3>
          <p>{description || messages.resultsCategoryPivotsDescription}</p>
        </div>

        <div className="marketplace-category-nav-list">
          {resolvedNavigationItems.map((item) => {
            const isActive = item.isActive ?? item.slug === normalizedActiveCategory;

            return (
              <PublicLink
                key={item.slug}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`marketplace-category-nav-item${isActive ? " is-active" : ""}`}
              >
                <span className="marketplace-sidebar-link">{item.name}</span>
                <span className="marketplace-category-nav-count">{item.count}</span>
              </PublicLink>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
