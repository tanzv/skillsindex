"use client";

import Link from "next/link";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { splitPublicPathPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { useResolvedPublicPathname } from "@/src/lib/routing/useResolvedPublicPathname";

import { buildMarketplaceRecentSearchLabel, createMarketplaceSearchHref } from "./searchHistory";
import { useMarketplaceRecentSearches } from "./useMarketplaceRecentSearches";

interface MarketplaceRecentSearchesCardProps {
  title?: string;
  description?: string;
  emptyHint?: string;
  fallbackLinks?: Array<{
    href: string;
    label: string;
  }>;
}

export function MarketplaceRecentSearchesCard({
  title,
  description,
  emptyHint,
  fallbackLinks = []
}: MarketplaceRecentSearchesCardProps) {
  const resolvedPathname = useResolvedPublicPathname();
  const { prefix } = splitPublicPathPrefix(resolvedPathname);
  const { messages } = usePublicI18n();
  const { entries, clearEntries } = useMarketplaceRecentSearches();

  return (
    <section className="marketplace-section-card">
      <div className="marketplace-section-header">
        <div className="marketplace-search-overlay-head">
          <div className="marketplace-section-header">
            <h3>{title || messages.searchRecentTitle}</h3>
            <p>{description || messages.searchRecentDescription}</p>
          </div>
          {entries.length > 0 ? (
            <button type="button" className="marketplace-topbar-button is-subtle" onClick={clearEntries}>
              {messages.searchRecentClear}
            </button>
          ) : null}
        </div>
      </div>

      <div className="marketplace-list-stack">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Link
              key={`${entry.route}-${entry.query}-${entry.tags || ""}`}
              href={createMarketplaceSearchHref(entry.route, entry.query, entry.tags)}
              className="marketplace-simple-link-item"
            >
              <span className="marketplace-sidebar-link">{buildMarketplaceRecentSearchLabel(entry)}</span>
              <span className="marketplace-meta-text">{entry.route}</span>
            </Link>
          ))
        ) : (
          <div className="marketplace-empty-state">
            <p>{emptyHint || messages.searchRecentEmpty}</p>
            {fallbackLinks.length > 0 ? (
              <div className="marketplace-pill-row">
                {fallbackLinks.map((item) => (
                  <Link key={item.href} href={withPublicPathPrefix(prefix, item.href)} className="marketplace-sidebar-chip">
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
