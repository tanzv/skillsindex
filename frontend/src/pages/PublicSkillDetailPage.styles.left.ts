import { css } from "@emotion/react";

export const publicSkillDetailLeftStyles = css`
  .skill-detail-card.is-summary {
    height: 176px;
    padding: 18px;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-summary {
    background: var(--skill-detail-surface-1);
    gap: 10px;
  }

  .skill-detail-summary-head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .skill-detail-summary-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .skill-detail-summary-title {
    margin: 0;
    font-size: 24px;
    line-height: 1.15;
    font-weight: 700;
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page.is-light .skill-detail-summary-title {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-summary-subtitle {
    margin: 0;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-summary-subtitle {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-summary-badges {
    display: inline-flex;
    gap: 5px;
    align-items: center;
  }

  .skill-detail-chip {
    height: 26px;
    border-radius: 8px;
    padding: 5px 12px;
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-primary);
    font-family: "Noto Sans SC", sans-serif;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .skill-detail-page.is-light .skill-detail-chip.is-light {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-chip.is-warning {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-summary-description {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 13px;
    line-height: 1.5;
    font-weight: 500;
  }

  .skill-detail-page.is-light .skill-detail-summary-description {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-summary-metrics {
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .skill-detail-summary-metric,
  .skill-detail-quality-metric {
    border-radius: 10px;
    background: var(--skill-detail-surface-1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    padding: 8px 11px;
    border: 1px solid var(--skill-detail-border);
  }

  .skill-detail-page.is-light .skill-detail-summary-metric,
  .skill-detail-page.is-light .skill-detail-quality-metric {
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-summary-metric {
    width: 265px;
    height: 58px;
  }

  .skill-detail-summary-metric-label,
  .skill-detail-quality-metric-label {
    color: var(--skill-detail-text-muted);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-summary-metric-label,
  .skill-detail-page.is-light .skill-detail-quality-metric-label {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-summary-metric-value,
  .skill-detail-quality-metric-value {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    line-height: 1.2;
    font-weight: 700;
  }

  .skill-detail-page.is-light .skill-detail-summary-metric-value,
  .skill-detail-page.is-light .skill-detail-quality-metric-value {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-summary-metric-value {
    font-size: 14px;
  }

  .skill-detail-card.is-quality {
    height: 116px;
    padding: 14px 18px;
    gap: 8px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-quality {
    gap: 8px;
  }

  .skill-detail-quality-metrics {
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .skill-detail-quality-metric {
    height: 66px;
    flex: 1 1 0;
    min-width: 0;
  }

  .skill-detail-quality-metric-value {
    font-size: 19px;
  }

  .skill-detail-card.is-file-tree {
    min-height: 760px;
    padding: 14px;
    gap: 12px;
  }

  .skill-detail-card.is-file-tree.is-preview-only {
    min-height: 520px;
    padding: 14px;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-file-tree {
    gap: 3px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-file-tree.is-preview-only {
    gap: 8px;
  }

  .skill-detail-file-head,
  .skill-detail-file-state-row,
  .skill-detail-code-head {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skill-detail-file-head {
    min-height: 24px;
  }

  .skill-detail-file-selected {
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 700;
    word-break: break-word;
  }

  .skill-detail-page.is-light .skill-detail-file-selected {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-file-browser-row {
    width: 100%;
    min-height: 280px;
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .skill-detail-page.is-light .skill-detail-file-browser-row {
    gap: 10px;
  }

  .skill-detail-file-list-panel {
    flex: 1 1 0;
    min-width: 0;
    min-height: 280px;
    max-height: 280px;
    border-radius: 12px;
    background: var(--skill-detail-surface-2);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  }

  .skill-detail-page.is-light .skill-detail-file-list-panel {
    background: var(--skill-detail-surface-2);
    gap: 5px;
  }

  .skill-detail-file-list-root {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 700;
  }

  .skill-detail-page.is-light .skill-detail-file-list-root {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-file-row {
    width: 100%;
    min-height: 34px;
    border-radius: 7px;
    background: var(--skill-detail-surface-3);
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 150ms ease, filter 150ms ease;
    border: 1px solid transparent;
  }

  .skill-detail-file-row.is-active {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-primary);
    font-weight: 700;
    border-color: var(--skill-detail-border-strong);
  }

  .skill-detail-page.is-light .skill-detail-file-row {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-file-row.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-file-row:hover {
    filter: brightness(1.05);
    border-color: var(--skill-detail-border-strong);
  }

  .skill-detail-file-hint {
    color: var(--skill-detail-text-muted);
    font-size: 12px;
    line-height: 1.4;
    font-weight: 700;
  }

  .skill-detail-page.is-light .skill-detail-file-hint {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-file-info-panel {
    flex: 0 0 clamp(260px, 38%, 340px);
    min-width: 260px;
    min-height: 280px;
    max-height: 280px;
    border-radius: 12px;
    background: var(--skill-detail-surface-2);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: auto;
  }

  .skill-detail-page.is-light .skill-detail-file-info-panel {
    background: var(--skill-detail-surface-2);
  }

  .skill-detail-file-info-title,
  .skill-detail-file-info-text,
  .skill-detail-file-info-actions button,
  .skill-detail-file-sync {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-file-info-title {
    margin: 0;
    font-size: 14px;
    line-height: 1.35;
    font-weight: 700;
  }

  .skill-detail-file-info-text {
    margin: 0;
    white-space: pre-line;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 600;
    word-break: break-word;
  }

  .skill-detail-file-info-actions {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .skill-detail-file-info-actions button {
    min-height: 32px;
    border-radius: 8px;
    background: var(--skill-detail-surface-3);
    padding: 4px 10px;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 700;
    cursor: pointer;
    transition: filter 160ms ease;
  }

  .skill-detail-page.is-light .skill-detail-file-info-title,
  .skill-detail-page.is-light .skill-detail-file-info-text,
  .skill-detail-page.is-light .skill-detail-file-info-actions button,
  .skill-detail-page.is-light .skill-detail-file-sync {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page.is-light .skill-detail-file-info-actions button {
    background: var(--skill-detail-surface-3);
  }

  .skill-detail-file-info-actions button:hover {
    filter: brightness(1.06);
  }

  .skill-detail-file-sync {
    width: 100%;
    min-height: 34px;
    border-radius: 8px;
    background: var(--skill-detail-surface-3);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 700;
    color: var(--skill-detail-text-secondary);
    text-align: center;
  }

  .skill-detail-page.is-light .skill-detail-file-sync {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-file-preset-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .skill-detail-page.is-light .skill-detail-file-preset-row {
    gap: 6px;
  }

  .skill-detail-file-preset {
    height: 30px;
    border-radius: 9px;
    padding: 5px 11px;
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
    transition: filter 160ms ease;
  }

  .skill-detail-page:not(.is-light) .skill-detail-file-preset {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-file-preset.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
    font-weight: 700;
    cursor: default;
  }

  .skill-detail-file-state-row {
    min-height: 26px;
  }

  .skill-detail-file-state-hint,
  .skill-detail-file-state-meta {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
    word-break: break-word;
  }

  .skill-detail-page.is-light .skill-detail-file-state-hint,
  .skill-detail-page.is-light .skill-detail-file-state-meta {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-file-state-hint {
    font-family: "JetBrains Mono", monospace;
  }

  .skill-detail-file-state-badge {
    min-height: 22px;
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
    font-size: 11px;
    line-height: 1.25;
    font-weight: 700;
  }

  .skill-detail-page:not(.is-light) .skill-detail-file-state-badge {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }
`;
