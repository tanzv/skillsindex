"use client";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";

import { buildMarketplaceRecentSearchLabel, createMarketplaceSearchHref } from "./searchHistory";
import { MarketplaceSupportCard } from "./MarketplaceSupportCard";
import { MarketplaceSupportLinkList } from "./MarketplaceSupportLinkList";
import { useMarketplaceRecentSearches } from "./useMarketplaceRecentSearches";

interface MarketplaceRecentSearchesCardProps {
  title?: string;
  description?: string;
  emptyHint?: string;
}

export function MarketplaceRecentSearchesCard({
  title,
  description,
  emptyHint
}: MarketplaceRecentSearchesCardProps) {
  const { messages } = usePublicI18n();
  const { entries, clearEntries } = useMarketplaceRecentSearches();

  return (
    <MarketplaceSupportCard
      title={title || messages.searchRecentTitle}
      description={description || messages.searchRecentDescription}
      headerAction={
        entries.length > 0 ? (
          <button type="button" className="marketplace-topbar-button is-subtle" onClick={clearEntries}>
            {messages.searchRecentClear}
          </button>
        ) : undefined
      }
    >
      <div className="marketplace-list-stack">
        {entries.length > 0 ? (
          <MarketplaceSupportLinkList
            items={entries.map((entry) => ({
              key: `${entry.route}-${entry.query}-${entry.tags || ""}`,
              href: createMarketplaceSearchHref(entry.route, entry.query, entry.tags),
              label: buildMarketplaceRecentSearchLabel(entry),
              meta: entry.route
            }))}
          />
        ) : (
          <div className="marketplace-empty-state">
            <p>{emptyHint || messages.searchRecentEmpty}</p>
          </div>
        )}
      </div>
    </MarketplaceSupportCard>
  );
}
