"use client";

import { useCallback, useState } from "react";

import {
  marketplaceSearchHistoryStorageKey,
  readMarketplaceRecentSearches,
  recordMarketplaceRecentSearch,
  type MarketplaceRecentSearchEntry
} from "./searchHistory";

function readEntriesFromStorage(): MarketplaceRecentSearchEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  return readMarketplaceRecentSearches(window.localStorage.getItem(marketplaceSearchHistoryStorageKey));
}

export function useMarketplaceRecentSearches() {
  const [entries, setEntries] = useState<MarketplaceRecentSearchEntry[]>(() => readEntriesFromStorage());

  const persistEntries = useCallback((nextEntries: MarketplaceRecentSearchEntry[]) => {
    setEntries(nextEntries);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(marketplaceSearchHistoryStorageKey, JSON.stringify(nextEntries));
    }
  }, []);

  const addEntry = useCallback(
    (route: string, query: string, tags?: string) => {
      const nextEntries = recordMarketplaceRecentSearch(readEntriesFromStorage(), route, query, tags);
      persistEntries(nextEntries);
    },
    [persistEntries]
  );

  const clearEntries = useCallback(() => {
    persistEntries([]);
  }, [persistEntries]);

  return {
    entries,
    addEntry,
    clearEntries
  };
}
