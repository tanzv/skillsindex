import { css } from "@emotion/react";

export const marketplaceHomeTopbarPrimaryPopoverStyles = css`
  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-wrapper {
    position: absolute;
    top: calc(100% + 12px);
    left: auto;
    right: 0;
    z-index: 44;
    width: clamp(560px, 50vw, 760px);
    max-width: min(760px, calc(100vw - (var(--marketplace-content-gutter) * 2)));
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px) scale(0.992);
    transform-origin: top right;
    overflow: hidden;
    pointer-events: none;
    visibility: hidden;
    transition:
      max-height 280ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease,
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
      visibility 0ms linear 280ms;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-wrapper.is-expanded {
    max-height: 760px;
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
    visibility: visible;
    overflow: visible;
    transition:
      max-height 320ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease,
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button {
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 78%, #ffffff 22%);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 86%, #0d1626 14%),
        color-mix(in srgb, var(--marketplace-topbar-background) 90%, #08111d 10%)
      );
    height: 38px;
    min-width: 0;
    border-radius: 999px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 92%, #f8fafc 8%);
    cursor: pointer;
    box-shadow:
      0 12px 24px color-mix(in srgb, #020617 24%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    backdrop-filter: blur(18px) saturate(130%);
    transition:
      border-color 170ms ease,
      background-color 170ms ease,
      box-shadow 170ms ease,
      color 170ms ease,
      transform 170ms ease;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button:hover {
    border-color: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 78%, #ffffff 22%);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-nav-button-hover-background) 82%, #101a2c 18%),
        color-mix(in srgb, var(--marketplace-topbar-background) 88%, #0b1420 12%)
      );
    box-shadow:
      0 16px 28px color-mix(in srgb, #020617 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
    transform: translateY(-1px);
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
    transition: transform 220ms ease;
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

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-overflow-panel {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 18px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 94%, #ffffff 6%);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 97%, #09111d 3%) 0%,
        color-mix(in srgb, var(--marketplace-topbar-background) 98%, #050a13 2%) 100%
      );
    box-shadow:
      0 24px 60px color-mix(in srgb, #000000 40%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
    backdrop-filter: blur(16px) saturate(126%);
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-overflow-panel::before {
    content: "";
    position: absolute;
    top: -7px;
    left: auto;
    right: 18px;
    width: 14px;
    height: 14px;
    border-top: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 94%, #ffffff 6%);
    border-left: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 94%, #ffffff 6%);
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 97%, #09111d 3%);
    transform: rotate(45deg);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-header {
    display: grid;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 78%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-title {
    margin: 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 94%, #ffffff 6%);
    font-size: 14px;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-hint {
    margin: 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-subtle-text) 58%, #e2e8f0 42%);
    font-size: 12px;
    line-height: 1.45;
    text-wrap: pretty;
    max-width: 760px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-metrics {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-group {
    display: grid;
    gap: 10px;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 90%, #ffffff 10%);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 94%, #0d1626 6%) 0%,
        color-mix(in srgb, var(--marketplace-topbar-background) 95%, #0b1220 5%) 100%
      );
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent),
      0 8px 18px color-mix(in srgb, #000000 18%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-group.is-active {
    border-color: color-mix(in srgb, var(--marketplace-nav-button-active-border) 72%, #ffffff 28%);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent),
      0 10px 22px color-mix(in srgb, #000000 22%, transparent),
      0 0 0 1px color-mix(in srgb, var(--marketplace-nav-button-active-border) 18%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-group-title {
    margin: 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 88%, #f8fafc 12%);
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-family: "JetBrains Mono", monospace;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-group-count {
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

  .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-group-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;
