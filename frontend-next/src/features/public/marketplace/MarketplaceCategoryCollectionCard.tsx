"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import type { MarketplaceCategoryCollectionCard as MarketplaceCategoryCollectionCardModel } from "./marketplaceCategoryCollections";

interface MarketplaceCategoryCollectionCardProps {
  card: MarketplaceCategoryCollectionCardModel;
}

export function MarketplaceCategoryCollectionCard({ card }: MarketplaceCategoryCollectionCardProps) {
  const quickLinks = card.links.slice(0, 2);
  const leadMetric = card.highlight.metrics[0];

  return (
    <article className="marketplace-section-card marketplace-category-collection-card">
      <div className="marketplace-category-collection-topline">
        <div className="marketplace-category-collection-labels">
          <h3 className="marketplace-category-collection-title">{card.title}</h3>
          <p className="marketplace-category-collection-eyebrow">{card.highlight.eyebrow}</p>
          <p className="marketplace-category-collection-highlight-title">{card.highlight.title}</p>
        </div>
        {leadMetric ? <span className="marketplace-search-utility-pill">{leadMetric}</span> : null}
      </div>

      <div className="marketplace-category-collection-copy">
        <p className="marketplace-category-collection-description">{card.description}</p>
        <p className="marketplace-category-collection-caption">{card.highlight.description}</p>
      </div>

      <div className="marketplace-category-collection-links">
        {quickLinks.map((link) => (
          <PublicLink key={link.key} href={link.href} className="marketplace-category-collection-link">
            <span className="marketplace-sidebar-link">{link.label}</span>
            <span className="marketplace-meta-text">{link.meta}</span>
          </PublicLink>
        ))}
      </div>

      <div className="marketplace-category-collection-footer">
        <div className="marketplace-pill-row marketplace-category-collection-metrics">
          {card.highlight.metrics.slice(1).map((metric) => (
            <span key={`${card.key}-${metric}`} className="marketplace-search-utility-pill">
              {metric}
            </span>
          ))}
        </div>

        <div className="marketplace-category-collection-actions">
          <PublicLink
            href={card.actionHref}
            className={`marketplace-topbar-button${card.actionVariant === "primary" ? " is-primary" : ""}`}
          >
            {card.actionLabel}
          </PublicLink>
          {card.secondaryAction ? (
            <PublicLink href={card.secondaryAction.href} className="marketplace-topbar-button">
              {card.secondaryAction.label}
            </PublicLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}
