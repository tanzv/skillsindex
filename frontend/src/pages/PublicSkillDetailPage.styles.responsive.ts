import { css } from "@emotion/react";

export const publicSkillDetailResponsiveStyles = css`
  .skill-detail-page .skill-detail-summary-metric,
  .skill-detail-page .skill-detail-quality-metric,
  .skill-detail-page .skill-detail-metadata-owner,
  .skill-detail-page .skill-detail-metadata-lines,
  .skill-detail-page .skill-detail-metadata-governance,
  .skill-detail-page .skill-detail-install-step,
  .skill-detail-page .skill-detail-action-button {
    border: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .skill-detail-page.is-light .skill-detail-summary-metric,
  .skill-detail-page.is-light .skill-detail-quality-metric,
  .skill-detail-page.is-light .skill-detail-metadata-owner,
  .skill-detail-page.is-light .skill-detail-metadata-lines,
  .skill-detail-page.is-light .skill-detail-metadata-governance,
  .skill-detail-page.is-light .skill-detail-install-step,
  .skill-detail-page.is-light .skill-detail-action-button {
    box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.08);
  }

  @media (max-width: 1460px) {
    .skill-detail-page:not(.is-visual-baseline) {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-main {
      width: 100%;
    }
  }

  @media (max-width: 1320px) {
    .skill-detail-page:not(.is-visual-baseline) {
      min-height: 100dvh;
      height: auto;
      padding-bottom: 18px;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar {
      height: auto;
      width: 100%;
      padding: 8px 0;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-actions {
      width: 100%;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-left-group,
    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-light-nav,
    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-light-utility {
      width: 100%;
      flex-wrap: wrap;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-locale-switch {
      margin-left: auto;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top {
      height: auto;
      width: 100%;
      padding: 16px 0;
      flex-wrap: wrap;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-switch {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-main {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-left-col,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-right-col {
      width: 100%;
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

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-summary-metric,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-quality-metric,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-button.is-large,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-action-button.is-small {
      width: calc(50% - 4px);
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

  @media (max-width: 760px) {
    .skill-detail-page:not(.is-visual-baseline) {
      --skill-detail-content-width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-main {
      width: 100%;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar {
      padding: 8px 0;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-brand-copy strong {
      font-size: 18px;
    }

    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-light-nav button,
    .skill-detail-page:not(.is-visual-baseline) .marketplace-topbar-light-utility > button {
      width: 100%;
      justify-content: center;
    }

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

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-pill {
      width: 100%;
      justify-content: center;
    }

    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-button,
    .skill-detail-page:not(.is-visual-baseline) .skill-detail-top-file-browse {
      flex: 1 1 calc(50% - 4px);
      justify-content: center;
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
