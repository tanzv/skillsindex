import { css } from "@emotion/react";

export const marketplaceHomeTopbarNavigationStyles = css`
  .marketplace-home .marketplace-topbar-light-nav {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: min(100%, 820px);
    overflow-x: auto;
    scrollbar-width: none;
    padding: 5px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 92%, #000000 8%);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 84%, #0f172a) 0%,
        color-mix(in srgb, var(--marketplace-topbar-background) 90%, #0b1220) 100%
      );
    box-shadow:
      0 10px 20px color-mix(in srgb, #000000 18%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
  }

  .marketplace-home .marketplace-topbar-light-nav::-webkit-scrollbar {
    display: none;
  }

  .marketplace-home .marketplace-topbar-nav-button {
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-button-border) 90%, #ffffff 10%);
    height: 32px;
    border-radius: 9px;
    padding: 0 11px;
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 86%, #0f172a 14%);
    color: var(--marketplace-nav-button-text);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    transition: background-color 180ms ease, border-color 180ms ease, box-shadow 220ms ease, color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .marketplace-topbar-nav-button .marketplace-topbar-action-label {
    white-space: nowrap;
  }

  .marketplace-home .marketplace-topbar-nav-button .marketplace-topbar-action-badge {
    min-width: 22px;
    height: 16px;
    border-radius: 999px;
    padding: 0 6px;
    background: var(--marketplace-nav-badge-background);
    color: var(--marketplace-nav-badge-text);
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .marketplace-home .marketplace-topbar-nav-button.is-subtle {
    color: var(--marketplace-nav-button-subtle-text);
  }

  .marketplace-home .marketplace-topbar-nav-button.is-highlight {
    background: color-mix(in srgb, var(--marketplace-nav-button-highlight-background) 86%, #0ea5e9 14%);
    border-color: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 84%, #ffffff 16%);
  }

  .marketplace-home .marketplace-topbar-nav-button.is-category-action {
    border-color: color-mix(in srgb, var(--si-color-accent, #7dd3fc) 28%, var(--marketplace-nav-shell-border));
    background: color-mix(in srgb, var(--si-color-accent, #7dd3fc) 12%, var(--marketplace-topbar-background-alt));
  }

  .marketplace-home .marketplace-topbar-nav-button.is-category-action:not(.is-active):not(:disabled):hover {
    border-color: color-mix(in srgb, var(--si-color-accent, #7dd3fc) 48%, var(--marketplace-nav-category-hover-border));
    background: color-mix(in srgb, var(--si-color-accent, #7dd3fc) 20%, var(--marketplace-nav-button-hover-background));
  }

  .marketplace-home .marketplace-topbar-nav-button.is-download-ranking-action {
    background: color-mix(in srgb, var(--marketplace-nav-ranking-background) 84%, #0f172a 16%);
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-ranking-border) 88%, #ffffff 12%);
    color: var(--marketplace-nav-ranking-text);
  }

  .marketplace-home .marketplace-topbar-nav-button.is-download-ranking-action:not(.is-active):not(:disabled):hover {
    background: var(--marketplace-nav-button-hover-background);
    border-color: var(--marketplace-nav-category-hover-border);
  }
`;
