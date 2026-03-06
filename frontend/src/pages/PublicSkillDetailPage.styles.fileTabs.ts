import { css } from "@emotion/react";

export const publicSkillDetailFileTabsStyles = css`
  .skill-detail-top-file-switch {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .skill-detail-top-file-tabs {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    flex: 1 1 auto;
    width: auto;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .skill-detail-top-file-tabs::-webkit-scrollbar {
    display: none;
  }

  .skill-detail-top-file-button,
  .skill-detail-top-file-browse {
    flex: 0 0 auto;
    white-space: nowrap;
    min-height: 34px;
    border-radius: 8px;
    padding: 5px 10px;
    border: 0;
    background: color-mix(in srgb, var(--skill-detail-surface-2) 72%, transparent);
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
    transition:
      filter var(--skill-detail-motion-fast) var(--skill-detail-ease-standard),
      background-color var(--skill-detail-motion-fast) var(--skill-detail-ease-standard),
      box-shadow var(--skill-detail-motion-fast) var(--skill-detail-ease-standard);
  }

  .skill-detail-top-file-button:focus-visible,
  .skill-detail-top-file-browse:focus-visible {
    outline: 2px solid var(--skill-detail-focus-ring);
    outline-offset: 1px;
  }

  .skill-detail-top-file-button.is-active {
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 88%, transparent);
    color: var(--skill-detail-accent-text);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--skill-detail-border-strong) 54%, transparent);
  }

  .skill-detail-top-file-button:hover,
  .skill-detail-top-file-browse:hover {
    filter: brightness(1.08);
  }

  .skill-detail-page.is-light .skill-detail-top-file-button,
  .skill-detail-page.is-light .skill-detail-top-file-browse {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, transparent);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-top-file-button.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }
`;
