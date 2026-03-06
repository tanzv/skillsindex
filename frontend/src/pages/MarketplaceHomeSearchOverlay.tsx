import type { KeyboardEvent } from "react";
import type { MarketplaceSearchHistoryEntry } from "../lib/marketplaceSearchHistory";
import type { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";
import type { MarketplaceText } from "./marketplaceText";
import MarketplaceResultsPage from "./MarketplaceResultsPage";

interface MarketplaceHomeSearchOverlayProps {
  isVisible: boolean;
  text: MarketplaceText;
  form: MarketplaceFilterForm;
  recentSearches: MarketplaceSearchHistoryEntry[];
  isLightTheme: boolean;
  onFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  onSearchSubmit: () => void;
  onSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onRecentSearchApply: (entry: MarketplaceSearchHistoryEntry) => void;
  onRecentSearchClear: () => void;
  onClose: () => void;
}

export default function MarketplaceHomeSearchOverlay({
  isVisible,
  text,
  form,
  recentSearches,
  isLightTheme,
  onFilterFieldChange,
  onSearchSubmit,
  onSearchInputKeyDown,
  onRecentSearchApply,
  onRecentSearchClear,
  onClose
}: MarketplaceHomeSearchOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <MarketplaceResultsPage
      text={text}
      form={form}
      recentSearches={recentSearches}
      isLightTheme={isLightTheme}
      onFilterFieldChange={onFilterFieldChange}
      onSearchSubmit={onSearchSubmit}
      onSearchInputKeyDown={onSearchInputKeyDown}
      onRecentSearchApply={onRecentSearchApply}
      onRecentSearchClear={onRecentSearchClear}
      onClose={onClose}
    />
  );
}
