import type { KeyboardEvent } from "react";

interface MarketplaceSearchMainRowProps {
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
  submitLabel: string;
  onSubmit: () => void;
  submitDisabled?: boolean;
  filterLabel?: string;
  onFilterClick?: () => void;
}

export default function MarketplaceSearchMainRow({
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
  submitLabel,
  onSubmit,
  submitDisabled = false,
  filterLabel,
  onFilterClick
}: MarketplaceSearchMainRowProps) {
  const hasSemanticField = typeof semanticValue === "string";
  const hasFilterAction = Boolean(filterLabel && onFilterClick);

  return (
    <div className="marketplace-search-main-row">
      <label className="marketplace-search-input is-query">
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
        <label className="marketplace-search-input is-semantic">
          <input
            aria-label={semanticAriaLabel}
            type="text"
            value={semanticValue}
            placeholder={semanticPlaceholder}
            onChange={onSemanticChange ? (event) => onSemanticChange(event.target.value) : undefined}
            onKeyDown={onQueryKeyDown}
          />
        </label>
      ) : null}

      <button type="button" className="marketplace-search-submit" onClick={onSubmit} disabled={submitDisabled}>
        {submitLabel}
      </button>

      {hasFilterAction ? (
        <button type="button" className="marketplace-search-filter-btn" onClick={onFilterClick}>
          {filterLabel}
        </button>
      ) : null}
    </div>
  );
}
