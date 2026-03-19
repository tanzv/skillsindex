"use client";

import { cn } from "@/src/lib/utils";

import type { MarketplaceSummaryMetric } from "./marketplaceViewModel";

interface MarketplaceSupportMetricsListProps {
  metrics: MarketplaceSummaryMetric[];
  limit?: number;
  className?: string;
}

export function MarketplaceSupportMetricsList({
  metrics,
  limit = 3,
  className
}: MarketplaceSupportMetricsListProps) {
  return (
    <div className={cn("marketplace-list-stack", className)}>
      {metrics.slice(0, limit).map((metric) => (
        <div key={metric.label} className="marketplace-stat-card">
          <div className="marketplace-stat-card-label">{metric.label}</div>
          <div className="marketplace-stat-card-value">{metric.value}</div>
          <div className="marketplace-stat-card-detail">{metric.detail}</div>
        </div>
      ))}
    </div>
  );
}
