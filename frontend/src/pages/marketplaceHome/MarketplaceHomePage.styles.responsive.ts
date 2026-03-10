import { css } from "@emotion/react";

import { shellLayoutContractVars } from "../prototype/pageShellLayoutContract";

export const marketplaceHomeResponsiveStyles = css`
  .si-layout-shell-surface.si-layout-shell-stage-mobile {
    width: 100% !important;
    height: auto !important;
    overflow: visible;
    min-height: 100dvh;
    background-image: none !important;
  }

  .marketplace-home.is-mobile {
    --marketplace-content-gutter: 12px;
    --si-layout-shell-inline-gap: 0.75rem;
    width: 100%;
    min-height: 100dvh;
    height: auto;
    transform: none !important;
    padding: 0 0 12px;
    gap: 8px;
  }

  .marketplace-home.is-mobile .marketplace-topbar {
    width: var(${shellLayoutContractVars.topbarWidth});
    height: auto;
    margin: 0 auto;
    padding: 8px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .marketplace-home.is-mobile .marketplace-topbar-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile .marketplace-topbar-left-group,
  .marketplace-home.is-mobile .marketplace-topbar-light-nav,
  .marketplace-home.is-mobile .marketplace-topbar-light-utility,
  .marketplace-home.is-mobile .marketplace-topbar-primary-trailing,
  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle,
  .marketplace-home.is-mobile .workspace-topbar-primary-groups-shell {
    width: 100%;
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger {
    inline-size: 100%;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-groups-shell {
    width: 100%;
    max-width: none;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-groups {
    width: 100%;
    min-width: 0;
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-group {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-group-label {
    margin-right: auto;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-group + .workspace-topbar-primary-group {
    margin-left: 0;
    padding-left: 0;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 75%, transparent);
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-group + .workspace-topbar-primary-group::before {
    display: none;
  }

  .marketplace-home.is-mobile .workspace-topbar-overflow-groups {
    grid-template-columns: 1fr;
  }

  .marketplace-home.is-mobile .workspace-topbar-overflow-wrapper {
    position: static;
    left: auto;
    top: auto;
    width: 100%;
    max-width: none;
    max-height: none;
    transform: none;
  }

  .marketplace-home.is-mobile .workspace-topbar-overflow-wrapper.is-expanded {
    transform: none;
  }

  .marketplace-home.is-mobile .marketplace-topbar-primary-trailing,
  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle {
    justify-content: flex-end;
    margin-left: 0;
    padding-left: 0;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle > .workspace-topbar-toggle-icon-button {
    align-self: flex-end;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle::before {
    display: none;
  }

  .marketplace-home.is-mobile .marketplace-topbar-left-accessory {
    width: 100%;
  }

  .marketplace-home.is-mobile .workspace-topbar-user-trigger {
    width: 100%;
    justify-content: flex-start;
  }

  .marketplace-home.is-mobile .marketplace-topbar-locale-switch {
    margin-left: auto;
  }

  .marketplace-home.is-mobile .marketplace-top-stats-card {
    height: auto;
    min-height: 0;
    padding: 10px 12px;
    flex-direction: column;
    gap: 10px;
  }

  .marketplace-home.is-mobile .marketplace-top-stats-main {
    font-size: 20px;
  }

  .marketplace-home.is-mobile .marketplace-top-stats-left {
    flex: 0 0 auto;
  }

  .marketplace-home.is-mobile .marketplace-top-stats-trend {
    width: 100%;
    min-width: 0;
  }

  .marketplace-home.is-mobile .marketplace-top-stats-trend-chart {
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .marketplace-home.is-mobile .marketplace-search-main-row {
    flex-direction: column;
    align-items: stretch;
    height: auto;
    gap: 8px;
  }

  .marketplace-home.is-mobile .marketplace-top-recommend-row {
    height: auto;
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile .marketplace-results-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .marketplace-home.is-mobile .marketplace-results-sidebar {
    position: static;
    top: auto;
    order: 2;
  }

  .marketplace-home.is-mobile .marketplace-results-main {
    order: 1;
  }

  .marketplace-home.is-mobile .marketplace-results-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .marketplace-home.is-mobile .marketplace-search-header-row,
  .marketplace-home.is-mobile .marketplace-search-toolbar,
  .marketplace-home.is-mobile .marketplace-search-form,
  .marketplace-home.is-mobile .marketplace-search-categories,
  .marketplace-home.is-mobile .marketplace-search-filters,
  .marketplace-home.is-mobile .marketplace-search-actions,
  .marketplace-home.is-mobile .marketplace-search-filter-pills,
  .marketplace-home.is-mobile .marketplace-inline-status-row,
  .marketplace-home.is-mobile .marketplace-inline-status-grid,
  .marketplace-home.is-mobile .marketplace-category-toolbar,
  .marketplace-home.is-mobile .marketplace-category-actions,
  .marketplace-home.is-mobile .marketplace-category-hero,
  .marketplace-home.is-mobile .marketplace-category-grid,
  .marketplace-home.is-mobile .marketplace-category-cards,
  .marketplace-home.is-mobile .marketplace-ranking-toolbar,
  .marketplace-home.is-mobile .marketplace-ranking-summary,
  .marketplace-home.is-mobile .marketplace-ranking-grid,
  .marketplace-home.is-mobile .marketplace-ranking-cards {
    grid-template-columns: minmax(0, 1fr);
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile .marketplace-search-panel,
  .marketplace-home.is-mobile .marketplace-results-panel,
  .marketplace-home.is-mobile .marketplace-category-card,
  .marketplace-home.is-mobile .marketplace-ranking-card {
    min-width: 0;
  }
`;
