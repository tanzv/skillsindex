import { css } from "@emotion/react";

export const publicSkillDetailBaseFoundationStyles = css`
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
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--si-color-surface, #171717) 28%, var(--si-color-canvas, #101010) 72%) 0%,
      var(--si-color-canvas, #101010) 100%
    );
    overflow-x: hidden;
    overflow-y: auto;
  }

  .skill-detail-stage.si-layout-shell-stage-light {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--si-color-surface, #ffffff) 36%, var(--si-color-canvas, #eef1f5) 64%) 0%,
      var(--si-color-canvas, #eef1f5) 100%
    );
  }

  .skill-detail-page {
    --skill-detail-content-width: 100%;
    --skill-detail-bg-root: var(--si-color-canvas, #101010);
    --skill-detail-bg-top: color-mix(in srgb, var(--si-color-surface, #171717) 90%, var(--si-color-canvas, #101010) 10%);
    --skill-detail-bg-top-end: var(--si-color-canvas, #101010);
    --skill-detail-surface-1: var(--si-color-panel, #111111);
    --skill-detail-surface-2: color-mix(in srgb, var(--si-color-surface, #171717) 84%, var(--si-color-panel, #111111) 16%);
    --skill-detail-surface-3: color-mix(in srgb, var(--si-color-surface-alt, #1a1a1a) 78%, var(--si-color-panel, #111111) 22%);
    --skill-detail-text-primary: var(--si-color-text-primary, #e5e5e5);
    --skill-detail-text-secondary: var(--si-color-text-secondary, #a3a3a3);
    --skill-detail-text-muted: color-mix(in srgb, var(--si-color-text-secondary, #a3a3a3) 74%, transparent);
    --skill-detail-border: color-mix(in srgb, var(--si-color-border, #2b2b2b) 86%, transparent);
    --skill-detail-border-strong: color-mix(in srgb, var(--si-color-border-soft, #3a3a3a) 90%, transparent);
    --skill-detail-accent-bg: var(--si-color-accent, #d6d6d6);
    --skill-detail-accent-text: var(--si-color-accent-contrast, #111111);
    --skill-detail-focus-ring: var(--si-color-accent, #d6d6d6);
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
    gap: 14px;
    transform-origin: top left;
    animation: skillDetailPageEnter 220ms ease-out both;
  }

  .skill-detail-page.is-visual-baseline {
    width: 1440px;
    max-width: none;
  }

  .skill-detail-page.is-light {
    --skill-detail-bg-root: color-mix(in srgb, var(--si-color-canvas, #eef1f5) 92%, #e3eaf3 8%);
    --skill-detail-bg-top: color-mix(in srgb, var(--si-color-surface, #ffffff) 90%, #eef3f8 10%);
    --skill-detail-bg-top-end: color-mix(in srgb, var(--si-color-canvas, #eef1f5) 94%, #e7edf5 6%);
    --skill-detail-surface-1: var(--si-color-panel, #ffffff);
    --skill-detail-surface-2: color-mix(in srgb, var(--si-color-canvas, #eef1f5) 78%, #d9e2ec 22%);
    --skill-detail-surface-3: color-mix(in srgb, #d5deea 62%, var(--si-color-surface, #ffffff) 38%);
    --skill-detail-text-primary: var(--si-color-text-primary, #111111);
    --skill-detail-text-secondary: color-mix(in srgb, var(--si-color-text-secondary, #555555) 86%, #233044 14%);
    --skill-detail-text-muted: color-mix(in srgb, var(--si-color-text-secondary, #555555) 72%, #475569 28%);
    --skill-detail-border: color-mix(in srgb, var(--si-color-border, #d6d6d6) 82%, #b8c4d3 18%);
    --skill-detail-border-strong: color-mix(in srgb, var(--si-color-border-soft, #e5e5e5) 72%, #9aaabd 28%);
    --skill-detail-accent-bg: var(--si-color-accent, #111111);
    --skill-detail-accent-text: var(--si-color-accent-contrast, #e5e5e5);
    --skill-detail-focus-ring: var(--si-color-accent, #111111);
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
    min-height: 104px;
    padding: 24px 0 18px;
    background: #171717;
    background: linear-gradient(180deg, var(--skill-detail-bg-top) 0%, var(--skill-detail-bg-top-end) 100%);
    border-bottom: 1px solid color-mix(in srgb, var(--skill-detail-border) 78%, transparent);
  }

  .skill-detail-top-layout {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
    align-items: start;
    gap: 16px;
  }

  .skill-detail-page.is-light .skill-detail-top {
    background: linear-gradient(180deg, var(--skill-detail-bg-top) 0%, var(--skill-detail-bg-top-end) 100%);
    border-bottom-color: color-mix(in srgb, var(--skill-detail-border) 88%, #c8d2de 12%);
  }

  .skill-detail-title-group {
    width: 100%;
    max-width: 100%;
    min-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skill-detail-title {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: clamp(30px, 3vw, 34px);
    line-height: 1.08;
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
    font-size: 12px;
    line-height: 1;
    font-weight: 650;
    cursor: pointer;
    min-height: 28px;
    border-radius: 999px;
    padding: 0 12px;
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
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    min-height: 28px;
    border-radius: 999px;
    padding: 0 12px;
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
    gap: 8px;
    flex-wrap: wrap;
  }

  .skill-detail-meta-chip {
    min-height: 28px;
    border-radius: 999px;
    padding: 0 12px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 78%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 64%, var(--skill-detail-surface-2) 36%);
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
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
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #c7d2df 16%);
    background: color-mix(in srgb, #ffffff 54%, var(--skill-detail-surface-3) 46%);
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


  .skill-detail-top-aside {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: stretch;
  }

  .skill-detail-top-summary {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .skill-detail-top-summary-card {
    min-width: 0;
    min-height: 72px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 72%, var(--skill-detail-surface-2) 28%);
    padding: 12px 14px;
    display: grid;
    gap: 6px;
    align-content: start;
  }

  .skill-detail-page.is-light .skill-detail-top-summary-card {
    background: color-mix(in srgb, #ffffff 88%, var(--skill-detail-surface-2) 12%);
  }

  .skill-detail-top-summary-label {
    color: var(--skill-detail-text-muted);
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
  }

  .skill-detail-top-summary-value {
    color: var(--skill-detail-text-primary);
    font-size: 14px;
    line-height: 1.4;
    font-weight: 700;
    word-break: break-word;
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
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 66%, var(--skill-detail-surface-2) 34%);
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
    border-color: color-mix(in srgb, var(--skill-detail-border) 86%, #c7d2df 14%);
    background: color-mix(in srgb, #ffffff 56%, var(--skill-detail-surface-3) 44%);
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
`;
