import { css } from "@emotion/react";

import { buildMarketplaceHomeTopbarSelector } from "./marketplaceHomeTopbarSelectors";

export const marketplaceHomeWorkspaceUserControlStyles = css`
  ${buildMarketplaceHomeTopbarSelector(".marketplace-home", "leftAccessory")} {
    min-width: 0;
    display: inline-flex;
    align-items: center;
  }

  .marketplace-home .workspace-topbar-user-trigger {
    border: 1px solid color-mix(in srgb, var(--marketplace-utility-button-border) 82%, #ffffff 18%);
    border-radius: 999px;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-utility-button-background) 88%, #152033 12%),
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 84%, #09101b 16%)
      );
    color: var(--marketplace-utility-button-text);
    min-height: 40px;
    padding: 4px 10px 4px 4px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    box-shadow:
      0 10px 24px color-mix(in srgb, #020617 24%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease,
      color 160ms ease;
  }

  .marketplace-home .workspace-topbar-user-trigger:hover {
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--marketplace-utility-button-hover-background) 86%, #18263b 14%),
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 82%, #0d1521 18%)
      );
    border-color: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 80%, #ffffff 20%);
    box-shadow:
      0 14px 28px color-mix(in srgb, #020617 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  .marketplace-home .workspace-topbar-user-trigger.is-open {
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--si-color-accent) 12%, var(--marketplace-utility-button-hover-background) 88%),
        color-mix(in srgb, var(--marketplace-topbar-background-alt) 78%, #0d1521 22%)
      );
    border-color: color-mix(in srgb, var(--si-color-accent) 38%, #ffffff 12%);
    box-shadow:
      0 16px 30px color-mix(in srgb, #020617 32%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  .marketplace-home .workspace-topbar-avatar {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top left, color-mix(in srgb, var(--si-color-accent) 88%, #ffffff 12%), transparent 68%),
      linear-gradient(145deg, color-mix(in srgb, var(--si-color-accent) 76%, transparent), color-mix(in srgb, #2563eb 62%, transparent));
    color: var(--si-color-accent-contrast);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 12%, transparent);
  }

  .marketplace-home .workspace-topbar-avatar.is-panel-avatar {
    width: 42px;
    height: 42px;
    font-size: 12px;
  }

  .marketplace-home .workspace-topbar-user-meta {
    min-width: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
  }

  .marketplace-home .workspace-topbar-user-meta strong {
    max-width: 132px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--marketplace-brand-title);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 700;
  }

  .marketplace-home .workspace-topbar-user-meta small {
    max-width: 132px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--marketplace-brand-subtitle);
    font-size: 9px;
    line-height: 1.1;
    font-weight: 600;
  }

  .marketplace-home .workspace-topbar-user-icon {
    color: var(--marketplace-nav-button-subtle-text);
    font-size: 10px;
    line-height: 1;
    transition: transform 180ms ease, color 180ms ease;
  }

  .marketplace-home .workspace-topbar-user-trigger.is-open .workspace-topbar-user-icon {
    color: var(--marketplace-brand-title);
    transform: rotate(180deg);
  }

  .workspace-topbar-user-dropdown {
    min-width: 340px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-panel {
    width: min(340px, calc(100vw - 28px));
    display: grid;
    gap: 14px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--si-color-border) 62%, transparent);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--si-color-panel) 94%, #09111d 6%),
        color-mix(in srgb, var(--marketplace-topbar-background) 96%, #030712 4%)
      );
    box-shadow:
      0 22px 48px color-mix(in srgb, #020617 40%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    will-change: opacity, transform;
    transform: translateZ(0);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--si-color-border) 48%, transparent);
    background: color-mix(in srgb, var(--si-color-surface) 64%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-panel-meta {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-panel-meta strong {
    color: var(--si-color-text-primary);
    font-size: 0.95rem;
    line-height: 1.15;
    font-weight: 700;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-panel-meta small {
    color: var(--si-color-text-secondary);
    font-size: 0.74rem;
    line-height: 1.25;
    font-weight: 600;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-panel-sections {
    display: grid;
    gap: 12px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-section {
    display: grid;
    gap: 8px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-section-label {
    margin: 0;
    color: var(--si-color-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 0.64rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-section-body {
    display: grid;
    gap: 8px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-inline-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 10px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-group {
    min-width: 0;
    display: grid;
    align-content: start;
    gap: 6px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-label {
    color: var(--si-color-text-secondary);
    font-size: 0.7rem;
    line-height: 1.2;
    font-weight: 600;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-options {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    padding: 4px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--si-color-border) 54%, transparent);
    background: color-mix(in srgb, var(--si-color-surface) 66%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-option {
    flex: 1 1 0;
    min-width: 0;
    min-height: 30px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--si-color-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 10px;
    font-size: 0.74rem;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-option:hover:not(:disabled) {
    background: color-mix(in srgb, var(--si-color-accent) 10%, transparent);
    color: var(--si-color-text-primary);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-option.is-active {
    background: color-mix(in srgb, var(--si-color-accent) 18%, transparent);
    color: var(--si-color-accent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-option:disabled,
  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-option.is-disabled {
    cursor: default;
    opacity: 0.54;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-segmented-option-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action {
    width: 100%;
    min-height: 46px;
    border: 1px solid color-mix(in srgb, var(--si-color-border) 56%, transparent);
    border-radius: 14px;
    background: color-mix(in srgb, var(--si-color-surface) 64%, transparent);
    color: var(--si-color-text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    cursor: pointer;
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    transition:
      border-color 160ms ease,
      background-color 160ms ease,
      color 160ms ease,
      transform 160ms ease;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--si-color-accent) 32%, transparent);
    background: color-mix(in srgb, var(--si-color-accent) 10%, transparent);
    transform: translateY(-1px);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action.is-danger {
    background: color-mix(in srgb, #ef4444 8%, var(--si-color-surface) 92%);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action.is-danger:hover:not(:disabled) {
    border-color: color-mix(in srgb, #ef4444 36%, transparent);
    background: color-mix(in srgb, #ef4444 12%, var(--si-color-surface) 88%);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action:disabled,
  .workspace-topbar-user-dropdown .workspace-topbar-user-action.is-disabled {
    cursor: default;
    opacity: 0.58;
    transform: none;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action-leading {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action-icon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--si-color-accent) 12%, transparent);
    font-size: 13px;
    line-height: 1;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
    text-align: left;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action-copy strong {
    color: inherit;
    font-size: 0.8rem;
    line-height: 1.2;
    font-weight: 700;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action-copy small {
    color: var(--si-color-text-secondary);
    font-size: 0.68rem;
    line-height: 1.3;
    font-weight: 600;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-action-arrow {
    color: color-mix(in srgb, var(--si-color-text-secondary) 84%, #ffffff 16%);
    font-size: 11px;
    line-height: 1;
  }
`;
