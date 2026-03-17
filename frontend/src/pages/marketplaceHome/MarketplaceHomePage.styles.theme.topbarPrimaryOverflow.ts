import { css } from "@emotion/react";

import { marketplaceHomeTopbarPrimaryPopoverStyles } from "./MarketplaceHomePage.styles.theme.topbarPrimaryPopover";
import {
  buildMarketplaceHomeTopbarDescendantSelector,
  buildMarketplaceHomeTopbarSelector
} from "./marketplaceHomeTopbarSelectors";

const workspaceTopbarShellScope = ".marketplace-home .workspace-topbar-shell";
const workspaceTopbarPrimaryGroupsScope = `${workspaceTopbarShellScope} .workspace-topbar-primary-groups`;
const workspaceTopbarOverflowGroupActionsScope = `${workspaceTopbarShellScope} .workspace-topbar-overflow-group-actions`;
const workspaceTopbarOverflowMetricsScope = `${workspaceTopbarShellScope} .workspace-topbar-overflow-metrics`;

export const marketplaceHomeTopbarPrimaryOverflowStyles = css`
  .marketplace-home .workspace-topbar-interaction-scope {
    width: 100%;
    position: relative;
    z-index: 12;
  }

  .marketplace-home .workspace-topbar-shell {
    --workspace-topbar-primary-shell-width: 820px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    z-index: 6;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-groups-shell {
    width: min(var(--workspace-topbar-primary-shell-width), max(520px, calc(100vw - 520px)));
    max-width: min(100%, var(--workspace-topbar-primary-shell-width));
    flex: 0 1 var(--workspace-topbar-primary-shell-width);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-shell-border) 82%, #ffffff 18%);
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 70%, transparent);
    box-shadow:
      0 8px 20px color-mix(in srgb, #000000 16%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    padding: 6px 8px;
    overflow: hidden;
    white-space: nowrap;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-groups {
    flex: 1 1 auto;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 0;
    overflow: hidden;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-group {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 2px 3px;
    border: 0;
    background: transparent;
    position: relative;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-group + .workspace-topbar-primary-group {
    margin-left: 6px;
    padding-left: 10px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-group + .workspace-topbar-primary-group::before {
    content: "";
    position: absolute;
    left: 0;
    top: 7px;
    bottom: 7px;
    width: 1px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--marketplace-nav-shell-border) 78%, transparent);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    margin-left: 0;
    padding-left: 0;
    position: relative;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-group-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 2px 0 0;
    color: color-mix(in srgb, var(--marketplace-nav-button-subtle-text) 60%, #f8fafc 40%);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex: 0 0 auto;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-group-label::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--marketplace-nav-button-subtle-text) 54%, #f8fafc 46%);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--marketplace-nav-shell-border) 28%, transparent);
  }

  ${marketplaceHomeTopbarPrimaryPopoverStyles}

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton")} {
    position: relative;
    border: 1px solid color-mix(in srgb, var(--marketplace-nav-button-border) 90%, #ffffff 10%);
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 88%, #101a2b 12%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    border-radius: 10px;
    min-height: 34px;
    padding-inline: 12px;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 92%, #f8fafc 8%);
    transition:
      border-color 170ms ease,
      background-color 170ms ease,
      box-shadow 170ms ease,
      color 170ms ease;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton")},
  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-icon-button {
    min-height: 34px;
    border-radius: 10px;
    padding-inline: 12px;
    border-color: transparent;
    background: transparent;
    box-shadow: none;
    font-size: 12px;
    font-weight: 600;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 76%, #ffffff 24%);
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-icon-button {
    border: 1px solid transparent;
    background: transparent;
    box-shadow: none;
    padding-inline: 12px;
    min-width: 0;
    height: 34px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-button-content {
    gap: 6px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-glyph-shell {
    width: 18px;
    height: 18px;
    background: transparent;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-panel-icon {
    font-size: 11px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: color-mix(in srgb, var(--marketplace-nav-shell-border) 34%, transparent);
    box-shadow: none;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-badge-count {
    font-size: 9px;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-icon-button:hover {
    border-color: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 82%, #ffffff 18%);
    background: color-mix(in srgb, var(--marketplace-nav-button-hover-background) 88%, #122037 12%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
    transform: none;
  }

  .marketplace-home .workspace-topbar-shell .workspace-topbar-primary-inline-toggle .workspace-topbar-toggle-icon-button.is-expanded {
    background: color-mix(in srgb, var(--marketplace-nav-button-active-background) 16%, #0f1726 84%);
    border-color: color-mix(in srgb, var(--marketplace-nav-button-active-border) 68%, #ffffff 32%);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 96%, #ffffff 4%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  ${buildMarketplaceHomeTopbarDescendantSelector(workspaceTopbarPrimaryGroupsScope, "navButton", "actionBadge")} {
    min-width: 20px;
    height: 18px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--si-color-accent) 14%, transparent);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 88%, #ffffff 12%);
  }

  ${buildMarketplaceHomeTopbarDescendantSelector(workspaceTopbarPrimaryGroupsScope, "navButton", "actionLabel")} {
    letter-spacing: 0.01em;
    position: relative;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", "::after")} {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 6px;
    height: 2px;
    border-radius: 999px;
    background: transparent;
    opacity: 0;
    transition: background-color 170ms ease, opacity 170ms ease;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarOverflowGroupActionsScope, "navButton")} {
    width: 100%;
    justify-content: flex-start;
    min-height: 40px;
    padding: 0 34px 0 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 94%, #08111f 6%);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarOverflowGroupActionsScope, "navButton", "::after")} {
    content: "";
    position: absolute;
    right: 14px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-top: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
    transform: translateY(-50%) rotate(45deg);
    opacity: 0.55;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarOverflowMetricsScope, "navButton")} {
    min-height: 28px;
    padding-inline: 10px;
    border-radius: 999px;
    font-size: 11px;
    pointer-events: none;
    background: color-mix(in srgb, var(--marketplace-topbar-background-alt) 92%, #101826 8%);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ":not(.is-active):not(:disabled):hover")} {
    transform: none;
    background: color-mix(in srgb, var(--marketplace-nav-button-hover-background) 88%, #122037 12%);
    border-color: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 82%, #ffffff 18%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-active")} {
    background: color-mix(in srgb, var(--marketplace-nav-button-active-background) 16%, #0f1726 84%);
    border-color: color-mix(in srgb, var(--marketplace-nav-button-active-border) 68%, #ffffff 32%);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 96%, #ffffff 4%);
    font-weight: 700;
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }

  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ":not(.is-active):not(:disabled):hover"
  )} {
    background: color-mix(in srgb, var(--marketplace-nav-shell-border) 28%, transparent);
    border-color: color-mix(in srgb, var(--marketplace-nav-shell-border) 18%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 6%, transparent);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 88%, #ffffff 12%);
  }

  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ":not(.is-active):not(:disabled):hover::after"
  )} {
    background: color-mix(in srgb, var(--marketplace-nav-category-hover-border) 56%, transparent);
    opacity: 0.6;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", ".is-active")} {
    background: color-mix(in srgb, var(--si-color-accent) 12%, transparent);
    border-color: color-mix(in srgb, var(--si-color-accent) 18%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 98%, #ffffff 2%);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", ".is-active::after")} {
    background: color-mix(in srgb, var(--marketplace-nav-button-active-border) 74%, #ffffff 26%);
    opacity: 1;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-highlight")},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-open-dashboard-action")} {
    border-color: transparent;
    background: color-mix(in srgb, var(--si-color-accent) 10%, transparent);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 92%, #ffffff 8%);
  }

  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarShellScope,
    "navButton",
    ".is-highlight:not(.is-active):not(:disabled):hover"
  )},
  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarShellScope,
    "navButton",
    ".is-open-dashboard-action:not(.is-active):not(:disabled):hover"
  )} {
    background: color-mix(in srgb, var(--si-color-accent) 16%, transparent);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", ".is-marketplace-entry-action")},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", ".is-open-dashboard-action")},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", ".is-highlight")} {
    background: transparent;
    border-color: transparent;
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 76%, #ffffff 24%);
  }

  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ".is-marketplace-entry-action:not(.is-active):not(:disabled):hover"
  )},
  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ".is-open-dashboard-action:not(.is-active):not(:disabled):hover"
  )},
  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ".is-highlight:not(.is-active):not(:disabled):hover"
  )} {
    background: color-mix(in srgb, var(--marketplace-nav-shell-border) 28%, transparent);
    border-color: color-mix(in srgb, var(--marketplace-nav-shell-border) 18%, transparent);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 88%, #ffffff 12%);
  }

  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ".is-marketplace-entry-action.is-active"
  )},
  ${buildMarketplaceHomeTopbarSelector(
    workspaceTopbarPrimaryGroupsScope,
    "navButton",
    ".is-open-dashboard-action.is-active"
  )},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarPrimaryGroupsScope, "navButton", ".is-highlight.is-active")} {
    background: color-mix(in srgb, var(--si-color-accent) 12%, transparent);
    border-color: color-mix(in srgb, var(--si-color-accent) 18%, transparent);
    color: color-mix(in srgb, var(--marketplace-nav-button-text) 98%, #ffffff 2%);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-top-action")} {
    letter-spacing: 0.02em;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-primary-nav-toggle")},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-label")} {
    color: var(--marketplace-nav-button-subtle-text);
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-title")},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-group-label")},
  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-metric")} {
    font-family: "JetBrains Mono", monospace;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-title")} {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-hint")} {
    max-width: 440px;
    text-wrap: pretty;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    line-height: 1.3;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-group-label")} {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 11px;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-menu-metric")} {
    font-size: 11px;
  }

  ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton", ".is-alert-metric")} {
    background: color-mix(in srgb, var(--si-color-accent) 16%, var(--marketplace-topbar-background-alt));
  }

  @media (prefers-reduced-motion: reduce) {
    .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-wrapper,
    .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-wrapper.is-expanded,
    .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon-button,
    .marketplace-home .workspace-topbar-shell .workspace-topbar-toggle-icon,
    ${buildMarketplaceHomeTopbarSelector(workspaceTopbarShellScope, "navButton")} {
      transition: none;
    }

    .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-wrapper,
    .marketplace-home .workspace-topbar-shell .workspace-topbar-overflow-wrapper.is-expanded {
      transform: none;
    }
  }
`;
