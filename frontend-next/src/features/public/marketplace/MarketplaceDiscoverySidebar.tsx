"use client";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { cn } from "@/src/lib/utils";

import type { MarketplaceSummaryMetric } from "./marketplaceViewModel";
import { MarketplaceRecentSearchesCard } from "./MarketplaceRecentSearchesCard";
import { MarketplaceSupportCard } from "./MarketplaceSupportCard";
import { MarketplaceSupportLinkList } from "./MarketplaceSupportLinkList";
import { MarketplaceSupportMetricsList } from "./MarketplaceSupportMetricsList";

interface MarketplaceSidebarLink {
  href: string;
  label: string;
  count?: number;
  metaLabel?: string;
  isActive?: boolean;
}

interface MarketplaceDiscoverySidebarProps {
  categoryTitle: string;
  categoryDescription: string;
  categoryLinks: MarketplaceSidebarLink[];
  summaryMetrics: MarketplaceSummaryMetric[];
  wrapInColumn?: boolean;
  className?: string;
}

export function MarketplaceDiscoverySidebar({
  categoryTitle,
  categoryDescription,
  categoryLinks,
  summaryMetrics,
  wrapInColumn = true,
  className
}: MarketplaceDiscoverySidebarProps) {
  const { messages } = usePublicI18n();
  const content = (
    <>
      <MarketplaceRecentSearchesCard />

      <MarketplaceSupportCard title={categoryTitle} description={categoryDescription}>
        <MarketplaceSupportLinkList
          items={categoryLinks.map((item) => ({
            key: `${item.href}-${item.label}`,
            href: item.href,
            label: item.label,
            meta: item.metaLabel || (typeof item.count === "number" ? `${item.count} ${messages.skillCountSuffix}` : undefined),
            isActive: item.isActive
          }))}
        />
      </MarketplaceSupportCard>

      <MarketplaceSupportCard title={messages.resultsDiscoveryNotesTitle} description={messages.resultsDiscoveryNotesDescription}>
        <MarketplaceSupportMetricsList metrics={summaryMetrics} />
      </MarketplaceSupportCard>
    </>
  );

  if (!wrapInColumn) {
    return content;
  }

  return <div className={cn("marketplace-side-column", className)}>{content}</div>;
}
