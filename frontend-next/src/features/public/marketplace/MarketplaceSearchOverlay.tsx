"use client";

import { Search } from "lucide-react";

import { buildMarketplaceRecentSearchLabel, createMarketplaceSearchHref, type MarketplaceRecentSearchEntry } from "./searchHistory";
import { MarketplaceSupportLinkList } from "./MarketplaceSupportLinkList";

interface MarketplaceSearchOverlayProps {
  action: string;
  isOpen: boolean;
  title: string;
  description: string;
  closeLabel: string;
  clearLabel: string;
  recentTitle: string;
  recentDescription: string;
  emptyLabel: string;
  queryLabel: string;
  queryPlaceholder: string;
  semanticLabel: string;
  semanticPlaceholder: string;
  submitLabel: string;
  query: string;
  tags: string;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
  entries: MarketplaceRecentSearchEntry[];
  onClose: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onQueryChange: (value: string) => void;
  onTagsChange: (value: string) => void;
}

export function MarketplaceSearchOverlay({
  action,
  isOpen,
  title,
  description,
  closeLabel,
  clearLabel,
  recentTitle,
  recentDescription,
  emptyLabel,
  queryLabel,
  queryPlaceholder,
  semanticLabel,
  semanticPlaceholder,
  submitLabel,
  query,
  tags,
  hiddenFields = [],
  entries,
  onClose,
  onClear,
  onSubmit,
  onQueryChange,
  onTagsChange
}: MarketplaceSearchOverlayProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="marketplace-overlay-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="marketplace-overlay-panel marketplace-scroll">
        <div className="marketplace-overlay-body">
          <div className="marketplace-search-overlay-head">
            <div className="marketplace-section-header">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <div className="marketplace-overlay-actions">
              {entries.length > 0 ? (
                <button type="button" className="marketplace-topbar-button is-subtle" onClick={onClear}>
                  {clearLabel}
                </button>
              ) : null}
              <button type="button" className="marketplace-topbar-button" onClick={onClose}>
                {closeLabel}
              </button>
            </div>
          </div>

          <form action={action} className="marketplace-search-form" onSubmit={onSubmit}>
            <div className="marketplace-search-main-row">
              <label className="marketplace-search-input is-query">
                <Search size={18} aria-hidden="true" />
                <input
                  name="q"
                  value={query}
                  placeholder={queryPlaceholder}
                  aria-label={queryLabel}
                  onChange={(event) => onQueryChange(event.target.value)}
                />
              </label>
              <label className="marketplace-search-input is-semantic">
                <input
                  name="tags"
                  value={tags}
                  placeholder={semanticPlaceholder}
                  aria-label={semanticLabel}
                  onChange={(event) => onTagsChange(event.target.value)}
                />
              </label>
              {hiddenFields.map((item) => (
                <input key={`overlay-${item.name}-${item.value}`} type="hidden" name={item.name} value={item.value} />
              ))}
              <button className="marketplace-search-submit">{submitLabel}</button>
            </div>
          </form>

          <div className="marketplace-section-header">
            <h3>{recentTitle}</h3>
            <p>{recentDescription}</p>
          </div>

          {entries.length > 0 ? (
            <MarketplaceSupportLinkList
              className="marketplace-overlay-list"
              items={entries.map((entry) => ({
                key: `${entry.route}-${entry.query}-${entry.tags || ""}`,
                href: createMarketplaceSearchHref(entry.route, entry.query, entry.tags),
                label: buildMarketplaceRecentSearchLabel(entry),
                meta: entry.route,
                onClick: onClose
              }))}
            />
          ) : (
            <div className="marketplace-empty-state">
              <p>{emptyLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
