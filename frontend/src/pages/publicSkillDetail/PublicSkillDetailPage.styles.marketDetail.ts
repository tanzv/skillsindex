import { css } from "@emotion/react";

export const publicSkillDetailMarketDetailStyles = css`
  .skill-detail-resource-shell {
    gap: 16px;
  }

  .skill-detail-resource-tab-switch {
    margin-bottom: 2px;
  }

  .skill-detail-resource-tab-list {
    gap: 10px;
  }

  .skill-detail-resource-panel {
    gap: 16px;
  }

  .skill-detail-resource-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .skill-detail-resource-heading {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: clamp(22px, 1.8vw, 26px);
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: -0.015em;
  }

  .skill-detail-resource-subheading {
    margin: 6px 0 0;
    color: var(--skill-detail-text-secondary);
    font-size: 13px;
    line-height: 1.55;
  }

  .skill-detail-installation-grid,
  .skill-detail-resource-facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .skill-detail-resource-block,
  .skill-detail-resource-fact,
  .skill-detail-related-card {
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 88%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 78%, var(--skill-detail-surface-2) 22%);
    padding: 14px;
  }

  .skill-detail-page.is-light .skill-detail-resource-block,
  .skill-detail-page.is-light .skill-detail-resource-fact,
  .skill-detail-page.is-light .skill-detail-related-card {
    background: #ffffff;
  }

  .skill-detail-resource-label {
    margin: 0 0 10px;
    color: var(--skill-detail-text-muted);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .skill-detail-resource-code,
  .skill-detail-agent-prompt-body {
    margin: 0;
    border-radius: 10px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 72%, var(--skill-detail-surface-2) 28%);
    padding: 12px 14px;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
  }

  .skill-detail-page.is-light .skill-detail-resource-code,
  .skill-detail-page.is-light .skill-detail-agent-prompt-body {
    background: color-mix(in srgb, #ffffff 92%, var(--skill-detail-surface-2) 8%);
  }

  .skill-detail-resource-fact {
    display: grid;
    gap: 8px;
  }

  .skill-detail-resource-fact-label {
    color: var(--skill-detail-text-muted);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .skill-detail-resource-fact-value {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12.5px;
    line-height: 1.55;
    font-weight: 600;
    word-break: break-word;
  }

  .skill-detail-related-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .skill-detail-related-card {
    display: grid;
    gap: 10px;
  }

  .skill-detail-related-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .skill-detail-related-card-title {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: 15px;
    line-height: 1.35;
    font-weight: 700;
  }

  .skill-detail-related-card-stars,
  .skill-detail-related-card-meta {
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 11.5px;
    line-height: 1.45;
    font-weight: 600;
  }

  .skill-detail-related-card-description,
  .skill-detail-empty-state,
  .skill-detail-history-text {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  .skill-detail-history-list {
    display: grid;
    gap: 12px;
  }

  .skill-detail-history-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 4px 0;
  }

  .skill-detail-history-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--skill-detail-accent-bg);
    margin-top: 7px;
    flex: 0 0 auto;
  }

  .skill-detail-history-content {
    display: grid;
    gap: 6px;
  }

  .skill-detail-history-date {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 700;
  }

  .skill-detail-side-panel {
    gap: 14px;
  }

  .skill-detail-side-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .skill-detail-side-link {
    min-height: 28px;
    border-radius: 999px;
    padding: 0 10px;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 70%, var(--skill-detail-surface-2) 30%);
    cursor: pointer;
  }

  .skill-detail-side-link:hover {
    background: color-mix(in srgb, var(--skill-detail-surface-3) 60%, transparent);
  }

  .skill-detail-side-segment {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .skill-detail-side-segment-button {
    min-height: 38px;
    border-radius: 10px;
    padding: 0 12px;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    line-height: 1.2;
    font-weight: 700;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 72%, var(--skill-detail-surface-2) 28%);
    cursor: pointer;
  }

  .skill-detail-side-segment-button.is-active {
    color: var(--skill-detail-accent-text);
    background: var(--skill-detail-accent-bg);
  }

  .skill-detail-agent-panel,
  .skill-detail-human-panel {
    display: grid;
    gap: 12px;
  }

  .skill-detail-agent-hint {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    line-height: 1.55;
    font-weight: 600;
  }

  .skill-detail-agent-prompt-shell {
    display: grid;
    gap: 8px;
  }

  .skill-detail-agent-prompt-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--skill-detail-text-primary);
    font-size: 13px;
    line-height: 1.2;
    font-weight: 700;
  }

  .skill-detail-card.is-file-control.skill-detail-side-panel {
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-card.is-file-control.skill-detail-side-panel .skill-detail-directory-shell {
    padding: 0;
    background: transparent;
    border: 0;
  }

  .skill-detail-card.is-file-control.skill-detail-side-panel .skill-detail-directory-tree {
    max-height: 240px;
  }


  .skill-detail-page.is-locale-zh .skill-detail-top-file-button,
  .skill-detail-page.is-locale-zh .skill-detail-side-segment-button,
  .skill-detail-page.is-locale-zh .skill-detail-side-link,
  .skill-detail-page.is-locale-zh .skill-detail-resource-heading,
  .skill-detail-page.is-locale-zh .skill-detail-related-card-title {
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    letter-spacing: 0;
  }

  .skill-detail-page.is-locale-zh .skill-detail-resource-label,
  .skill-detail-page.is-locale-zh .skill-detail-resource-fact-label {
    letter-spacing: 0;
    text-transform: none;
  }

  .skill-detail-page.is-light .skill-detail-side-link,
  .skill-detail-page.is-light .skill-detail-side-segment-button {
    background: color-mix(in srgb, #ffffff 92%, var(--skill-detail-surface-2) 8%);
  }

  .skill-detail-page.is-light .skill-detail-side-link:hover,
  .skill-detail-page.is-light .skill-detail-side-segment-button:hover {
    background: color-mix(in srgb, #ffffff 72%, var(--skill-detail-surface-3) 28%);
  }

  .skill-detail-page.is-light .skill-detail-side-segment-button.is-active {
    color: var(--skill-detail-accent-text);
    background: var(--skill-detail-accent-bg);
  }

  @media (max-width: 1320px) {
    .skill-detail-related-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .skill-detail-installation-grid,
    .skill-detail-resource-facts,
    .skill-detail-related-grid,
    .skill-detail-side-segment {
      grid-template-columns: minmax(0, 1fr);
    }

    .skill-detail-side-card-head {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
`;
