import { css } from "@emotion/react";

export const publicSkillDetailPolishFoundationStyles = css`
  .skill-detail-page {
    --skill-detail-surface-soft: color-mix(in srgb, var(--skill-detail-surface-1) 82%, var(--skill-detail-surface-2) 18%);
    --skill-detail-surface-soft-alt: color-mix(in srgb, var(--skill-detail-surface-1) 68%, var(--skill-detail-surface-2) 32%);
    --skill-detail-surface-muted: color-mix(in srgb, var(--skill-detail-surface-2) 82%, transparent);
    --skill-detail-card-border: color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    --skill-detail-card-border-strong: color-mix(in srgb, var(--skill-detail-border-strong) 76%, transparent);
    --skill-detail-card-padding: 18px;
    --skill-detail-card-padding-lg: 20px;
    --skill-detail-chip-height: 32px;
    gap: 16px;
  }

  .skill-detail-page.is-light {
    --skill-detail-surface-soft: color-mix(in srgb, var(--skill-detail-surface-1) 96%, var(--skill-detail-surface-2) 4%);
    --skill-detail-surface-soft-alt: color-mix(in srgb, var(--skill-detail-surface-1) 88%, var(--skill-detail-surface-2) 12%);
    --skill-detail-surface-muted: color-mix(in srgb, var(--skill-detail-surface-2) 72%, var(--skill-detail-surface-1) 28%);
    --skill-detail-card-border: color-mix(in srgb, var(--skill-detail-border) 84%, #c9d4e0 16%);
    --skill-detail-card-border-strong: color-mix(in srgb, var(--skill-detail-border-strong) 84%, #adbac8 16%);
  }

  .skill-detail-top {
    min-height: 0;
    padding: 22px 0 16px;
  }

  .skill-detail-top-layout {
    grid-template-columns: minmax(0, 1.34fr) minmax(300px, 0.86fr);
    gap: 20px;
  }

  .skill-detail-title-group {
    width: 100%;
    gap: 10px;
  }

  .skill-detail-title {
    font-size: clamp(34px, 3.4vw, 42px);
    line-height: 1.02;
    letter-spacing: -0.025em;
  }

  .skill-detail-title-description {
    margin: 0;
    max-width: 72ch;
    color: var(--skill-detail-text-secondary);
    font-size: 15px;
    line-height: 1.68;
    font-weight: 500;
  }

  .skill-detail-breadcrumb {
    min-height: 0;
  }

  .skill-detail-breadcrumb-list,
  .skill-detail-meta-strip {
    gap: 8px;
    flex-wrap: wrap;
  }

  .skill-detail-breadcrumb-button,
  .skill-detail-breadcrumb-current,
  .skill-detail-meta-chip {
    min-height: var(--skill-detail-chip-height);
    padding: 0 12px;
    border-radius: 999px;
    font-size: 11.5px;
    letter-spacing: 0.01em;
  }

  .skill-detail-breadcrumb-button,
  .skill-detail-meta-chip {
    border-color: var(--skill-detail-card-border);
    background: color-mix(in srgb, var(--skill-detail-surface-soft-alt) 88%, transparent);
  }

  .skill-detail-breadcrumb-button:hover {
    border-color: var(--skill-detail-card-border-strong);
    background: color-mix(in srgb, var(--skill-detail-surface-soft) 92%, transparent);
    transform: none;
  }

  .skill-detail-breadcrumb-current {
    border-color: color-mix(in srgb, var(--skill-detail-accent-bg) 22%, var(--skill-detail-card-border) 78%);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 14%, transparent);
  }

  .skill-detail-meta-chip.is-success,
  .skill-detail-meta-chip.is-accent {
    border-color: color-mix(in srgb, var(--skill-detail-accent-bg) 18%, var(--skill-detail-card-border) 82%);
  }

  .skill-detail-top-aside {
    align-self: stretch;
  }

  .skill-detail-top-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
    align-content: start;
  }

  .skill-detail-top-summary-card {
    min-height: 68px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--skill-detail-card-border);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 82%, var(--skill-detail-surface-2) 18%);
    display: grid;
    gap: 6px;
    align-content: start;
  }

  .skill-detail-top-summary-label {
    color: var(--skill-detail-text-muted);
    font-size: 10.5px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .skill-detail-top-summary-value {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
  }

  .skill-detail-main {
    gap: 24px;
  }

  .skill-detail-card,
  .skill-detail-resource-panel {
    border-radius: 16px;
    padding: var(--skill-detail-card-padding);
    gap: 14px;
    background: var(--skill-detail-surface-soft);
    border: 1px solid var(--skill-detail-card-border);
  }

  .skill-detail-card.is-summary,
  .skill-detail-card.is-quality,
  .skill-detail-card.is-file-tree,
  .skill-detail-card.is-install,
  .skill-detail-card.is-file-control,
  .skill-detail-card.is-action,
  .skill-detail-card.is-comments,
  .skill-detail-resource-panel {
    background: var(--skill-detail-surface-soft);
  }

  .skill-detail-page .skill-detail-summary-metric,
  .skill-detail-page .skill-detail-quality-metric,
  .skill-detail-page .skill-detail-resource-block,
  .skill-detail-page .skill-detail-resource-fact,
  .skill-detail-page .skill-detail-related-card,
  .skill-detail-page .skill-detail-comment-item,
  .skill-detail-page .skill-detail-auth-cta,
  .skill-detail-page .skill-detail-directory-shell,
  .skill-detail-page .skill-detail-code-panel,
  .skill-detail-page .skill-detail-action-button,
  .skill-detail-page .skill-detail-side-link,
  .skill-detail-page .skill-detail-rating-button,
  .skill-detail-page .skill-detail-comment-delete,
  .skill-detail-page .skill-detail-side-segment,
  .skill-detail-page .skill-detail-file-row,
  .skill-detail-page .skill-detail-doc-toolbar .skill-detail-file-info-actions button {
    border-color: var(--skill-detail-card-border);
    box-shadow: none;
  }

  .skill-detail-resource-tab-switch {
    padding: 0 0 2px;
    border-radius: 0;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--skill-detail-card-border);
  }

  .skill-detail-top-file-tabs {
    gap: 2px;
    padding-bottom: 0;
  }

  .skill-detail-top-file-button,
  .skill-detail-top-file-browse {
    min-height: 38px;
    border-radius: 8px 8px 0 0;
    padding: 0 14px;
    border: 1px solid transparent;
    border-bottom: 2px solid transparent;
    background: transparent;
    font-size: 11.5px;
  }

  .skill-detail-top-file-button:not(.is-active):hover,
  .skill-detail-top-file-browse:hover {
    border-color: transparent;
    border-bottom-color: var(--skill-detail-card-border-strong);
    background: color-mix(in srgb, var(--skill-detail-surface-soft) 72%, transparent);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-top-file-button.is-active {
    border-color: transparent;
    border-bottom-color: var(--skill-detail-accent-bg);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 48%, transparent);
    color: var(--skill-detail-text-primary);
    box-shadow: none;
  }

  .skill-detail-page.is-light .skill-detail-top-file-button:not(.is-active):hover,
  .skill-detail-page.is-light .skill-detail-top-file-browse:hover {
    background: color-mix(in srgb, #ffffff 72%, var(--skill-detail-surface-3) 28%);
    border-color: var(--skill-detail-card-border-strong);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page.is-light .skill-detail-top-file-button.is-active {
    background: #ffffff;
    border-color: var(--skill-detail-card-border-strong);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-card.is-summary,
  .skill-detail-card.is-quality {
    padding: var(--skill-detail-card-padding-lg);
  }

  .skill-detail-summary-head {
    align-items: flex-start;
    gap: 14px;
  }

  .skill-detail-summary-title-group {
    gap: 6px;
  }

  .skill-detail-summary-title {
    font-size: 19px;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }

  .skill-detail-summary-subtitle {
    color: var(--skill-detail-text-muted);
    font-size: 11px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .skill-detail-summary-badges {
    gap: 6px;
    flex-wrap: wrap;
  }

  .skill-detail-chip {
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    border-color: var(--skill-detail-card-border);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, var(--skill-detail-surface-2) 16%);
    font-size: 11.5px;
    letter-spacing: 0.01em;
  }

  .skill-detail-summary-description {
    max-width: 74ch;
    color: color-mix(in srgb, var(--skill-detail-text-secondary) 92%, transparent);
    font-size: 15px;
    line-height: 1.72;
  }

  .skill-detail-overview-sections {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .skill-detail-overview-section {
    padding: 14px;
    border-radius: 14px;
    border: 1px solid var(--skill-detail-card-border);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 86%, var(--skill-detail-surface-2) 14%);
    display: grid;
    gap: 12px;
  }

  .skill-detail-overview-section-title {
    font-size: 13px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .skill-detail-overview-detail-list {
    gap: 10px;
  }

  .skill-detail-overview-detail-row {
    align-items: center;
    padding-bottom: 10px;
    border-bottom-color: color-mix(in srgb, var(--skill-detail-border) 64%, transparent);
  }

  .skill-detail-overview-detail-label {
    flex: 1 1 auto;
    font-size: 10.5px;
    line-height: 1.35;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .skill-detail-overview-detail-value {
    flex: 0 0 auto;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
  }

  .skill-detail-summary-metrics,
  .skill-detail-quality-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    align-items: stretch;
  }

  .skill-detail-summary-metric,
  .skill-detail-quality-metric {
    width: 100%;
    min-height: 72px;
    height: auto;
    padding: 12px 14px;
    gap: 8px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 86%, var(--skill-detail-surface-2) 14%);
  }

  .skill-detail-summary-metric-label,
  .skill-detail-quality-metric-label,
  .skill-detail-resource-label,
  .skill-detail-resource-fact-label {
    font-size: 10.5px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .skill-detail-summary-metric-value {
    font-size: 14px;
    line-height: 1.5;
  }

  .skill-detail-quality-metric-value {
    font-size: 18px;
  }

  .skill-detail-card.is-file-tree,
  .skill-detail-card.is-file-tree.is-preview-only,
  .skill-detail-resource-panel,
  .skill-detail-card.is-file-control,
  .skill-detail-card.is-action,
  .skill-detail-card.is-comments {
    padding: var(--skill-detail-card-padding-lg);
  }

  .skill-detail-directory-shell {
    border-radius: 14px;
    padding: 14px;
    gap: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 86%, var(--skill-detail-surface-2) 14%);
  }

  .skill-detail-directory-tree {
    max-height: 280px;
    gap: 4px;
  }

  .skill-detail-directory-row {
    min-height: 36px;
    border-radius: 12px;
    padding: 7px 14px;
  }

  .skill-detail-directory-row.is-selected {
    border-color: color-mix(in srgb, var(--skill-detail-accent-bg) 24%, var(--skill-detail-card-border) 76%);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 12%, transparent);
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--skill-detail-accent-bg) 78%, transparent);
  }

  .skill-detail-directory-row-icon.is-directory {
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 24%, transparent);
  }

  .skill-detail-doc-toolbar {
    min-height: 52px;
    padding-bottom: 14px;
    border-bottom-color: var(--skill-detail-card-border);
  }

  .skill-detail-doc-toolbar-main {
    gap: 10px;
  }

  .skill-detail-doc-file-icon {
    width: 14px;
    height: 16px;
    border-radius: 4px;
  }

  .skill-detail-doc-file-name {
    font-size: 13.5px;
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions {
    gap: 8px;
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions button {
    min-height: 34px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, var(--skill-detail-surface-2) 16%);
    padding: 0 12px;
  }

  .skill-detail-code-head.is-document-head {
    min-height: 0;
    align-items: flex-end;
    gap: 8px 16px;
    padding-bottom: 2px;
  }

  .skill-detail-file-state-hint,
  .skill-detail-file-state-meta {
    font-size: 11.5px;
    line-height: 1.5;
  }

  .skill-detail-code-panel {
    border-radius: 16px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 94%, var(--skill-detail-surface-2) 6%);
    padding: 16px 18px;
    gap: 10px;
  }

  .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
    min-height: 540px;
  }

  .skill-detail-code-panel.is-document {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 96%, var(--skill-detail-surface-2) 4%);
    padding: 22px 24px 24px;
  }

  .skill-detail-doc-content {
    max-width: 80ch;
    font-size: 16px;
    line-height: 1.8;
    gap: 16px;
  }

  .skill-detail-doc-heading.is-h1 {
    font-size: clamp(34px, 2.8vw, 44px);
    line-height: 1.08;
  }

  .skill-detail-doc-heading.is-h2 {
    margin-top: 18px;
  }

  .skill-detail-doc-heading.is-h3 {
    margin-top: 10px;
  }

  .skill-detail-doc-paragraph,
  .skill-detail-doc-list,
  .skill-detail-doc-kv {
    max-width: 72ch;
  }

  .skill-detail-doc-inline-code {
    border-radius: 8px;
    padding: 2px 8px;
  }
`;
