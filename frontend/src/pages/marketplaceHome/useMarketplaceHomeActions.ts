import { useCallback, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";

import {
  appendMarketplaceSearchHistory,
  clearMarketplaceSearchHistory,
  type MarketplaceSearchHistoryEntry
} from "../../lib/marketplaceSearchHistory";
import type { MarketplaceQueryParams, SessionUser } from "../../lib/api";
import { normalizeFilterFormQuery } from "../marketplacePublic/MarketplacePublicQuery";
import type { HomeChipFilter } from "./MarketplaceHomePage.config";
import type { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";

interface MarketplaceHomeActionsOptions {
  form: MarketplaceFilterForm;
  currentPage: number;
  totalPages: number;
  isResultsPage: boolean;
  isSearchOverlayOpen: boolean;
  effectiveQueryState: MarketplaceQueryParams;
  sessionUser: SessionUser | null;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  toHomePath: () => string;
  toPublicPath: (path: string) => string;
  commitQuery: (next: MarketplaceQueryParams, target?: "home" | "results") => void;
  setForm: Dispatch<SetStateAction<MarketplaceFilterForm>>;
  setRecentSearches: Dispatch<SetStateAction<MarketplaceSearchHistoryEntry[]>>;
  setIsSearchOverlayOpen: Dispatch<SetStateAction<boolean>>;
}

export interface MarketplaceHomeActionsResult {
  handleBrandClick: () => void;
  handleSearchSubmit: () => void;
  handleSearchEntryOpen: () => void;
  handleSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handlePageChange: (page: number) => void;
  handleSkillOpen: (skillID: number | null) => void;
  handleHotFilterApply: (filter: HomeChipFilter) => void;
  handleFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  handleOverlayClose: () => void;
  handleRecentSearchApply: (entry: MarketplaceSearchHistoryEntry) => void;
  handleRecentSearchClear: () => void;
  handleTopbarAuthAction: () => void;
  handleTopbarConsoleAction: () => void;
}

export function useMarketplaceHomeActions({
  form,
  currentPage,
  totalPages,
  isResultsPage,
  isSearchOverlayOpen,
  effectiveQueryState,
  sessionUser,
  onNavigate,
  onLogout,
  toHomePath,
  toPublicPath,
  commitQuery,
  setForm,
  setRecentSearches,
  setIsSearchOverlayOpen
}: MarketplaceHomeActionsOptions): MarketplaceHomeActionsResult {
  const handleBrandClick = useCallback(() => {
    onNavigate(toHomePath());
  }, [onNavigate, toHomePath]);

  const handleSearchSubmit = useCallback(() => {
    if (!isResultsPage && !isSearchOverlayOpen) {
      setIsSearchOverlayOpen(true);
      return;
    }
    const normalizedForm = normalizeFilterFormQuery(form);
    setRecentSearches(
      appendMarketplaceSearchHistory({
        q: normalizedForm.q,
        tags: normalizedForm.tags
      })
    );
    setIsSearchOverlayOpen(false);
    commitQuery({ ...normalizedForm, page: 1 }, "results");
  }, [commitQuery, form, isResultsPage, isSearchOverlayOpen, setIsSearchOverlayOpen, setRecentSearches]);

  const handleSearchEntryOpen = useCallback(() => {
    setIsSearchOverlayOpen(true);
  }, [setIsSearchOverlayOpen]);

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) {
        return;
      }
      commitQuery({ ...effectiveQueryState, page }, isResultsPage ? "results" : "home");
    },
    [commitQuery, currentPage, effectiveQueryState, isResultsPage, totalPages]
  );

  const handleSkillOpen = useCallback(
    (skillID: number | null) => {
      setIsSearchOverlayOpen(false);
      if (skillID) {
        onNavigate(toPublicPath(`/skills/${skillID}`));
        return;
      }
      onNavigate(toHomePath());
    },
    [onNavigate, setIsSearchOverlayOpen, toHomePath, toPublicPath]
  );

  const handleHotFilterApply = useCallback(
    (filter: HomeChipFilter) => {
      const nextForm: MarketplaceFilterForm = {
        ...form,
        tags: filter.queryTags
      };
      const normalizedNextForm = normalizeFilterFormQuery(nextForm);
      setForm(nextForm);
      setRecentSearches(
        appendMarketplaceSearchHistory({
          q: normalizedNextForm.q,
          tags: normalizedNextForm.tags
        })
      );
      setIsSearchOverlayOpen(false);
      commitQuery({ ...normalizedNextForm, page: 1 }, "results");
    },
    [commitQuery, form, setForm, setIsSearchOverlayOpen, setRecentSearches]
  );

  const handleFilterFieldChange = useCallback(
    (field: keyof MarketplaceFilterForm, value: string) => {
      setForm((previousForm) => ({
        ...previousForm,
        [field]: value
      }));
    },
    [setForm]
  );

  const handleOverlayClose = useCallback(() => {
    setIsSearchOverlayOpen(false);
  }, [setIsSearchOverlayOpen]);

  const handleRecentSearchApply = useCallback(
    (entry: MarketplaceSearchHistoryEntry) => {
      const nextForm: MarketplaceFilterForm = {
        ...form,
        q: entry.q,
        tags: entry.tags
      };
      const normalizedNextForm = normalizeFilterFormQuery(nextForm);
      setForm(nextForm);
      setRecentSearches(
        appendMarketplaceSearchHistory({
          q: normalizedNextForm.q,
          tags: normalizedNextForm.tags
        })
      );
      setIsSearchOverlayOpen(false);
      commitQuery({ ...normalizedNextForm, page: 1 }, "results");
    },
    [commitQuery, form, setForm, setIsSearchOverlayOpen, setRecentSearches]
  );

  const handleRecentSearchClear = useCallback(() => {
    clearMarketplaceSearchHistory();
    setRecentSearches([]);
  }, [setRecentSearches]);

  const handleTopbarAuthAction = useCallback((): void => {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
  }, [onLogout, onNavigate, sessionUser, toPublicPath]);

  const handleTopbarConsoleAction = useCallback((): void => {
    onNavigate("/workspace");
  }, [onNavigate]);

  return {
    handleBrandClick,
    handleSearchSubmit,
    handleSearchEntryOpen,
    handleSearchInputKeyDown,
    handlePageChange,
    handleSkillOpen,
    handleHotFilterApply,
    handleFilterFieldChange,
    handleOverlayClose,
    handleRecentSearchApply,
    handleRecentSearchClear,
    handleTopbarAuthAction,
    handleTopbarConsoleAction
  };
}
