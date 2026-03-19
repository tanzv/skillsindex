"use client";

import { Search } from "lucide-react";
import type { FormEvent } from "react";

import { cn } from "@/src/lib/utils";

interface MarketplaceSearchFormHiddenField {
  name: string;
  value: string;
}

interface MarketplaceSearchFormProps {
  action: string;
  query?: string;
  semanticQuery?: string;
  placeholder: string;
  semanticPlaceholder: string;
  submitLabel: string;
  queryAriaLabel: string;
  semanticAriaLabel: string;
  hiddenFields?: MarketplaceSearchFormHiddenField[];
  showSemanticField?: boolean;
  showSubmitAction?: boolean;
  readOnlyQuery?: boolean;
  formClassName?: string;
  rowClassName?: string;
  queryFieldClassName?: string;
  semanticFieldClassName?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onReadOnlyInteract?: () => void;
}

export function MarketplaceSearchForm({
  action,
  query = "",
  semanticQuery = "",
  placeholder,
  semanticPlaceholder,
  submitLabel,
  queryAriaLabel,
  semanticAriaLabel,
  hiddenFields = [],
  showSemanticField = false,
  showSubmitAction = true,
  readOnlyQuery = false,
  formClassName,
  rowClassName = "marketplace-search-main-row",
  queryFieldClassName = "marketplace-search-input is-query",
  semanticFieldClassName = "marketplace-search-input is-semantic",
  onSubmit,
  onReadOnlyInteract
}: MarketplaceSearchFormProps) {
  return (
    <form action={action} className={cn("marketplace-search-form", formClassName)} onSubmit={onSubmit}>
      <div className={rowClassName}>
        <label className={queryFieldClassName}>
          <Search size={18} aria-hidden="true" />
          <input
            name="q"
            defaultValue={query}
            placeholder={placeholder}
            aria-label={queryAriaLabel}
            readOnly={readOnlyQuery}
            onClick={readOnlyQuery ? onReadOnlyInteract : undefined}
            onFocus={readOnlyQuery ? onReadOnlyInteract : undefined}
          />
        </label>
        {showSemanticField ? (
          <label className={semanticFieldClassName}>
            <input
              name="tags"
              defaultValue={semanticQuery}
              placeholder={semanticPlaceholder}
              aria-label={semanticAriaLabel}
            />
          </label>
        ) : null}
        {hiddenFields.map((item) => (
          <input key={`${item.name}-${item.value}`} type="hidden" name={item.name} value={item.value} />
        ))}
        {showSubmitAction ? <button className="marketplace-search-submit">{submitLabel}</button> : null}
      </div>
    </form>
  );
}
