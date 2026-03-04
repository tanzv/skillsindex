import type { KeyboardEvent } from "react";
import type { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";
import type { MarketplaceText } from "./marketplaceText";
import type { MarketplaceSubcategoryOption } from "./MarketplaceHomePage.subcategory";
import type { MarketplaceCategoryDetailFilterOption } from "./MarketplaceCategoryDetailFilters.config";
import MarketplaceSearchMainRow from "./MarketplaceSearchMainRow";

interface MarketplaceCategoryDetailFiltersProps {
  text: MarketplaceText;
  categoryName: string;
  form: MarketplaceFilterForm;
  categoryOptions: MarketplaceSubcategoryOption[];
  sortOptions: MarketplaceCategoryDetailFilterOption[];
  modeOptions: MarketplaceCategoryDetailFilterOption[];
  submitDisabled: boolean;
  onFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  onSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onSubcategoryFilterApply: (subcategorySlug: string) => void;
  onSortFilterApply: (sortValue: string) => void;
  onModeFilterApply: (modeValue: string) => void;
}

export default function MarketplaceCategoryDetailFilters({
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
}: MarketplaceCategoryDetailFiltersProps) {
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

      <MarketplaceSearchMainRow
        queryAriaLabel={text.queryKeyword}
        queryValue={form.q}
        queryPlaceholder={text.queryPlaceholder}
        onQueryChange={(value) => onFilterFieldChange("q", value)}
        onQueryKeyDown={onSearchInputKeyDown}
        semanticAriaLabel={text.querySemantic}
        semanticValue={form.tags}
        semanticPlaceholder={text.semanticPlaceholder}
        onSemanticChange={(value) => onFilterFieldChange("tags", value)}
        submitLabel={text.search}
        onSubmit={onSearchSubmit}
        submitDisabled={submitDisabled}
      />

      <section className="marketplace-category-filter-row" role="group" aria-label="Category sort and mode filters">
        <div className="marketplace-category-filter-group">
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
        <div className="marketplace-category-filter-group">
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
      </section>
    </>
  );
}
