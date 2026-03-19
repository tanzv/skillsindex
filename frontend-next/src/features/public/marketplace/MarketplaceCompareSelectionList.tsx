import { cn } from "@/src/lib/utils";

export interface MarketplaceCompareSelectionItem {
  key: string;
  label: string;
  title: string;
  description: string;
  metrics: string[];
}

interface MarketplaceCompareSelectionListProps {
  items: MarketplaceCompareSelectionItem[];
  className?: string;
  testId?: string;
}

export function MarketplaceCompareSelectionList({
  items,
  className,
  testId
}: MarketplaceCompareSelectionListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("marketplace-list-stack", className)} data-testid={testId}>
      {items.map((item) => (
        <div key={item.key} className="marketplace-compare-card">
          <p className="marketplace-kicker">{item.label}</p>
          <h3 className="marketplace-skill-name">{item.title}</h3>
          <p className="marketplace-skill-description">{item.description}</p>
          <div className="marketplace-compare-metrics">
            {item.metrics.map((metric) => (
              <span key={`${item.key}-${metric}`} className="marketplace-skill-chip">
                {metric}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
