import type { KeyboardEvent } from "react";
import type { MarketplaceFilterForm } from "../pages/marketplaceHome/MarketplaceHomePage.helpers";
import type { MarketplaceText } from "../pages/marketplacePublic/marketplaceText";
import type { MarketplaceSubcategoryOption } from "../pages/marketplaceHome/MarketplaceHomePage.subcategory";
import MarketplaceGlobalSearchBar from "./MarketplaceGlobalSearchBar";

export interface MarketplaceCategoryFilterOption {
  value: string;
  label: string;
}

interface MarketplaceCategorySearchControlsProps {
  text: MarketplaceText;
  categoryName: string;
  form: MarketplaceFilterForm;
  categoryOptions: MarketplaceSubcategoryOption[];
  sortOptions: MarketplaceCategoryFilterOption[];
  modeOptions: MarketplaceCategoryFilterOption[];
  submitDisabled: boolean;
  onFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  onSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onSubcategoryFilterApply: (subcategorySlug: string) => void;
  onSortFilterApply: (sortValue: string) => void;
  onModeFilterApply: (modeValue: string) => void;
}

export default function MarketplaceCategorySearchControls({
  text,
  categoryName,
  form,
  categoryOptions,
  sortOptions,
  modeOptions,
  submitDisabled,
  onFilterFieldChange,
  onSearchInputKeyDown,
  onSearchSubmit,
  onSubcategoryFilterApply,
  onSortFilterApply,
  onModeFilterApply
}: MarketplaceCategorySearchControlsProps) {
  return (
    <>
      <section className="marketplace-category-heading" aria-label="Category detail heading">
        <span className="marketplace-category-heading-overline">{text.categoryNav}</span>
        <h2>{categoryName || text.categoryNav}</h2>
      </section>

      <section className="marketplace-subcategory-row" role="group" aria-label="Subcategory filters">
        <span className="marketplace-subcategory-label">{text.allSubcategories}</span>
        <div className="marketplace-subcategory-chips">
          <button
            type="button"
            className={String(form.subcategory || "").trim() ? "" : "is-active"}
            onClick={() => onSubcategoryFilterApply("")}
          >
            {text.allSubcategories}
          </button>
          {categoryOptions.map((subcategory) => (
            <button
              key={`subcategory-filter-${subcategory.slug}`}
              type="button"
              className={subcategory.slug === form.subcategory ? "is-active" : ""}
              onClick={() => onSubcategoryFilterApply(subcategory.slug)}
            >
              {`${subcategory.name} ${subcategory.count}`}
            </button>
          ))}
        </div>
      </section>

      <MarketplaceGlobalSearchBar
        queryAriaLabel={text.queryKeyword}
        queryValue={form.q}
        queryPlaceholder={text.queryPlaceholder}
        onQueryChange={(value) => onFilterFieldChange("q", value)}
        onQueryKeyDown={onSearchInputKeyDown}
        submitLabel={text.search}
        onSubmit={onSearchSubmit}
        showSubmitAction={false}
        submitDisabled={submitDisabled}
      />

      <section className="marketplace-category-filter-row" role="group" aria-label="Category sort and mode filters">
        <div className="marketplace-category-filter-group" aria-label={text.sortLabel}>
          <span className="marketplace-category-filter-label">{text.sortLabel}</span>
          <div className="marketplace-category-filter-chips">
            {sortOptions.map((option) => (
              <button
                key={`sort-filter-${option.value}`}
                type="button"
                className={form.sort === option.value ? "is-active" : ""}
                onClick={() => onSortFilterApply(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="marketplace-category-filter-group" aria-label={text.modeLabel}>
          <span className="marketplace-category-filter-label">{text.modeLabel}</span>
          <div className="marketplace-category-filter-chips">
            {modeOptions.map((option) => (
              <button
                key={`mode-filter-${option.value}`}
                type="button"
                className={form.mode === option.value ? "is-active" : ""}
                onClick={() => onModeFilterApply(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
