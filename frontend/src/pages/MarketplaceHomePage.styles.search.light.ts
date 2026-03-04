import { css } from "@emotion/react";

export const marketplaceHomeSearchLightStyles = css`
  .marketplace-home.is-light-theme .marketplace-search-strip {
    min-height: 398px;
    height: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-card {
    border: 1px solid rgba(17, 24, 39, 0.14);
    background: #f3f4f6;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-overline,
  .marketplace-home.is-light-theme .marketplace-top-stats-chart-note {
    color: #5f626c;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-main {
    color: #1f2024;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-promo {
    color: #5f626c;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-metric {
    background: rgba(17, 24, 39, 0.06);
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-metric-label {
    color: #5f626c;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-metric-value {
    color: #111827;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-trend-chart {
    background: #ffffff;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-plot {
    border-left-color: #a5a8b0;
    border-bottom-color: #a5a8b0;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-axis-label {
    color: #6d7079;
  }

  .marketplace-home.is-light-theme .marketplace-top-stats-trend-line {
    stroke: #30343b;
  }

  .marketplace-home.is-light-theme .marketplace-top-recommend-label {
    color: #4b5563;
  }

  .marketplace-home.is-light-theme .marketplace-top-recommend-chips button {
    background: #eceff3;
    color: #1f2937;
  }

  .marketplace-home.is-light-theme .marketplace-top-recommend-chips button:hover {
    background: #e5e7eb;
  }

  .marketplace-home.is-light-theme .marketplace-search-main-row {
    min-height: 58px;
    min-height: var(--marketplace-search-main-row-height, 58px);
  }

  .marketplace-home.is-light-theme .marketplace-search-input {
    height: 56px;
    height: var(--marketplace-search-input-height, 56px);
    border: 1px solid #d1d5db;
    border-radius: 12px;
    background: #ffffff;
  }

  .marketplace-home.is-light-theme .marketplace-search-submit {
    border-color: transparent;
    background: #111111;
    color: #ffffff;
  }

  .marketplace-home.is-light-theme .marketplace-search-filter-btn {
    border-color: transparent;
    background: #e5e7eb;
    color: #111827;
  }

  .marketplace-home.is-light-theme .marketplace-search-input input {
    color: #2a2a2a;
  }

  .marketplace-home.is-light-theme .marketplace-search-input input::placeholder {
    color: #737373;
  }

  .marketplace-home.is-light-theme .marketplace-search-utility-left span {
    background: #f7f7f7;
    color: #444444;
  }

  .marketplace-home.is-light-theme .marketplace-search-utility-left span.is-active {
    background: #e5e5e5;
    color: #2a2a2a;
  }

  .marketplace-home.is-light-theme .marketplace-search-utility-right span.is-queue {
    background: #e5e7eb;
    color: #111827;
  }
`;
