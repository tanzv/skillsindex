import { css } from "@emotion/react";
import { marketplaceHomeSearchLightStyles } from "./MarketplaceHomePage.styles.search.light";
import { marketplaceHomeSearchUtilityStyles } from "./MarketplaceHomePage.styles.search.utility";

export const marketplaceHomeSearchStyles = css`
  .marketplace-home .marketplace-search-strip {
    width: 100%;
    min-height: 398px;
    height: auto;
    border-radius: 0;
    border: 0;
    background: transparent;
    padding: 12px var(--marketplace-content-gutter);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .marketplace-home .marketplace-top-stats-card {
    width: 100%;
    min-height: 244px;
    height: auto;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: #0d0e13;
    padding: 16px 18px;
    display: flex;
    align-items: stretch;
    gap: 18px;
    overflow: hidden;
  }

  .marketplace-home .marketplace-top-stats-left {
    min-width: 0;
    flex: 0 0 50%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .marketplace-home .marketplace-top-stats-overline,
  .marketplace-home .marketplace-top-stats-main,
  .marketplace-home .marketplace-top-stats-promo,
  .marketplace-home .marketplace-top-stats-chart-note {
    margin: 0;
  }

  .marketplace-home .marketplace-top-stats-overline {
    color: #a9abb2;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .marketplace-home .marketplace-top-stats-main {
    color: #f2f2f3;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: clamp(23px, 2.2vw, 42px);
    font-weight: 700;
    line-height: 1.02;
    display: grid;
    gap: 4px;
  }

  .marketplace-home .marketplace-top-stats-main-line {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .marketplace-home .marketplace-top-stats-main-line.is-metric {
    font-family: "JetBrains Mono", monospace;
    font-size: clamp(22px, 2.4vw, 40px);
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .marketplace-home .marketplace-top-stats-promo {
    color: #9aa0ab;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
  }

  .marketplace-home .marketplace-top-stats-metrics {
    margin-top: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .marketplace-home .marketplace-top-stats-metric {
    min-height: 52px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
  }

  .marketplace-home .marketplace-top-stats-metric-label {
    color: #9ea5b1;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.2;
  }

  .marketplace-home .marketplace-top-stats-metric-value {
    color: #f2f4f8;
    font-family: "JetBrains Mono", monospace;
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
  }

  .marketplace-home .marketplace-top-stats-trend {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .marketplace-home .marketplace-top-stats-trend-chart {
    width: 100%;
    min-height: 0;
    flex: 1;
    border-radius: 10px;
    border: 0;
    background: rgba(255, 255, 255, 0.03);
    padding: 12px 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .marketplace-home .marketplace-top-stats-plot-wrap {
    width: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    gap: 10px;
  }

  .marketplace-home .marketplace-top-stats-y-ticks {
    width: 26px;
    min-width: 26px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 4px;
  }

  .marketplace-home .marketplace-top-stats-plot {
    min-width: 0;
    flex: 1;
    height: 100%;
    display: block;
    border-left: 1px solid #8a8f98;
    border-bottom: 1px solid #8a8f98;
    background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%);
  }

  .marketplace-home .marketplace-top-stats-trend-area {
    fill: url("#marketplaceTopTrendArea");
  }

  .marketplace-home .marketplace-top-stats-trend-line {
    fill: none;
    stroke: #f0f2f5;
    stroke-width: 2.4;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .marketplace-home .marketplace-top-stats-x-labels {
    width: 100%;
    height: 14px;
    padding-left: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .marketplace-home .marketplace-top-stats-axis-label {
    color: #a0a4ad;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
  }

  .marketplace-home .marketplace-top-stats-chart-note {
    color: #959ca8;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.35;
  }

  ${marketplaceHomeSearchUtilityStyles}
  ${marketplaceHomeSearchLightStyles}
`;
