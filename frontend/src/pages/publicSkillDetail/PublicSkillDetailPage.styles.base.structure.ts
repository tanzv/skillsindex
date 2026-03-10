import { css } from "@emotion/react";

export const publicSkillDetailBaseStructureStyles = css`
  .skill-detail-main {
    width: var(--skill-detail-content-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(328px, 380px);
    gap: 20px;
    align-items: flex-start;
  }

  .skill-detail-left-col {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skill-detail-right-col {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .skill-detail-right-col .skill-detail-card.is-summary {
    height: auto;
    min-height: 0;
    padding: 16px;
    gap: 10px;
  }

  .skill-detail-right-col .skill-detail-card.is-quality {
    height: auto;
    min-height: 0;
    padding: 14px 16px;
    gap: 8px;
  }

  .skill-detail-right-col .skill-detail-summary-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .skill-detail-right-col .skill-detail-summary-title {
    font-size: 21px;
  }

  .skill-detail-right-col .skill-detail-summary-metrics,
  .skill-detail-right-col .skill-detail-quality-metrics {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    align-items: stretch;
  }

  .skill-detail-right-col .skill-detail-summary-metric,
  .skill-detail-right-col .skill-detail-quality-metric {
    width: 100%;
    min-height: 58px;
    height: auto;
  }

  .skill-detail-right-col .skill-detail-quality-metric-value {
    font-size: 16px;
  }

  .skill-detail-card {
    border-radius: 14px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 88%, var(--skill-detail-surface-2) 12%);
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 90%, transparent);
    box-shadow: none;
    transition:
      border-color var(--skill-detail-motion-medium) var(--skill-detail-ease-standard),
      background-color var(--skill-detail-motion-medium) var(--skill-detail-ease-standard);
  }

  .skill-detail-page.is-light .skill-detail-card {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 96%, var(--skill-detail-surface-2) 4%);
    color: var(--skill-detail-text-primary);
    box-shadow: none;
  }

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

  .skill-detail-card-title {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 15px;
    line-height: 1.2;
    font-weight: 700;
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page.is-light .skill-detail-card-title {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-title-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: var(--skill-detail-accent-bg);
    flex: 0 0 auto;
  }

  .skill-detail-page:not(.is-light) .skill-detail-title-dot.is-dark-dot {
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-feedback {
    margin: 0;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 700;
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-page.is-light .skill-detail-feedback {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-loading,
  .skill-detail-empty,
  .skill-detail-error {
    width: 100%;
    height: 320px;
    display: grid;
    place-items: center;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 600;
  }

  .skill-detail-error {
    color: var(--skill-detail-danger);
  }
`;
