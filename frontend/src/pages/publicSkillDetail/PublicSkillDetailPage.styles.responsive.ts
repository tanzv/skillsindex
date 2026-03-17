import { css } from "@emotion/react";

export const publicSkillDetailResponsiveStyles = css`
  .skill-detail-page .skill-detail-summary-metric,
  .skill-detail-page .skill-detail-quality-metric,
  .skill-detail-page .skill-detail-metadata-owner,
  .skill-detail-page .skill-detail-metadata-lines,
  .skill-detail-page .skill-detail-metadata-governance,
  .skill-detail-page .skill-detail-install-step,
  .skill-detail-page .skill-detail-action-button {
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 88%, transparent);
    box-shadow: none;
  }

  .skill-detail-page.is-light .skill-detail-summary-metric,
  .skill-detail-page.is-light .skill-detail-quality-metric,
  .skill-detail-page.is-light .skill-detail-metadata-owner,
  .skill-detail-page.is-light .skill-detail-metadata-lines,
  .skill-detail-page.is-light .skill-detail-metadata-governance,
  .skill-detail-page.is-light .skill-detail-install-step,
  .skill-detail-page.is-light .skill-detail-action-button {
    box-shadow: none;
  }

  @media (max-width: 1460px) {
    .skill-detail-page:not(.is-visual-baseline) {
      width: 100%;
    }
  }

  @media (max-width: 1320px) {
    .skill-detail-page:not(.is-visual-baseline) {
      min-height: 100dvh;
      height: auto;
      padding-bottom: 18px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top {
      height: auto;
      padding: 16px 0;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-layout {
      grid-template-columns: minmax(0, 1.28fr) minmax(280px, 0.92fr);
      gap: 18px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-switch {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-tabs {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-main {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-left-col,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-right-col {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-right-col {
      position: static;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-summary,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-quality,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-file-tree,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-install,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-metadata,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-action,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-comments,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-compatibility {
      height: auto;
      min-height: 0;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-metrics,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-quality-metrics,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-browser-row,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-row {
      flex-wrap: wrap;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-metrics,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-quality-metrics {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-metric,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-quality-metric,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-button.is-large,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-button.is-small {
      width: calc(50% - 4px);
    }


    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-list-panel,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-info-panel {
      width: 100%;
      height: auto;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-info-actions {
      flex-wrap: wrap;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-browser-row {
      height: auto;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-toolbar {
      gap: 10px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-toolbar-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
      min-height: 520px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-metadata-governance {
      flex-wrap: wrap;
      height: auto;
    }
  }

  @media (max-width: 1100px) {
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-aside {
      width: 100%;
    }
  }

  @media (max-width: 760px) {
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top {
      padding: 14px 0;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-title-group {
      width: 100%;
      min-width: 0;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-title {
      font-size: 24px;
    }


    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-summary {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-overview-detail-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-overview-detail-label,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-overview-detail-value {
      flex: 0 0 auto;
      width: 100%;
      text-align: left;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-metrics,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-quality-metrics,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-directory-current {
      width: 100%;
      max-width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-directory-tree {
      max-height: 220px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-reader-intro {
      padding: 14px 15px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-content {
      max-width: 100%;
      font-size: 15px;
      line-height: 1.72;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-heading.is-h1 {
      font-size: clamp(28px, 8vw, 34px);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-heading.is-h2 {
      font-size: clamp(22px, 6vw, 28px);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-heading.is-h3 {
      font-size: clamp(18px, 4.8vw, 22px);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-breadcrumb-button,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-breadcrumb-current {
      min-height: 36px;
      padding: 6px 4px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-pill {
      width: 100%;
      justify-content: center;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-button,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-browse {
      min-height: 44px;
      justify-content: center;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-switch {
      flex-wrap: wrap;
      overflow: visible;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-tabs {
      flex: 1 1 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      overflow: visible;
      padding-bottom: 0;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-button {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-browse {
      width: 100%;
      flex: 1 1 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-toolbar .skill-detail-file-info-actions button {
      min-height: 44px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-current {
      width: 100%;
      text-align: center;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-title {
      font-size: 18px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-metric,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-quality-metric,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-button.is-large,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-button.is-small {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-head,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-state-row,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-code-head,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-state-hint,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-state-meta,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-file-selected {
      flex-wrap: wrap;
      height: auto;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-code-content {
      font-size: 11px;
      line-height: 1.4;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
      min-height: 420px;
      padding: 14px 14px 16px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-content {
      font-size: 15px;
      line-height: 1.74;
      gap: 12px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-heading.is-h1 {
      font-size: 34px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-heading.is-h2 {
      font-size: 28px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-heading.is-h3 {
      font-size: 22px;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-doc-kv {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
`;
