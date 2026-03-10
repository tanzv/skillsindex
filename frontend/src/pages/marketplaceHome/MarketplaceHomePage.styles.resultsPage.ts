import { css } from "@emotion/react";

export const marketplaceHomeResultsPageStyles = css`
  @keyframes marketplaceResultsOverlayEnter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes marketplaceResultsInputSweep {
    from {
      opacity: 0;
      transform: translateX(-42%);
    }

    28% {
      opacity: 0.48;
    }

    to {
      opacity: 0;
      transform: translateX(42%);
    }
  }

  .marketplace-results-overlay {
    --marketplace-results-mask: var(--si-color-overlay-mask, rgba(15, 23, 42, 0.56));
    --marketplace-results-canvas-background: var(--si-color-surface-alt, #d6d6d6);
    --marketplace-results-canvas-border: var(--si-color-border, #d6d6d6);
    --marketplace-results-modal-background: var(--si-color-panel, #ffffff);
    --marketplace-results-modal-border: var(--si-color-border, #d6d6d6);
    --marketplace-results-title-color: var(--si-color-text-primary, #111111);
    --marketplace-results-close-border: var(--si-color-border-soft, #d6d6d6);
    --marketplace-results-close-background: var(--si-color-muted-surface, #f3f4f6);
    --marketplace-results-close-color: var(--si-color-text-secondary, #3e3e3e);
    --marketplace-results-close-hover-background: var(--si-color-surface-alt, #e8eaee);
    --marketplace-results-input-border: var(--si-color-border, #d6d6d6);
    --marketplace-results-input-background: var(--si-color-field, #ffffff);
    --marketplace-results-input-text: var(--si-color-text-weak, #6a6a6a);
    --marketplace-results-search-button-background: var(--si-color-accent, #111111);
    --marketplace-results-search-button-text: var(--si-color-accent-contrast, #e5e5e5);
    --marketplace-results-search-button-hover: var(--si-color-surface-alt, #1c1d22);
    --marketplace-results-chip-border: var(--si-color-border-soft, #e5e5e5);
    --marketplace-results-chip-background: var(--si-color-muted-surface, #f7f7f7);
    --marketplace-results-chip-text: var(--si-color-text-secondary, #2a2a2a);
    --marketplace-results-chip-active-border: var(--si-color-accent, #111111);
    --marketplace-results-chip-active-background: var(--si-color-accent, #111111);
    --marketplace-results-chip-active-text: var(--si-color-accent-contrast, #e5e5e5);
    --marketplace-results-muted-text: var(--si-color-text-secondary, #555555);
    --marketplace-results-card-border: var(--si-color-border, #d6d6d6);
    --marketplace-results-card-background: var(--si-color-field, #ffffff);
    --marketplace-results-card-title: var(--si-color-text-primary, #111111);
    --marketplace-results-card-action: var(--si-color-text-primary, #111111);
    --marketplace-results-stats-background: var(--si-color-muted-surface, #f3f4f6);
    --marketplace-results-stats-text: var(--si-color-text-secondary, #3e3e3e);
    --marketplace-results-stats-strong-background: var(--si-color-success-bg, #ecfdf3);
    --marketplace-results-stats-strong-text: var(--si-color-success-text, #065f46);

    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: clamp(64px, 10dvh, 136px) 20px 20px;
    overflow-y: auto;
    overflow-x: hidden;
    animation: marketplaceResultsOverlayEnter 300ms ease-out both;
  }

  .marketplace-results-overlay .marketplace-results-floating-mask {
    position: absolute;
    inset: 0;
    border: 0;
    margin: 0;
    padding: 0;
    background: var(--marketplace-results-mask);
    cursor: pointer;
  }

  .marketplace-results-overlay .marketplace-results-overlay-layout {
    position: relative;
    width: min(1120px, 100%);
    height: min(820px, calc(100dvh - 96px));
    min-height: min(460px, calc(100dvh - 120px));
    max-height: calc(100dvh - 96px);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .marketplace-results-overlay .marketplace-results-floating-container {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 14px;
    background: #d6d6d6;
    background: var(--marketplace-results-canvas-background);
    border: 1px solid #d6d6d6;
    border-color: var(--marketplace-results-canvas-border);
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    padding: 14px;
    pointer-events: auto;
  }

  .marketplace-results-overlay .marketplace-results-modal {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 16px;
    border: 1px solid #d6d6d6;
    border-color: var(--marketplace-results-modal-border);
    background: #ffffff;
    background: var(--marketplace-results-modal-background);
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    box-shadow: 0 18px 34px rgba(0, 0, 0, 0.12);
    overflow: hidden;
  }

  .marketplace-results-overlay .marketplace-results-modal-header {
    width: 100%;
    min-height: 44px;
    min-height: var(--marketplace-results-header-min-height, 44px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .marketplace-results-overlay .marketplace-results-modal-header h2 {
    margin: 0;
    color: var(--marketplace-results-title-color);
    font-size: 18px;
    font-size: var(--marketplace-results-title-size, 18px);
    font-weight: 700;
  }

  .marketplace-results-overlay .marketplace-results-close {
    height: 34px;
    height: var(--marketplace-results-close-height, 34px);
    border-radius: 999px;
    border: 1px solid var(--marketplace-results-close-border);
    background: #f3f4f6;
    background: var(--marketplace-results-close-background);
    color: var(--marketplace-results-close-color);
    padding: 0 14px;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    font-size: var(--marketplace-results-close-font-size, 12px);
    font-weight: 700;
    cursor: pointer;
  }

  .marketplace-results-overlay .marketplace-results-close:hover {
    background: var(--marketplace-results-close-hover-background);
  }

  .marketplace-results-overlay .marketplace-results-close:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .marketplace-results-overlay .marketplace-results-modal-search-row {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 12px;
    align-items: center;
  }

  .marketplace-results-overlay .marketplace-results-modal-input {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    height: 46px;
    height: var(--marketplace-results-input-height, 46px);
    border-radius: 12px;
    border: 1px solid var(--marketplace-results-input-border);
    background: var(--marketplace-results-input-background);
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    transition:
      box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .marketplace-results-overlay .marketplace-results-modal-input::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: linear-gradient(
      120deg,
      transparent 10%,
      color-mix(in srgb, var(--marketplace-results-chip-active-border) 34%, transparent) 48%,
      transparent 86%
    );
    opacity: 0;
    transform: translateX(-42%);
    pointer-events: none;
    z-index: 0;
  }

  .marketplace-results-overlay .marketplace-results-modal-input > * {
    position: relative;
    z-index: 1;
  }

  .marketplace-results-overlay .marketplace-results-modal-input:hover {
    border-color: var(--marketplace-results-chip-active-border);
    background: color-mix(in srgb, var(--marketplace-results-input-background) 92%, var(--marketplace-results-chip-active-background));
    box-shadow:
      0 10px 22px rgba(15, 23, 42, 0.08),
      0 0 0 1px color-mix(in srgb, var(--marketplace-results-chip-active-border) 42%, transparent);
    transform: translateY(-1px);
  }

  .marketplace-results-overlay .marketplace-results-modal-input:hover::before {
    animation: marketplaceResultsInputSweep 860ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .marketplace-results-overlay .marketplace-results-modal-input:focus-within {
    border-color: var(--marketplace-results-chip-active-border);
    background: color-mix(in srgb, var(--marketplace-results-input-background) 90%, var(--marketplace-results-chip-active-background));
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--marketplace-results-chip-active-border) 26%, transparent),
      0 10px 24px rgba(15, 23, 42, 0.1);
    transform: translateY(-1px);
  }

  .marketplace-results-overlay .marketplace-results-modal-input:focus-within::before {
    animation: marketplaceResultsInputSweep 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .marketplace-results-overlay .marketplace-results-modal-input input {
    width: 100%;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--marketplace-results-input-text);
    font-size: 13px;
    font-size: var(--marketplace-results-input-font-size, 13px);
    font-weight: 600;
  }

  .marketplace-results-overlay .marketplace-results-modal-input input::placeholder {
    color: var(--marketplace-results-input-text);
    opacity: 1;
  }

  .marketplace-results-overlay .marketplace-results-modal-input input:focus-visible {
    outline: none;
  }

  .marketplace-results-overlay .marketplace-results-modal-search {
    height: 46px;
    height: var(--marketplace-results-action-height, 46px);
    border-radius: 11px;
    border: 0;
    font-size: 13px;
    font-size: var(--marketplace-results-action-font-size, 13px);
    font-weight: 700;
    cursor: pointer;
    transition: background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
  }

  .marketplace-results-overlay .marketplace-results-modal-search {
    background: var(--marketplace-results-search-button-background);
    color: var(--marketplace-results-search-button-text);
  }

  .marketplace-results-overlay .marketplace-results-modal-search:hover {
    background: var(--marketplace-results-search-button-hover);
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.24);
  }

  .marketplace-results-overlay .marketplace-results-modal-search:active {
    transform: translateY(1px);
    box-shadow: none;
  }

  .marketplace-results-overlay .marketplace-results-modal-search:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .marketplace-results-overlay .marketplace-results-modal-quick-filters {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
  }

  .marketplace-results-overlay .marketplace-results-modal-quick-filters button {
    border: 1px solid var(--marketplace-results-chip-border);
    height: 34px;
    height: var(--marketplace-results-chip-height, 34px);
    border-radius: 999px;
    background: var(--marketplace-results-chip-background);
    color: var(--marketplace-results-chip-text);
    font-size: 13px;
    font-size: var(--marketplace-results-chip-font-size, 13px);
    font-weight: 600;
    padding: 0 14px;
    white-space: nowrap;
    cursor: pointer;
  }

  .marketplace-results-overlay .marketplace-results-modal-quick-filters button.is-active {
    border-color: var(--marketplace-results-chip-active-border);
    background: var(--marketplace-results-chip-active-background);
    color: var(--marketplace-results-chip-active-text);
    font-weight: 700;
  }

  .marketplace-results-overlay .marketplace-results-modal-shortcut {
    margin: 0;
    color: var(--marketplace-results-muted-text);
    font-size: 12px;
    font-size: var(--marketplace-results-shortcut-font-size, 12px);
    font-weight: 600;
  }

  .marketplace-results-overlay .marketplace-results-modal-context {
    width: 100%;
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
    scrollbar-width: thin;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-grid {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card {
    width: 100%;
    min-height: 100px;
    min-height: var(--marketplace-results-card-min-height, 100px);
    border: 1px solid var(--marketplace-results-card-border);
    border-radius: 12px;
    background: var(--marketplace-results-card-background);
    padding: 14px 16px;
    display: grid;
    gap: 8px;
    align-content: center;
    transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card:hover {
    border-color: var(--marketplace-results-chip-active-border);
    box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card.is-recent-searches {
    align-content: start;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card h3 {
    margin: 0;
    color: var(--marketplace-results-card-title);
    font-size: 14px;
    font-size: var(--marketplace-results-card-title-size, 14px);
    font-weight: 700;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card p {
    margin: 0;
    color: var(--marketplace-results-muted-text);
    font-size: 12px;
    font-size: var(--marketplace-results-card-body-size, 12px);
    font-weight: 600;
    line-height: 1.4;
    word-break: break-word;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card p.is-route-preview {
    font-family: "JetBrains Mono", monospace;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card button {
    border: 0;
    background: transparent;
    color: var(--marketplace-results-card-action);
    font-size: 12px;
    font-size: var(--marketplace-results-card-action-size, 12px);
    font-weight: 700;
    padding: 0;
    text-align: left;
    width: fit-content;
    cursor: pointer;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-clear {
    border: 1px solid var(--marketplace-results-chip-border);
    border-radius: 999px;
    padding: 2px 10px;
    background: var(--marketplace-results-chip-background);
    color: var(--marketplace-results-chip-text);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.8;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-clear:hover {
    border-color: var(--marketplace-results-chip-active-border);
    text-decoration: none;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card button:hover {
    text-decoration: underline;
  }

  .marketplace-results-overlay .marketplace-results-modal-context-card button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
    border-radius: 4px;
  }

  .marketplace-results-overlay .marketplace-results-modal-recent-searches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .marketplace-results-overlay .marketplace-results-modal-recent-searches button {
    max-width: 100%;
    border: 1px solid var(--marketplace-results-chip-border);
    border-radius: 999px;
    padding: 4px 12px;
    background: var(--marketplace-results-chip-background);
    color: var(--marketplace-results-chip-text);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .marketplace-results-overlay .marketplace-results-modal-recent-searches button:hover {
    border-color: var(--marketplace-results-chip-active-border);
    background: color-mix(in srgb, var(--marketplace-results-chip-active-background) 10%, var(--marketplace-results-chip-background));
    text-decoration: none;
  }

  .marketplace-results-overlay .marketplace-results-modal-footer {
    width: 100%;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .marketplace-results-overlay .marketplace-results-modal-footer span {
    color: var(--marketplace-results-muted-text);
    font-size: 12px;
    font-size: var(--marketplace-results-footer-font-size, 12px);
    font-weight: 600;
  }

  .marketplace-results-overlay .marketplace-results-modal-stats {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .marketplace-results-overlay .marketplace-results-modal-stats span {
    height: 28px;
    height: var(--marketplace-results-stat-height, 28px);
    border-radius: 999px;
    background: var(--marketplace-results-stats-background);
    color: var(--marketplace-results-stats-text);
    font-size: 12px;
    font-size: var(--marketplace-results-stat-font-size, 12px);
    font-weight: 600;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .marketplace-results-overlay .marketplace-results-modal-stats span.is-strong {
    background: var(--marketplace-results-stats-strong-background);
    color: var(--marketplace-results-stats-strong-text);
    font-weight: 700;
  }

  .marketplace-results-overlay .marketplace-results-modal {
    box-shadow: var(--si-shadow-overlay, 0 18px 34px rgba(0, 0, 0, 0.12));
  }

  @media (max-width: 900px) {
    .marketplace-results-overlay {
      padding: 96px 12px 12px;
    }

    .marketplace-results-overlay .marketplace-results-overlay-layout {
      height: auto;
      min-height: calc(100dvh - 108px);
      align-items: flex-start;
    }

    .marketplace-results-overlay .marketplace-results-floating-container {
      width: 100%;
      min-height: calc(100dvh - 108px);
      height: auto;
      border-radius: 12px;
      padding: 12px;
    }

    .marketplace-results-overlay .marketplace-results-modal {
      width: 100%;
      max-width: 100%;
      height: auto;
      max-height: none;
    }

    .marketplace-results-overlay .marketplace-results-modal-search-row {
      grid-template-columns: 1fr;
    }

    .marketplace-results-overlay .marketplace-results-modal-context-grid {
      grid-template-columns: 1fr;
    }

    .marketplace-results-overlay .marketplace-results-modal-footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marketplace-results-overlay {
      animation: none;
    }

    .marketplace-results-overlay .marketplace-results-modal-input {
      transition: border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
      transform: none;
    }

    .marketplace-results-overlay .marketplace-results-modal-input::before,
    .marketplace-results-overlay .marketplace-results-modal-input:hover::before,
    .marketplace-results-overlay .marketplace-results-modal-input:focus-within::before {
      animation: none;
      opacity: 0;
      transform: none;
    }
  }
`;
