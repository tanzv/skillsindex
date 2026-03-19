"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";

import { MarketplaceCategorySkillCard } from "./MarketplaceCategorySkillCard";
import type { MarketplaceCategoryHubSpotlight } from "./marketplaceCategoryHubModel";
import { formatCompactMarketplaceNumber } from "./marketplaceViewModel";

interface MarketplaceCategoryShowcaseSectionProps {
  spotlight: MarketplaceCategoryHubSpotlight;
}

export function MarketplaceCategoryShowcaseSection({ spotlight }: MarketplaceCategoryShowcaseSectionProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();

  if (spotlight.count <= 0) {
    return null;
  }

  return (
    <section
      id={spotlight.anchorId}
      className="marketplace-section-card marketplace-category-showcase-card"
      data-testid={`category-spotlight-shelf-${spotlight.slug}`}
    >
      <div className="marketplace-category-showcase-head">
        <div className="marketplace-category-showcase-header">
          <div className="marketplace-section-header">
            <h3>{spotlight.name}</h3>
            <p>{spotlight.description}</p>
          </div>

          <div className="marketplace-pill-row marketplace-category-showcase-meta">
            <span className="marketplace-search-utility-pill">
              {formatCompactMarketplaceNumber(spotlight.count)} {messages.skillCountSuffix}
            </span>
            <span className="marketplace-search-utility-pill">
              {formatCompactMarketplaceNumber(spotlight.subcategories.length)} {messages.categoryAllSubcategories}
            </span>
          </div>
        </div>

        <div className="marketplace-category-showcase-actions">
          <PublicLink href={toPublicPath(`/categories/${spotlight.slug}`)} className="marketplace-topbar-button is-primary">
            {messages.categoryAllSubcategories}
          </PublicLink>
        </div>
      </div>

      <div className="marketplace-pill-row marketplace-category-showcase-pill-row">
        {spotlight.subcategories.map((subcategory) => (
          <PublicLink
            key={`${spotlight.slug}-${subcategory.slug}`}
            href={toPublicPath(`/categories/${spotlight.slug}?subcategory=${subcategory.slug}`)}
            className="marketplace-recommendation-chip"
          >
            {subcategory.name}
          </PublicLink>
        ))}
      </div>

      <div className="marketplace-category-showcase-grid">
        {spotlight.featuredSkills.map((item) => (
          <MarketplaceCategorySkillCard key={`${spotlight.slug}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
