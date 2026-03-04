import type { KeyboardEvent } from "react";
import type { MarketplaceSkill } from "../lib/api";
import type { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";
import type { HomeChipFilter } from "./MarketplaceHomePage.config";
import type { MarketplaceText } from "./marketplaceText";
import MarketplaceResultsPage from "./MarketplaceResultsPage";

interface MarketplaceHomeSearchOverlayProps {
  isVisible: boolean;
  text: MarketplaceText;
  form: MarketplaceFilterForm;
  resultItems: MarketplaceSkill[];
  resultTotal: number;
  hotFilters: HomeChipFilter[];
  isLightTheme: boolean;
  onFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  onSearchSubmit: () => void;
  onSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onHotFilterApply: (filter: HomeChipFilter) => void;
  onResultOpen: (skillID: number) => void;
  onClose: () => void;
}

export default function MarketplaceHomeSearchOverlay({
  isVisible,
  text,
  form,
  resultItems,
  resultTotal,
  hotFilters,
  isLightTheme,
  onFilterFieldChange,
  onSearchSubmit,
  onSearchInputKeyDown,
  onHotFilterApply,
  onResultOpen,
  onClose
}: MarketplaceHomeSearchOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <MarketplaceResultsPage
      text={text}
      form={form}
      resultItems={resultItems}
      resultTotal={resultTotal}
      hotFilters={hotFilters}
      isLightTheme={isLightTheme}
      onFilterFieldChange={onFilterFieldChange}
      onSearchSubmit={onSearchSubmit}
      onSearchInputKeyDown={onSearchInputKeyDown}
      onHotFilterApply={onHotFilterApply}
      onResultOpen={onResultOpen}
      onClose={onClose}
    />
  );
}
