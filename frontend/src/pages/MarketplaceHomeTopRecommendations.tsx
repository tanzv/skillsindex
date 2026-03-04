import { HomeChipFilter } from "./MarketplaceHomePage.config";

interface MarketplaceHomeTopRecommendationsProps {
  label: string;
  filters: HomeChipFilter[];
  onApply: (filter: HomeChipFilter) => void;
}

export default function MarketplaceHomeTopRecommendations({
  label,
  filters,
  onApply
}: MarketplaceHomeTopRecommendationsProps) {
  const recommendedFilters = filters.slice(0, 3);
  if (recommendedFilters.length === 0) {
    return null;
  }

  return (
    <section className="marketplace-top-recommend-row" role="group" aria-label="Recommended filters">
      <span className="marketplace-top-recommend-label">{label}</span>
      <div className="marketplace-top-recommend-chips">
        {recommendedFilters.map((filter) => (
          <button key={`recommend-${filter.id}`} type="button" onClick={() => onApply(filter)}>
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}
