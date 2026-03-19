"use client";

import { useEffect, useMemo, useState } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { splitPublicPathPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { useResolvedPublicPathname } from "@/src/lib/routing/useResolvedPublicPathname";

import { MarketplaceSearchOverlay } from "./MarketplaceSearchOverlay";
import { MarketplaceSearchForm } from "./MarketplaceSearchForm";
import { MarketplaceSearchStrip } from "./MarketplaceSearchStrip";
import { createMarketplaceSearchHref } from "./searchHistory";
import { useMarketplaceRecentSearches } from "./useMarketplaceRecentSearches";

interface MarketplaceSearchPanelProps {
  variant?: "entry" | "results";
  action: string;
  title?: string;
  description?: string;
  query?: string;
  semanticQuery?: string;
  placeholder?: string;
  submitLabel?: string;
  suggestions?: string[];
  contextLabel?: string;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
  readOnlyQuery?: boolean;
  showSubmitAction?: boolean;
  showSemanticField?: boolean;
  showRecentAction?: boolean;
}

export function MarketplaceSearchPanel({
  variant,
  action,
  title,
  description,
  query = "",
  semanticQuery = "",
  placeholder,
  submitLabel,
  suggestions = [],
  contextLabel,
  hiddenFields = [],
  readOnlyQuery = false,
  showSubmitAction = true,
  showSemanticField = false,
  showRecentAction = true
}: MarketplaceSearchPanelProps) {
  const resolvedPathname = useResolvedPublicPathname();
  const { prefix } = splitPublicPathPrefix(resolvedPathname);
  const { messages } = usePublicI18n();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState(query);
  const [overlayTags, setOverlayTags] = useState(semanticQuery);
  const { entries, addEntry, clearEntries } = useMarketplaceRecentSearches();
  const resolvedAction = useMemo(() => withPublicPathPrefix(prefix, action), [action, prefix]);
  const resolvedPlaceholder = placeholder || messages.searchPlaceholder;
  const resolvedSemanticPlaceholder = messages.searchSemanticPlaceholder;
  const resolvedSubmitLabel = submitLabel || messages.searchButton;
  const resolvedVariant = variant || (readOnlyQuery ? "entry" : "results");
  const suggestionLinks = useMemo(
    () => {
      const normalizedSuggestions = suggestions
        .map((suggestion) => String(suggestion || "").trim())
        .filter(Boolean)
        .filter((suggestion, index, items) => items.findIndex((item) => item.toLowerCase() === suggestion.toLowerCase()) === index);

      return normalizedSuggestions.map((suggestion) => ({
        href: createMarketplaceSearchHref(resolvedAction, suggestion),
        label: suggestion
      }));
    },
    [resolvedAction, suggestions]
  );

  useEffect(() => {
    setOverlayQuery(query);
  }, [query]);

  useEffect(() => {
    setOverlayTags(semanticQuery);
  }, [semanticQuery]);

  return (
    <>
      <MarketplaceSearchStrip
        variant={resolvedVariant}
        contextLabel={contextLabel}
        title={title}
        description={description}
        recommendationLabel={messages.searchRecommendedLabel}
        suggestions={suggestionLinks}
        formContent={
          <MarketplaceSearchForm
            action={resolvedAction}
            query={query}
            semanticQuery={semanticQuery}
            placeholder={resolvedPlaceholder}
            semanticPlaceholder={resolvedSemanticPlaceholder}
            submitLabel={resolvedSubmitLabel}
            queryAriaLabel={messages.searchButton}
            semanticAriaLabel={messages.searchSemanticLabel}
            hiddenFields={hiddenFields}
            showSemanticField={showSemanticField}
            showSubmitAction={showSubmitAction}
            readOnlyQuery={readOnlyQuery}
            onReadOnlyInteract={() => setIsOverlayOpen(true)}
            onSubmit={(event) => {
              if (readOnlyQuery) {
                event.preventDefault();
                setIsOverlayOpen(true);
                return;
              }

              const formData = new FormData(event.currentTarget);
              addEntry(resolvedAction, String(formData.get("q") || ""), String(formData.get("tags") || ""));
            }}
          />
        }
        utilityContent={
          <div className="marketplace-search-utility-row" aria-label={messages.searchUtilityAriaLabel}>
            <div className="marketplace-search-utility-left">
              <span className="marketplace-search-utility-pill">{messages.searchModeLabel}</span>
              <span className="marketplace-search-utility-pill">{messages.searchSortLabel}</span>
              <span className="marketplace-search-utility-pill">{messages.searchViewLabel}</span>
            </div>
            {showRecentAction ? (
              <button type="button" className="marketplace-topbar-button is-subtle" onClick={() => setIsOverlayOpen(true)}>
                {messages.searchRecentOpen}
              </button>
            ) : null}
          </div>
        }
      />

      <MarketplaceSearchOverlay
        action={resolvedAction}
        isOpen={isOverlayOpen}
        title={messages.searchOverlayTitle}
        description={messages.searchOverlayDescription}
        closeLabel={messages.searchClose}
        clearLabel={messages.searchRecentClear}
        recentTitle={messages.searchRecentTitle}
        recentDescription={messages.searchRecentDescription}
        emptyLabel={messages.searchRecentEmpty}
        queryLabel={messages.searchOverlayTitle}
        queryPlaceholder={resolvedPlaceholder}
        semanticLabel={messages.searchSemanticLabel}
        semanticPlaceholder={resolvedSemanticPlaceholder}
        submitLabel={resolvedSubmitLabel}
        query={overlayQuery}
        tags={overlayTags}
        hiddenFields={hiddenFields}
        entries={entries}
        onClose={() => setIsOverlayOpen(false)}
        onClear={clearEntries}
        onSubmit={() => {
          addEntry(resolvedAction, overlayQuery, overlayTags);
          setIsOverlayOpen(false);
        }}
        onQueryChange={setOverlayQuery}
        onTagsChange={setOverlayTags}
      />
    </>
  );
}
