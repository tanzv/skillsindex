import { css } from "@emotion/react";

export const marketplaceHomeTopbarPrimaryPopoverStyles = css`
  .marketplace-home .workspace-topbar-interaction-scope {
    --workspace-topbar-overflow-panel-width: min(1120px, calc(100vw - 48px));
    overflow: visible;
    isolation: isolate;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-wrapper {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    width: var(--workspace-topbar-overflow-panel-width);
    max-width: calc(100vw - 32px);
    max-height: min(72vh, 760px);
    opacity: 0;
    transform: translateX(-50%) translateY(-6px);
    transform-origin: top center;
    overflow: visible;
    pointer-events: none;
    visibility: hidden;
    z-index: 18;
    will-change: opacity, transform;
    transition:
      opacity 180ms ease,
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
      visibility 0ms linear 180ms;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-wrapper.is-expanded {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
    visibility: visible;
    transition:
      opacity 180ms ease,
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button {
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 82%, #ffffff 18%);
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 88%, #0d1626 12%);
    height: 36px;
    min-width: 0;
    border-radius: 12px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 92%, #f8fafc 8%);
    cursor: pointer;
    box-shadow:
      0 8px 18px color-mix(in srgb, #020617 18%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transition:
      border-color 160ms ease,
      background-color 160ms ease,
      box-shadow 160ms ease,
      color 160ms ease;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button:hover {
    border-color: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 78%, #ffffff 22%);
    background: color-mix(in srgb, var(--marketplace-nav-button-hover-background) 82%, #101a2c 18%);
    box-shadow:
      0 10px 20px color-mix(in srgb, #020617 20%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button.is-expanded {
    border-color: color-mix(in srgb, var(--si-color-accent) 36%, #ffffff 14%);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--si-color-accent) 12%, var(--marketplace-nav-button-hover-background) 88%),
        color-mix(in srgb, var(--marketplace-topbar-background) 86%, #0b1420 14%)
      );
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 96%, #ffffff 4%);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button:focus-visible {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 1px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-button-content {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-glyph-shell {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--marketplace-nav-shell-border) 28%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-panel-icon {
    font-size: 12px;
    line-height: 1;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon {
    display: inline-flex;
    line-height: 1;
    font-size: 10px;
    opacity: 0.92;
    transition: transform 180ms ease;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button.is-expanded .workspace-topbar-toggle-icon {
    transform: rotate(180deg);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-badge {
    min-width: 20px;
    height: 20px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    background: color-mix(in srgb, var(--si-color-accent) 16%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-badge-count {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 96%, #ffffff 4%);
  }

  .marketplace-home .workspace-topbar-interaction-scope .marketplace-topbar-overflow-panel {
    position: relative;
    width: 100%;
    max-height: min(72vh, 760px);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 88%, #ffffff 12%);
    background: color-mix(in srgb, var(--marketplace-topbar-background) 95%, #050a13 5%);
    box-shadow:
      0 24px 56px color-mix(in srgb, #000000 34%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    will-change: opacity, transform;
    transform: translateZ(0);
  }

  .marketplace-home .workspace-topbar-interaction-scope .marketplace-topbar-overflow-panel::before {
    display: none;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-header {
    display: grid;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 72%, transparent);
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-title {
    margin: 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 90%, #ffffff 10%);
    font-size: 12px;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-hint {
    margin: 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-subtle-text) 58%, #e2e8f0 42%);
    font-size: 12px;
    line-height: 1.45;
    text-wrap: pretty;
    max-width: 760px;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-metrics {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-group {
    display: grid;
    gap: 8px;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 84%, #ffffff 16%);
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 90%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 6%, transparent);
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-group.is-active {
    border-color: color-mix(in srgb, var(--marketplace-nav-button-active-border) 64%, #ffffff 36%);
    background: color-mix(in srgb, var(--marketplace-nav-button-hover-background) 70%, transparent);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent),
      0 0 0 1px color-mix(in srgb, var(--marketplace-nav-button-active-border) 16%, transparent);
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-group-title {
    margin: 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 88%, #f8fafc 12%);
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-family: "JetBrains Mono", monospace;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-group-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 78%, #ffffff 22%);
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 82%, #0f1726 18%);
    color: color-mix(in srgb, var(--marketplace-nav-button-subtle-text) 74%, #f8fafc 26%);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .marketplace-home .workspace-topbar-interaction-scope .workspace-topbar-overflow-group-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;
