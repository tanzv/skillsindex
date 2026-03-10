import { css } from "@emotion/react";
import { marketplaceHomeLoadMoreStyles } from "./MarketplaceHomePage.styles.loadMore";

export const marketplaceHomeResultsStyles = css`
  ${marketplaceHomeLoadMoreStyles}

  @keyframes marketplaceLatestRowEnter {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .marketplace-home .marketplace-layout {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 var(--marketplace-content-gutter);
  }

  .marketplace-home .marketplace-page-breadcrumb-shell {
    width: 100%;
    padding: 8px var(--marketplace-content-gutter) 0;
  }

  .marketplace-home .marketplace-page-breadcrumb {
    min-height: 20px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .marketplace-home .marketplace-page-breadcrumb .ant-breadcrumb {
    width: 100%;
    color: var(--si-color-text-secondary, #9ca3af);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .marketplace-home .marketplace-page-breadcrumb .ant-breadcrumb-link,
  .marketplace-home .marketplace-page-breadcrumb .ant-breadcrumb-separator {
    color: inherit;
  }

  .marketplace-home .marketplace-page-breadcrumb-link {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    padding: 0;
    transition: color 180ms ease;
  }

  .marketplace-home .marketplace-page-breadcrumb-link:hover {
    color: var(--si-color-text-primary, #e2e8f0);
  }

  .marketplace-home .marketplace-page-breadcrumb-link:focus-visible {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .marketplace-home .marketplace-page-breadcrumb-current {
    color: inherit;
  }

  .marketplace-home .marketplace-results-toolbar {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .marketplace-home .marketplace-results-toolbar h2 {
    margin: 0;
    color: #f3f4f6;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }

  .marketplace-home .marketplace-toolbar-chips {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .marketplace-home .marketplace-toolbar-chips span {
    height: 24px;
    border-radius: 8px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    background: #2a2a2a;
    color: #d4d4d8;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
  }

  .marketplace-home .marketplace-toolbar-chips span.is-active {
    color: #e5e5e5;
  }

  .marketplace-home .marketplace-results-list {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .marketplace-home .marketplace-results-empty-state {
    min-height: 132px;
    border-radius: 12px;
    border: 1px dashed #414141;
    background: #161616;
    padding: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }

  .marketplace-home .marketplace-results-empty-state h3 {
    margin: 0;
    color: #f3f4f6;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.35;
  }

  .marketplace-home .marketplace-results-empty-state p {
    margin: 0;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
    max-width: 480px;
  }

  .marketplace-home .marketplace-results-row {
    height: 196px;
    height: var(--marketplace-results-row-height, 196px);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .marketplace-home .marketplace-latest-row {
    height: 198px;
    height: var(--marketplace-latest-row-height, 198px);
  }

  .marketplace-home .marketplace-latest-row.is-new-row {
    animation: marketplaceLatestRowEnter 320ms ease-out both;
  }

  .marketplace-home .marketplace-skill-row {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(180deg, rgba(16, 17, 19, 0.34) 0%, rgba(12, 13, 16, 0.2) 100%);
    padding: 14px 16px;
    padding: var(--marketplace-skill-row-padding-y, 14px) var(--marketplace-skill-row-padding-x, 16px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: space-between;
    min-height: 0;
    transition: border-color 180ms ease, background-color 180ms ease, box-shadow 220ms ease, transform 220ms ease;
  }

  .marketplace-home .marketplace-card-head {
    width: 72px;
    width: var(--marketplace-card-head-width, 72px);
    height: 42px;
    height: var(--marketplace-card-head-height, 42px);
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .marketplace-home .marketplace-card-cover {
    position: relative;
    width: 40px;
    width: var(--marketplace-card-thumb-size, 40px);
    height: 40px;
    height: var(--marketplace-card-thumb-size, 40px);
    display: inline-flex;
    align-items: flex-end;
    justify-content: flex-end;
  }

  .marketplace-home .marketplace-card-cover-thumb {
    width: 40px;
    width: var(--marketplace-card-thumb-size, 40px);
    height: 40px;
    height: var(--marketplace-card-thumb-size, 40px);
    border-radius: 999px;
    background: #2a2a2a;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border: 0;
  }

  .marketplace-home .marketplace-card-cover-chip {
    position: absolute;
    right: -6px;
    bottom: -3px;
    height: 18px;
    height: var(--marketplace-card-cover-chip-height, 18px);
    border-radius: 999px;
    padding: 0 7px;
    background: #111111;
    color: #f3f4f6;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-size: var(--marketplace-card-cover-chip-font-size, 10px);
    font-weight: 700;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .marketplace-home .marketplace-skill-name {
    min-width: 0;
  }

  .marketplace-home .marketplace-skill-name button {
    border: 0;
    background: transparent;
    padding: 0;
    color: #f8fafc;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 15px;
    font-size: var(--marketplace-card-title-size, 15px);
    font-weight: 700;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
    width: 100%;
    transition: color 180ms ease;
  }

  .marketplace-home .marketplace-skill-row:hover {
    border-color: rgba(241, 245, 249, 0.36);
    box-shadow: 0 6px 12px rgba(7, 10, 16, 0.14), inset 0 0 0 1px rgba(241, 245, 249, 0.08);
    transform: translateY(-1px);
  }

  .marketplace-home .marketplace-skill-row.is-clickable {
    cursor: pointer;
  }

  .marketplace-home .marketplace-skill-row.is-clickable:focus-visible {
    outline: 2px solid #e5e7eb;
    outline-offset: 2px;
  }

  .marketplace-home .marketplace-skill-name button:hover {
    color: #f1f5f9;
  }

  .marketplace-home .marketplace-skill-name button:focus-visible {
    outline: 2px solid #e5e7eb;
    outline-offset: 2px;
    border-radius: 4px;
  }

  .marketplace-home .marketplace-skill-description {
    margin: 0;
    color: #d1d5db;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 12px;
    font-size: var(--marketplace-card-description-size, 12px);
    font-weight: 500;
    line-height: 1.45;
  }

  .marketplace-home .marketplace-skill-secondary {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .marketplace-home .marketplace-skill-chip-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .marketplace-home .marketplace-skill-chip-row span {
    height: 20px;
    height: var(--marketplace-card-tag-height, 20px);
    border-radius: 999px;
    padding: 0 9px;
    background: rgba(255, 255, 255, 0.06);
    border: 0;
    color: #d2d6de;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-size: var(--marketplace-card-tag-font-size, 10px);
    font-weight: 700;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }

  .marketplace-home .marketplace-skill-row-foot {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .marketplace-home .marketplace-skill-row-foot span {
    color: #cfd4dd;
    font-size: 11px;
    font-size: var(--marketplace-card-foot-font-size, 11px);
    font-weight: 600;
    font-family: "JetBrains Mono", monospace;
    line-height: 1.2;
  }

  .marketplace-home .marketplace-skill-row-foot span.is-primary {
    color: #f3f4f6;
    font-weight: 700;
  }

  .marketplace-home.is-categories-index-page {
    --marketplace-card-head-width: 84px;
    --marketplace-card-head-height: 52px;
    --marketplace-card-thumb-size: 50px;
    --marketplace-card-title-size: 16px;
    --marketplace-card-description-size: 13px;
    --marketplace-card-tag-height: 22px;
    --marketplace-card-tag-font-size: 10px;
    --marketplace-card-foot-font-size: 10px;
  }

  .marketplace-home.is-categories-index-page .marketplace-category-header-card {
    border: 0;
    background: var(--marketplace-category-header-background);
    box-shadow: var(--marketplace-category-header-shadow);
    backdrop-filter: blur(10px);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row {
    min-height: 220px;
    padding: 16px 18px;
    gap: 10px;
    border: 0;
    background: var(--marketplace-category-card-background);
    box-shadow: var(--marketplace-category-card-shadow);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row:hover {
    background: var(--marketplace-category-card-hover-background);
    box-shadow: var(--marketplace-category-card-hover-shadow);
    transform: translateY(-2px);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row:focus-within {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 2px;
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-card-cover,
  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-card-cover-thumb {
    border-radius: 12px;
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-card-cover-thumb {
    border: 1px solid var(--marketplace-category-icon-border);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-card-cover-chip {
    right: -3px;
    bottom: -4px;
    min-width: 24px;
    padding: 0 7px;
    font-size: 10px;
  }

  .marketplace-home.is-categories-index-page .marketplace-category-icon-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--marketplace-category-summary-chip-text);
    background: var(--marketplace-category-icon-background);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-skill-secondary {
    gap: 8px;
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-skill-chip-row span {
    background: var(--marketplace-category-summary-chip-background);
    color: var(--marketplace-category-summary-chip-text);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-skill-row-foot span {
    color: var(--marketplace-category-footnote-text);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-skill-row-foot span.is-primary {
    color: var(--marketplace-category-footnote-primary-text);
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-skill-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .marketplace-home.is-categories-index-page .marketplace-category-row .marketplace-skill-row-foot span:last-child {
    min-width: 0;
    max-width: min(100%, 52ch);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .marketplace-home.is-light-theme .marketplace-results-toolbar h2 {
    color: #111111;
  }

  .marketplace-home.is-light-theme .marketplace-toolbar-chips span {
    background: #f7f7f7;
    color: #666666;
  }

  .marketplace-home.is-light-theme .marketplace-toolbar-chips span.is-active {
    background: #e5e5e5;
    color: #2a2a2a;
  }

  .marketplace-home.is-light-theme .marketplace-skill-row {
    border: 1px solid rgba(186, 191, 201, 0.36);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(246, 247, 250, 0.5) 100%);
    padding: 14px 16px;
    padding: var(--marketplace-skill-row-padding-y, 14px) var(--marketplace-skill-row-padding-x, 16px);
    gap: 8px;
    backdrop-filter: blur(1px);
  }

  .marketplace-home.is-light-theme .marketplace-results-empty-state {
    border-color: #c8ced8;
    background: #ffffff;
  }

  .marketplace-home.is-light-theme .marketplace-results-empty-state h3 {
    color: #111827;
  }

  .marketplace-home.is-light-theme .marketplace-results-empty-state p {
    color: #6b7280;
  }

  .marketplace-home.is-light-theme .marketplace-skill-row:hover {
    border-color: rgba(107, 114, 128, 0.5);
    box-shadow: 0 6px 12px rgba(15, 23, 42, 0.07), inset 0 0 0 1px rgba(107, 114, 128, 0.18);
    transform: translateY(-1px);
  }

  .marketplace-home.is-light-theme .marketplace-skill-row.is-clickable:focus-visible {
    outline-color: #374151;
  }

  .marketplace-home.is-light-theme .marketplace-card-cover-thumb {
    background: #eef2f7;
  }

  .marketplace-home.is-light-theme .marketplace-card-cover-chip {
    background: #111111;
    color: #f3f4f6;
  }

  .marketplace-home.is-light-theme .marketplace-skill-name button {
    color: #111111;
  }

  .marketplace-home.is-light-theme .marketplace-skill-name button:hover {
    color: #1f2937;
  }

  .marketplace-home.is-light-theme .marketplace-skill-description {
    color: #666666;
  }

  .marketplace-home.is-light-theme .marketplace-skill-chip-row span {
    background: rgba(248, 250, 252, 0.64);
    border-color: rgba(181, 190, 206, 0.7);
    color: #4a576a;
  }

  .marketplace-home.is-light-theme .marketplace-skill-row-foot span {
    color: #334155;
  }

  .marketplace-home.is-light-theme .marketplace-skill-row-foot span.is-primary {
    color: #1f2937;
  }

  .marketplace-home.is-light-theme .marketplace-featured-row .marketplace-skill-description {
    color: #444444;
  }

  .marketplace-home.is-light-theme .marketplace-featured-row .marketplace-skill-row-foot span {
    color: #2a2a2a;
  }

`;
