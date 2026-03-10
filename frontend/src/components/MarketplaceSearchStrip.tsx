import type { KeyboardEvent } from "react";
import type { HomeChipFilter } from "../pages/marketplaceHome/MarketplaceHomePage.config";
import type { MarketplaceFilterForm } from "../pages/marketplaceHome/MarketplaceHomePage.helpers";
import MarketplaceHomeTopRecommendations from "../pages/marketplaceHome/MarketplaceHomeTopRecommendations";
import type { MarketplaceText } from "../pages/marketplacePublic/marketplaceText";
import MarketplaceGlobalSearchBar from "./MarketplaceGlobalSearchBar";

interface MarketplaceSearchStripBaseProps {
  text: MarketplaceText;
  form: MarketplaceFilterForm;
  submitDisabled: boolean;
  hotFilters: HomeChipFilter[];
  onFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  onSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onHotFilterApply: (filter: HomeChipFilter) => void;
}

interface MarketplaceHomeEntrySearchStripProps extends MarketplaceSearchStripBaseProps {
  variant: "home-entry";
  onSearchEntryOpen: () => void;
}

interface MarketplaceResultsSearchStripProps extends MarketplaceSearchStripBaseProps {
  variant: "results";
}

type MarketplaceSearchStripProps = MarketplaceHomeEntrySearchStripProps | MarketplaceResultsSearchStripProps;

export default function MarketplaceSearchStrip(props: MarketplaceSearchStripProps) {
  const {
    text,
    form,
    submitDisabled,
    hotFilters,
    onFilterFieldChange,
    onSearchInputKeyDown,
    onSearchSubmit,
    onHotFilterApply
  } = props;
  const isResultsVariant = props.variant === "results";

  if (isResultsVariant) {
    return (
      <>
        <MarketplaceGlobalSearchBar
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
          showSubmitAction={false}
          submitDisabled={submitDisabled}
        />

        <MarketplaceHomeTopRecommendations
          label={text.recommendedLabel}
          filters={hotFilters}
          onApply={onHotFilterApply}
        />
      </>
    );
  }

  return (
    <>
      <MarketplaceHomeTopRecommendations label={text.recommendedLabel} filters={hotFilters} onApply={onHotFilterApply} />

      <MarketplaceGlobalSearchBar
        queryAriaLabel={text.queryKeyword}
        queryValue={form.q}
        queryPlaceholder={text.queryPlaceholder}
        queryReadOnly
        onQueryClick={props.onSearchEntryOpen}
        onQueryKeyDown={onSearchInputKeyDown}
        submitLabel={text.search}
        onSubmit={onSearchSubmit}
        showSubmitAction={false}
        submitDisabled={submitDisabled}
      />

      <div className="marketplace-search-utility-row" aria-label="Search utility">
        <div className="marketplace-search-utility-left">
          <span className="is-active">{text.modeLabel}</span>
          <span>{text.sortLabel}</span>
          <span>{text.viewLabel}</span>
        </div>
      </div>
    </>
  );
}
