import type { KeyboardEvent } from "react";
import { resolveSearchActionOrder, type MarketplaceSearchActionOrder } from "./MarketplaceGlobalSearchBar.helpers";

export interface MarketplaceGlobalSearchBarProps {
  queryAriaLabel: string;
  queryValue: string;
  queryPlaceholder: string;
  queryReadOnly?: boolean;
  onQueryChange?: (value: string) => void;
  onQueryClick?: () => void;
  onQueryKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  semanticAriaLabel?: string;
  semanticValue?: string;
  semanticPlaceholder?: string;
  onSemanticChange?: (value: string) => void;
  onSemanticKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  submitLabel: string;
  onSubmit: () => void;
  showSubmitAction?: boolean;
  submitDisabled?: boolean;
  filterLabel?: string;
  onFilterClick?: () => void;
  rowClassName?: string;
  queryFieldClassName?: string;
  semanticFieldClassName?: string;
  submitButtonClassName?: string;
  filterButtonClassName?: string;
  actionOrder?: MarketplaceSearchActionOrder;
}

export default function MarketplaceGlobalSearchBar({
  queryAriaLabel,
  queryValue,
  queryPlaceholder,
  queryReadOnly = false,
  onQueryChange,
  onQueryClick,
  onQueryKeyDown,
  semanticAriaLabel,
  semanticValue,
  semanticPlaceholder,
  onSemanticChange,
  onSemanticKeyDown,
  submitLabel,
  onSubmit,
  showSubmitAction = true,
  submitDisabled = false,
  filterLabel,
  onFilterClick,
  rowClassName = "marketplace-search-main-row",
  queryFieldClassName = "marketplace-search-input is-query",
  semanticFieldClassName = "marketplace-search-input is-semantic",
  submitButtonClassName = "marketplace-search-submit",
  filterButtonClassName = "marketplace-search-filter-btn",
  actionOrder = "submit-first"
}: MarketplaceGlobalSearchBarProps) {
  const hasSemanticField = typeof semanticValue === "string";
  const hasFilterAction = Boolean(filterLabel && onFilterClick);
  const actionSequence = resolveSearchActionOrder(actionOrder, hasFilterAction).filter((action) => {
    if (action === "submit" && !showSubmitAction) {
      return false;
    }
    return true;
  });

  function renderAction(action: "submit" | "filter") {
    if (action === "submit") {
      return (
        <button key="submit" type="button" className={submitButtonClassName} onClick={onSubmit} disabled={submitDisabled}>
          {submitLabel}
        </button>
      );
    }
    if (!hasFilterAction) {
      return null;
    }
    return (
      <button key="filter" type="button" className={filterButtonClassName} onClick={onFilterClick}>
        {filterLabel}
      </button>
    );
  }

  return (
    <div className={rowClassName}>
      <label className={queryFieldClassName}>
        <input
          aria-label={queryAriaLabel}
          type="text"
          value={queryValue}
          readOnly={queryReadOnly}
          placeholder={queryPlaceholder}
          onChange={onQueryChange ? (event) => onQueryChange(event.target.value) : undefined}
          onClick={onQueryClick}
          onKeyDown={onQueryKeyDown}
        />
      </label>

      {hasSemanticField ? (
        <label className={semanticFieldClassName}>
          <input
            aria-label={semanticAriaLabel}
            type="text"
            value={semanticValue}
            placeholder={semanticPlaceholder}
            onChange={onSemanticChange ? (event) => onSemanticChange(event.target.value) : undefined}
            onKeyDown={onSemanticKeyDown || onQueryKeyDown}
          />
        </label>
      ) : null}

      {actionSequence.map((action) => renderAction(action))}
    </div>
  );
}
