import { css } from "@emotion/react";

export const publicSkillDetailPolishDetailStyles = css`
  .skill-detail-resource-head {
    gap: 14px;
  }

  .skill-detail-resource-heading {
    font-size: clamp(20px, 1.7vw, 24px);
  }

  .skill-detail-resource-subheading {
    max-width: 72ch;
  }

  .skill-detail-installation-grid,
  .skill-detail-resource-facts {
    gap: 10px;
  }

  .skill-detail-resource-block,
  .skill-detail-resource-fact,
  .skill-detail-related-card {
    border-radius: 14px;
    padding: 16px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 86%, var(--skill-detail-surface-2) 14%);
  }

  .skill-detail-resource-code,
  .skill-detail-agent-prompt-body {
    border-radius: 12px;
    padding: 12px 14px;
    max-height: 164px;
    overflow: auto;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 82%, var(--skill-detail-surface-2) 18%);
  }

  .skill-detail-related-grid {
    gap: 10px;
  }

  .skill-detail-related-card {
    gap: 12px;
  }

  .skill-detail-related-card-title {
    font-size: 15px;
    line-height: 1.4;
  }

  .skill-detail-related-card-description,
  .skill-detail-empty-state,
  .skill-detail-history-text {
    font-size: 13.5px;
    line-height: 1.7;
  }

  .skill-detail-right-col {
    gap: 16px;
  }

  .skill-detail-side-panel {
    gap: 14px;
  }

  .skill-detail-side-card-head {
    align-items: center;
    gap: 12px;
  }

  .skill-detail-side-link {
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 80%, var(--skill-detail-surface-2) 20%);
  }

  .skill-detail-side-link:hover {
    background: color-mix(in srgb, var(--skill-detail-surface-soft-alt) 88%, transparent);
  }

  .skill-detail-side-segment {
    gap: 6px;
    padding: 4px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-soft-alt) 86%, transparent);
    border: 1px solid var(--skill-detail-card-border);
  }

  .skill-detail-side-segment-button {
    min-height: 38px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
  }

  .skill-detail-side-segment-button.is-active {
    color: var(--skill-detail-text-primary);
    border-color: color-mix(in srgb, var(--skill-detail-accent-bg) 22%, var(--skill-detail-card-border) 78%);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 12%, transparent);
  }

  .skill-detail-action-main {
    min-height: 48px;
    border-radius: 12px;
  }

  .skill-detail-action-row {
    gap: 8px;
  }

  .skill-detail-action-button {
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, var(--skill-detail-surface-2) 16%);
  }

  .skill-detail-action-button:hover,
  .skill-detail-action-main:hover,
  .skill-detail-rating-button:hover,
  .skill-detail-comment-delete:hover {
    transform: none;
  }

  .skill-detail-action-feedback-panel {
    gap: 14px;
    padding-top: 14px;
  }

  .skill-detail-rating-row {
    gap: 8px;
  }

  .skill-detail-rating-button {
    border-radius: 12px;
  }

  .skill-detail-comment-input {
    min-height: 112px;
    border-radius: 12px;
    padding: 14px;
    line-height: 1.65;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, var(--skill-detail-surface-2) 16%);
  }

  .skill-detail-feedback {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    line-height: 1.55;
    font-weight: 600;
  }

  .skill-detail-comment-item {
    padding: 14px;
    gap: 10px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, var(--skill-detail-surface-2) 16%);
  }

  .skill-detail-comment-meta {
    font-size: 11.5px;
  }

  .skill-detail-comment-content {
    font-size: 13.5px;
    line-height: 1.7;
  }

  .skill-detail-comment-delete {
    min-height: 34px;
    border-radius: 10px;
  }

  @media (max-width: 1180px) {
    .skill-detail-summary-metrics,
    .skill-detail-quality-metrics,
    .skill-detail-installation-grid,
    .skill-detail-resource-facts,
    .skill-detail-related-grid,
    .skill-detail-overview-sections {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .skill-detail-top {
      padding: 16px 0 12px;
    }

    .skill-detail-title {
      font-size: 28px;
    }

    .skill-detail-title-description {
      font-size: 14px;
      line-height: 1.64;
    }

    .skill-detail-resource-tab-switch {
      padding: 8px;
    }

    .skill-detail-summary-metrics,
    .skill-detail-quality-metrics,
    .skill-detail-installation-grid,
    .skill-detail-resource-facts,
    .skill-detail-related-grid,
    .skill-detail-overview-sections,
    .skill-detail-action-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
      min-height: 460px;
    }

    .skill-detail-code-panel.is-document {
      padding: 18px 16px 20px;
    }
  }
`;
