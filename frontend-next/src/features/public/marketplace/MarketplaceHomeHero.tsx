"use client";

import { useMemo } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";

const statsTrendBars = [25, 30, 38, 46, 62, 84, 120];
const statsTrendYAxis = ["6k", "4k", "2k", "0"];
const statsTrendXAxis = ["M", "T", "W", "T", "F", "S", "S"];

function buildTrendPathData(bars: number[]) {
  const viewWidth = 680;
  const viewHeight = 250;
  const layout = {
    top: 12,
    right: 14,
    bottom: 14,
    left: 14
  };
  const usableWidth = viewWidth - layout.left - layout.right;
  const usableHeight = viewHeight - layout.top - layout.bottom;
  const maxValue = Math.max(...bars, 1);
  const points = bars.map((value, index) => {
    const denominator = Math.max(1, bars.length - 1);
    const x = layout.left + (index / denominator) * usableWidth;
    const y = layout.top + (1 - value / maxValue) * usableHeight;
    return { x, y };
  });
  const pointSegments = points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  const linePath = pointSegments.length > 0 ? `M ${pointSegments.join(" L ")}` : "";
  const areaPath =
    points.length > 0
      ? `M ${points[0].x.toFixed(2)} ${(layout.top + usableHeight).toFixed(2)} L ${pointSegments.join(" L ")} L ${points[
          points.length - 1
        ].x.toFixed(2)} ${(layout.top + usableHeight).toFixed(2)} Z`
      : "";

  return {
    viewWidth,
    viewHeight,
    linePath,
    areaPath
  };
}

export function MarketplaceHomeHero() {
  const { messages } = usePublicI18n();
  const trendPathData = useMemo(() => buildTrendPathData(statsTrendBars), []);

  return (
    <section
      className="marketplace-top-stats-card marketplace-home-hero"
      aria-label="Marketplace stats overview"
      data-testid="landing-hero"
    >
      <div className="marketplace-home-hero-intro">
        <div className="marketplace-home-code-meta">
          <span className="marketplace-home-code-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="marketplace-home-code-label">skills.marketplace</span>
        </div>
        <p className="marketplace-top-stats-overline">{"// main.ts"}</p>
        <h1 className="marketplace-top-stats-main">
          <span className="marketplace-home-title-command" aria-hidden="true">
            &gt;
          </span>
          <span className="marketplace-top-stats-main-line">{messages.shellBrandTitle}</span>
          <span className="marketplace-top-stats-main-line">{messages.shellBrandSubtitle}</span>
        </h1>
        <p className="marketplace-top-stats-promo">{messages.heroStatsPromo}</p>

        <div className="marketplace-home-hero-metric-card">
          <div className="marketplace-home-hero-metric-label-row">
            <span className="marketplace-home-hero-metric-label">const skills =</span>
            <strong className="marketplace-home-hero-metric-value">{messages.heroStatsMain}</strong>
          </div>
          <p className="marketplace-home-hero-metric-note">{`// ${messages.heroStatsSub}`}</p>
        </div>
      </div>

      <div className="marketplace-home-hero-analytics">
        <div className="marketplace-home-code-meta">
          <span className="marketplace-home-code-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="marketplace-home-code-label">trend-analytics.tsx</span>
        </div>
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
        <p className="marketplace-top-stats-chart-note">{messages.heroStatsTrendLabel}</p>
      </div>
    </section>
  );
}
