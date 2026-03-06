import { KeyboardEvent, useLayoutEffect, useMemo, useRef } from "react";
import type { MarketplaceSearchHistoryEntry } from "../lib/marketplaceSearchHistory";
import MarketplaceGlobalSearchBar from "../components/MarketplaceGlobalSearchBar";
import { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";
import { buildRecentSearchEntryLabel } from "./MarketplaceResultsPage.helpers";
import type { MarketplaceText } from "./marketplaceText";

interface MarketplaceResultsPageProps {
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

export default function MarketplaceResultsPage({
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
}: MarketplaceResultsPageProps) {
  const overlayRootRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const resultsTitle = text.resultsModalTitle;
  const closeLabel = text.resultsClose;
  const modalQueryPlaceholder = text.resultsModalKeywordPlaceholder;
  const semanticPlaceholder = text.resultsModalSemanticPlaceholder;
  const searchLabel = text.search;
  const recentSearchEntries = useMemo(
    () =>
      recentSearches
        .map((entry) => ({
          entry,
          label: buildRecentSearchEntryLabel(entry)
        }))
        .filter((item) => Boolean(item.label))
        .slice(0, 6),
    [recentSearches]
  );
  const hasRecentSearches = recentSearchEntries.length > 0;
  const recentSearchesTitle = "Recent searches";
  const recentSearchesEmptyHint = "History appears here after you submit a query.";

  function getFocusableModalElements(): HTMLElement[] {
    if (!modalRef.current) {
      return [];
    }
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((item) => {
      if (item.getAttribute("aria-hidden") === "true") {
        return false;
      }
      return item.offsetParent !== null || item === document.activeElement;
    });
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableModalElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    const currentFocusedElement = document.activeElement as HTMLElement | null;
    const isFocusInsideModal = currentFocusedElement ? focusableElements.includes(currentFocusedElement) : false;

    if (event.shiftKey) {
      if (!isFocusInsideModal || currentFocusedElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
      return;
    }

    if (!isFocusInsideModal || currentFocusedElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  }

  useLayoutEffect(() => {
    previousFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => {
      const [firstFocusableElement] = getFocusableModalElements();
      if (firstFocusableElement) {
        firstFocusableElement.focus({ preventScroll: true });
        return;
      }
      overlayRootRef.current?.focus({ preventScroll: true });
    });
    return () => {
      previousFocusedElementRef.current?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      ref={overlayRootRef}
      className={`marketplace-results-overlay ${isLightTheme ? "is-light-theme" : "is-dark-theme"}`}
      data-testid="marketplace-results-overlay"
      tabIndex={-1}
      onKeyDownCapture={handleDialogKeyDown}
    >
      <button
        type="button"
        className="marketplace-results-floating-mask"
        data-testid="marketplace-results-floating-mask"
        aria-label={closeLabel}
        onClick={onClose}
      />

      <div className="marketplace-results-overlay-layout">
        <div className="marketplace-results-floating-container" data-testid="marketplace-results-floating-container">
          <section
            ref={modalRef}
            className="marketplace-results-modal"
            role="dialog"
            aria-modal="true"
            aria-label={resultsTitle}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="marketplace-results-modal-header">
              <h2>{resultsTitle}</h2>
              <button
                type="button"
                className="marketplace-results-close marketplace-results-floating-close"
                data-testid="marketplace-results-floating-close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                {closeLabel}
              </button>
            </header>

            <MarketplaceGlobalSearchBar
              rowClassName="marketplace-results-modal-search-row"
              queryFieldClassName="marketplace-results-modal-input is-query"
              semanticFieldClassName="marketplace-results-modal-input is-semantic"
              submitButtonClassName="marketplace-results-modal-search"
              queryAriaLabel={text.queryKeyword}
              queryValue={form.q}
              queryPlaceholder={modalQueryPlaceholder}
              onQueryChange={(value) => onFilterFieldChange("q", value)}
              onQueryKeyDown={onSearchInputKeyDown}
              semanticAriaLabel={text.querySemantic}
              semanticValue={form.tags}
              semanticPlaceholder={semanticPlaceholder}
              onSemanticChange={(value) => onFilterFieldChange("tags", value)}
              submitLabel={searchLabel}
              onSubmit={onSearchSubmit}
              showSubmitAction={false}
            />

            <section className="marketplace-results-modal-context" data-testid="marketplace-results-modal-context">
              <div className="marketplace-results-modal-context-grid">
                <article
                  className="marketplace-results-modal-context-card is-recent-searches"
                  data-testid="marketplace-results-modal-recent-searches"
                >
                  <div className="marketplace-results-modal-context-card-header">
                    <h3>{recentSearchesTitle}</h3>
                    {hasRecentSearches ? (
                      <button
                        type="button"
                        className="marketplace-results-modal-context-clear"
                        onClick={onRecentSearchClear}
                      >
                        {text.resetFilters}
                      </button>
                    ) : null}
                  </div>
                  {hasRecentSearches ? (
                    <div className="marketplace-results-modal-recent-searches">
                      {recentSearchEntries.map(({ entry, label }, index) => (
                        <button
                          key={`recent-search-${index}-${label}`}
                          type="button"
                          onClick={() => onRecentSearchApply(entry)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>{recentSearchesEmptyHint}</p>
                  )}
                </article>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
