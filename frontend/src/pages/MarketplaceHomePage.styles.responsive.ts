import { css } from "@emotion/react";

export const marketplaceHomeResponsiveStyles = css`
  .marketplace-home-stage.is-mobile-stage {
    width: 100% !important;
    height: auto !important;
    overflow: visible;
    min-height: 100dvh;
    background-image: none !important;
  }

  .marketplace-home.is-mobile {
    --marketplace-content-gutter: 12px;
    width: 100%;
    min-height: 100dvh;
    height: auto;
    transform: none !important;
    padding: 0 0 12px;
    gap: 8px;
  }

  .marketplace-home.is-mobile .marketplace-topbar {
    height: auto;
    padding: 8px var(--marketplace-content-gutter);
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

  .marketplace-home.is-mobile .workspace-topbar-primary-groups-shell {
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
    width: 100%;
    max-width: none;
    transform: none;
  }

  .marketplace-home.is-mobile .workspace-topbar-overflow-wrapper.is-expanded {
    max-height: 760px;
    transform: none;
  }

  .marketplace-home.is-mobile .marketplace-topbar-primary-trailing,
  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle {
    justify-content: flex-end;
    margin-left: 0;
    padding-left: 0;
  }

  .marketplace-home.is-mobile .workspace-topbar-primary-inline-toggle::before {
    display: none;
  }

  .marketplace-home.is-mobile .marketplace-topbar-below-content {
    width: 100%;
    padding: 0 var(--marketplace-content-gutter);
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
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .marketplace-home.is-mobile .marketplace-top-recommend-chips {
    width: 100%;
    flex-wrap: wrap;
    overflow: visible;
  }

  .marketplace-home.is-mobile .marketplace-search-submit {
    justify-content: center;
  }

  .marketplace-home.is-mobile .marketplace-search-strip {
    height: auto;
    position: relative;
    z-index: 2;
  }

  .marketplace-home.is-mobile .marketplace-page-breadcrumb-shell {
    padding-top: 6px;
  }

  .marketplace-home.is-mobile .marketplace-search-utility-row {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
  }

  .marketplace-home.is-mobile .marketplace-search-utility-left,
  .marketplace-home.is-mobile .marketplace-search-utility-right {
    flex-wrap: wrap;
  }

  .marketplace-home.is-mobile.is-category-detail-page .marketplace-subcategory-row {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .marketplace-home.is-mobile.is-category-detail-page .marketplace-subcategory-chips {
    width: 100%;
    flex-wrap: wrap;
    overflow: visible;
  }

  .marketplace-home.is-mobile.is-category-detail-page .marketplace-category-filter-row {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
  }

  .marketplace-home.is-mobile.is-category-detail-page .marketplace-category-filter-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .marketplace-home.is-mobile.is-category-detail-page .marketplace-category-filter-chips {
    width: 100%;
  }

  .marketplace-home.is-mobile .marketplace-advanced-panel {
    grid-template-columns: 1fr;
  }

  .marketplace-home.is-mobile .marketplace-layout {
    padding: 0 var(--marketplace-content-gutter);
    position: relative;
    z-index: 1;
  }

  .marketplace-home.is-mobile .marketplace-results-row {
    height: auto;
    grid-template-columns: 1fr;
  }

  .marketplace-home.is-mobile .marketplace-pagination-shell {
    justify-content: center;
    padding: 6px 0;
    gap: 0;
    height: auto;
  }

  .marketplace-home.is-mobile .marketplace-pagination-load-more {
    width: 100%;
    max-width: 260px;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-page {
    width: 100%;
    min-height: 100dvh;
    height: auto;
    gap: 10px;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-top-nav {
    height: auto;
    min-height: 72px;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 14px;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-top-right {
    margin-left: 0;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-entry-strip {
    height: auto;
    border-radius: 12px;
    padding: 10px 14px;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-entry-row {
    grid-template-columns: 1fr;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-body-wrap {
    align-items: stretch;
    justify-content: flex-start;
    padding: 0 12px 12px;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-floating-container {
    width: 100%;
    height: auto;
    min-height: calc(100dvh - 220px);
    padding: 12px;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-modal {
    width: 100%;
    max-width: 100%;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-modal-search-row {
    grid-template-columns: 1fr;
  }

  .marketplace-results-page-stage.is-mobile-stage .marketplace-results-modal-footer {
    flex-direction: column;
    align-items: flex-start;
  }
`;
