import type { MarketplaceText } from "../marketplacePublic/marketplaceText";
import { statsTrendXAxis, statsTrendYAxis } from "./MarketplaceHomePage.config";

interface MarketplaceTrendPathData {
  viewWidth: number;
  viewHeight: number;
  linePath: string;
  areaPath: string;
}

interface MarketplaceHomeTopStatsCardProps {
  text: MarketplaceText;
  trendPathData: MarketplaceTrendPathData;
}

export default function MarketplaceHomeTopStatsCard({ text, trendPathData }: MarketplaceHomeTopStatsCardProps) {
  return (
    <section className="marketplace-top-stats-card" aria-label="Marketplace stats overview">
      <div className="marketplace-top-stats-left">
        <p className="marketplace-top-stats-overline">{text.brandSubtitle}</p>
        <h2 className="marketplace-top-stats-main">
          <span className="marketplace-top-stats-main-line">{text.brandTitle}</span>
          <span className="marketplace-top-stats-main-line is-metric">{text.statsMain}</span>
        </h2>
        <p className="marketplace-top-stats-promo">{text.statsPromo}</p>
        <div className="marketplace-top-stats-metrics" aria-hidden="true">
          <div className="marketplace-top-stats-metric">
            <span className="marketplace-top-stats-metric-label">{text.statsSub}</span>
            <strong className="marketplace-top-stats-metric-value">{text.statsDeltaLeft}</strong>
          </div>
          <div className="marketplace-top-stats-metric">
            <span className="marketplace-top-stats-metric-label">{text.statsTrendLabel}</span>
            <strong className="marketplace-top-stats-metric-value">{text.statsDeltaRight}</strong>
          </div>
        </div>
      </div>
      <div className="marketplace-top-stats-trend">
        <div className="marketplace-top-stats-trend-chart" aria-hidden="true">
          <div className="marketplace-top-stats-plot-wrap">
            <div className="marketplace-top-stats-y-ticks">
              {statsTrendYAxis.map((label) => (
                <span key={`trend-y-${label}`} className="marketplace-top-stats-axis-label">
                  {label}
                </span>
              ))}
            </div>
            <svg
              className="marketplace-top-stats-plot"
              viewBox={`0 0 ${trendPathData.viewWidth} ${trendPathData.viewHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="marketplaceTopTrendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(232, 232, 232, 0.56)" />
                  <stop offset="100%" stopColor="rgba(232, 232, 232, 0.08)" />
                </linearGradient>
              </defs>
              <path className="marketplace-top-stats-trend-area" d={trendPathData.areaPath} />
              <path className="marketplace-top-stats-trend-line" d={trendPathData.linePath} />
            </svg>
          </div>
          <div className="marketplace-top-stats-x-labels">
            {statsTrendXAxis.map((label, index) => (
              <span key={`trend-x-${index}-${label}`} className="marketplace-top-stats-axis-label">
                {label}
              </span>
            ))}
          </div>
        </div>
        <p className="marketplace-top-stats-chart-note">{text.statsTrendLabel}</p>
      </div>
    </section>
  );
}
