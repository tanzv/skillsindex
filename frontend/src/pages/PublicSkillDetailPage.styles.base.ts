import { css } from "@emotion/react";

export const publicSkillDetailBaseStyles = css`
  @keyframes skillDetailPageEnter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .skill-detail-stage {
    margin: 0;
    width: 100%;
    min-height: 100dvh;
    background: radial-gradient(circle at 0 0, #171717 0%, #101010 40%, #0a0a0a 100%);
    overflow-x: hidden;
    overflow-y: auto;
  }

  .skill-detail-stage.is-light-stage {
    background: linear-gradient(180deg, #f7f8fa 0%, #eceff3 100%);
  }

  .skill-detail-page {
    --skill-detail-content-width: 100%;
    --skill-detail-bg-root: #111111;
    --skill-detail-bg-top: #171717;
    --skill-detail-bg-top-end: #121212;
    --skill-detail-surface-1: #1b1b1b;
    --skill-detail-surface-2: #242424;
    --skill-detail-surface-3: #2c2c2c;
    --skill-detail-text-primary: #e5e5e5;
    --skill-detail-text-secondary: #b6b8bf;
    --skill-detail-text-muted: #8f949d;
    --skill-detail-border: rgba(255, 255, 255, 0.06);
    --skill-detail-border-strong: rgba(255, 255, 255, 0.12);
    --skill-detail-accent-bg: #d6d6d6;
    --skill-detail-accent-text: #111111;
    --skill-detail-focus-ring: #d6d6d6;
    --skill-detail-danger: #ef4444;
    --skill-detail-motion-fast: 160ms;
    --skill-detail-motion-medium: 260ms;
    --skill-detail-motion-slow: 360ms;
    --skill-detail-ease-standard: cubic-bezier(0.2, 0, 0, 1);
    width: 100%;
    max-width: none;
    min-height: 1160px;
    margin: 0 auto;
    padding: 0 0 12px;
    background: #111111;
    background: var(--skill-detail-bg-root);
    color: var(--skill-detail-text-primary);
    font-family: "IBM Plex Sans", "Noto Sans SC", "Noto Sans", sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transform-origin: top left;
    animation: skillDetailPageEnter 220ms ease-out both;
  }

  .skill-detail-page.is-visual-baseline {
    width: 1440px;
    max-width: none;
  }

  .skill-detail-page.is-light {
    --skill-detail-bg-root: #f4f5f7;
    --skill-detail-bg-top: #ffffff;
    --skill-detail-bg-top-end: #f1f3f6;
    --skill-detail-surface-1: #ffffff;
    --skill-detail-surface-2: #f1f3f6;
    --skill-detail-surface-3: #e7ebf1;
    --skill-detail-text-primary: #111827;
    --skill-detail-text-secondary: #3f4654;
    --skill-detail-text-muted: #687385;
    --skill-detail-border: rgba(15, 23, 42, 0.08);
    --skill-detail-border-strong: rgba(15, 23, 42, 0.14);
    --skill-detail-accent-bg: #1f2937;
    --skill-detail-accent-text: #f8fafc;
    --skill-detail-focus-ring: #334155;
    --skill-detail-danger: #b42318;
    background: var(--skill-detail-bg-root);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page * {
    box-sizing: border-box;
  }

  .skill-detail-page button {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  .skill-detail-top {
    width: var(--skill-detail-content-width);
    margin: 0 auto;
    min-height: 120px;
    padding: 20px 0;
    background: #171717;
    background: linear-gradient(180deg, var(--skill-detail-bg-top) 0%, var(--skill-detail-bg-top-end) 100%);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 0;
  }

  .skill-detail-page.is-light .skill-detail-top {
    background: linear-gradient(180deg, var(--skill-detail-bg-top) 0%, var(--skill-detail-bg-top-end) 100%);
    border-bottom: 0;
  }

  .skill-detail-title-group {
    width: min(760px, 100%);
    min-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skill-detail-title {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: 34px;
    line-height: 1.06;
    font-weight: 700;
    letter-spacing: -0.015em;
  }

  .skill-detail-page.is-light .skill-detail-title {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-breadcrumb {
    min-height: 26px;
    max-width: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .skill-detail-breadcrumb-list {
    margin: 0;
    padding: 0;
    list-style: none;
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .skill-detail-breadcrumb-node {
    min-width: 0;
    max-width: clamp(72px, 20vw, 300px);
    display: inline-flex;
    align-items: center;
  }

  .skill-detail-breadcrumb-separator {
    color: color-mix(in srgb, var(--skill-detail-text-muted) 88%, transparent);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    line-height: 1;
    font-weight: 700;
    user-select: none;
    flex: 0 0 auto;
  }

  .skill-detail-breadcrumb-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-detail-breadcrumb-button {
    border: 1px solid transparent;
    background: transparent;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 650;
    cursor: pointer;
    min-height: 26px;
    border-radius: 999px;
    padding: 0 10px;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
  }

  .skill-detail-breadcrumb-button:focus-visible {
    outline: 2px solid var(--skill-detail-focus-ring);
    outline-offset: 2px;
    border-radius: 999px;
  }

  .skill-detail-breadcrumb-button:hover {
    color: var(--skill-detail-text-primary);
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 62%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 76%, transparent);
    transform: translateY(-1px);
  }

  .skill-detail-breadcrumb-current {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    min-height: 26px;
    border-radius: 999px;
    padding: 0 10px;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 64%, transparent);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 20%, transparent);
  }

  .skill-detail-page.is-light .skill-detail-breadcrumb-button {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-breadcrumb-button:hover {
    color: var(--skill-detail-text-primary);
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 70%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-2) 84%, transparent);
  }

  .skill-detail-page.is-light .skill-detail-breadcrumb-current {
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 78%, transparent);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 14%, transparent);
  }

  .skill-detail-meta-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skill-detail-meta-chip {
    height: 26px;
    border-radius: 999px;
    padding: 0 12px;
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }

  .skill-detail-meta-chip.is-accent {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-meta-chip.is-success {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-meta-chip {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-meta-chip.is-accent {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-page.is-light .skill-detail-meta-chip.is-success {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-top-actions {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .skill-detail-pill {
    height: 40px;
    border-radius: 12px;
    padding: 0 16px;
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition: filter 180ms ease, transform 180ms ease;
  }

  .skill-detail-page.is-light .skill-detail-pill {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-pill.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
    cursor: default;
  }

  .skill-detail-page.is-light .skill-detail-pill.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-pill.is-primary-action {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-pill.is-secondary-action {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-pill.is-warning {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-pill.is-success {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-pill.is-neutral {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-pill.is-secondary-action {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-pill.is-neutral {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-pill:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-detail-pill:not(.is-active):not(:disabled):hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
  }

  .skill-detail-top-actions .skill-detail-pill.is-top-action {
    min-height: 44px;
    border-radius: 11px;
    padding: 0 18px;
    border: 1px solid var(--skill-detail-border);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.24);
    letter-spacing: 0.01em;
  }

  .skill-detail-top-actions .skill-detail-pill.is-top-action.is-secondary-action {
    border-color: var(--skill-detail-border);
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-top-actions .skill-detail-pill.is-top-action.is-primary-action {
    border-color: var(--skill-detail-border-strong);
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-top-actions .skill-detail-pill.is-top-action.is-neutral {
    border-color: var(--skill-detail-border);
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-top-actions .skill-detail-pill.is-top-action {
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
  }

  .skill-detail-page.is-light .skill-detail-top-actions .skill-detail-pill.is-top-action.is-secondary-action {
    border-color: var(--skill-detail-border);
    background: var(--skill-detail-surface-2);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-top-actions .skill-detail-pill.is-top-action.is-primary-action {
    border-color: var(--skill-detail-border-strong);
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-page.is-light .skill-detail-top-actions .skill-detail-pill.is-top-action.is-neutral {
    border-color: var(--skill-detail-border);
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-main {
    width: var(--skill-detail-content-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
    gap: 16px;
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
    gap: 16px;
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
    flex-direction: column;
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
    border-radius: 16px;
    background: #242424;
    background: var(--skill-detail-surface-2);
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 0;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    transition:
      box-shadow var(--skill-detail-motion-medium) var(--skill-detail-ease-standard),
      background-color var(--skill-detail-motion-medium) var(--skill-detail-ease-standard);
  }

  .skill-detail-page.is-light .skill-detail-card {
    background: var(--skill-detail-surface-2);
    color: var(--skill-detail-text-primary);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }

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
