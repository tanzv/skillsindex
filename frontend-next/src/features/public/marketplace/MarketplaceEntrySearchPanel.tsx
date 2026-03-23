"use client";

import { useMemo } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { splitPublicPathPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { useResolvedPublicPathname } from "@/src/lib/routing/useResolvedPublicPathname";

import { MarketplaceSearchForm } from "./MarketplaceSearchForm";
import { MarketplaceSearchStrip } from "./MarketplaceSearchStrip";
import { createMarketplaceSearchHref } from "./searchHistory";

interface MarketplaceEntrySearchPanelProps {
  action: string;
  suggestions?: string[];
}

export function MarketplaceEntrySearchPanel({
  action,
  suggestions = []
}: MarketplaceEntrySearchPanelProps) {
  const resolvedPathname = useResolvedPublicPathname();
  const { prefix } = splitPublicPathPrefix(resolvedPathname);
  const { messages } = usePublicI18n();
  const resolvedAction = useMemo(() => withPublicPathPrefix(prefix, action), [action, prefix]);
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

  return (
    <MarketplaceSearchStrip
      variant="entry"
      recommendationLabel={messages.searchRecommendedLabel}
      suggestions={suggestionLinks}
      formContent={
        <MarketplaceSearchForm
          action={resolvedAction}
          placeholder={messages.searchPlaceholder}
          semanticPlaceholder={messages.searchSemanticPlaceholder}
          submitLabel={messages.searchButton}
          queryAriaLabel={messages.searchButton}
          semanticAriaLabel={messages.searchSemanticLabel}
          showSubmitAction={false}
        />
      }
      utilityContent={
        <div className="marketplace-search-utility-row" aria-label={messages.searchUtilityAriaLabel}>
          <div className="marketplace-search-utility-left">
            <span className="marketplace-search-utility-pill">{messages.searchModeLabel}</span>
            <span className="marketplace-search-utility-pill">{messages.searchSortLabel}</span>
            <span className="marketplace-search-utility-pill">{messages.searchViewLabel}</span>
          </div>
        </div>
      }
    />
  );
}
