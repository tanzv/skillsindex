"use client";

import Link from "next/link";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { cn } from "@/src/lib/utils";

import type { MarketplaceSummaryMetric } from "./marketplaceViewModel";
import { MarketplaceRecentSearchesCard } from "./MarketplaceRecentSearchesCard";

interface MarketplaceSidebarLink {
  href: string;
  label: string;
  count?: number;
  metaLabel?: string;
  isActive?: boolean;
}

interface MarketplaceDiscoverySidebarProps {
  fallbackLinks: Array<{ href: string; label: string }>;
  categoryTitle: string;
  categoryDescription: string;
  categoryLinks: MarketplaceSidebarLink[];
  summaryMetrics: MarketplaceSummaryMetric[];
}

export function MarketplaceDiscoverySidebar({
  fallbackLinks,
  categoryTitle,
  categoryDescription,
  categoryLinks,
  summaryMetrics
}: MarketplaceDiscoverySidebarProps) {
  const { messages } = usePublicI18n();

  return (
    <div className="marketplace-side-column">
      <MarketplaceRecentSearchesCard fallbackLinks={fallbackLinks} />

      <section className="marketplace-section-card">
        <div className="marketplace-section-header">
          <h3>{categoryTitle}</h3>
          <p>{categoryDescription}</p>
        </div>
        <div className="marketplace-simple-link-list">
          {categoryLinks.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className={cn("marketplace-simple-link-item", item.isActive && "is-active")}>
              <span className="marketplace-sidebar-link">{item.label}</span>
              <span className="marketplace-meta-text">
                {item.metaLabel || (typeof item.count === "number" ? `${item.count} ${messages.skillCountSuffix}` : "")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="marketplace-section-card">
        <div className="marketplace-section-header">
          <h3>{messages.resultsDiscoveryNotesTitle}</h3>
          <p>{messages.resultsDiscoveryNotesDescription}</p>
        </div>
        <div className="marketplace-list-stack">
          {summaryMetrics.slice(0, 3).map((metric) => (
            <div key={metric.label} className="marketplace-stat-card">
              <div className="marketplace-stat-card-label">{metric.label}</div>
              <div className="marketplace-stat-card-value">{metric.value}</div>
              <div className="marketplace-stat-card-detail">{metric.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
