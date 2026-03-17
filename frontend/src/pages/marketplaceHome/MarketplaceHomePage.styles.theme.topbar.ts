import { css } from "@emotion/react";

import { marketplaceHomeTopbarNavigationStyles } from "./MarketplaceHomePage.styles.theme.topbarNavigation";
import { marketplaceHomeTopbarPrimaryOverflowStyles } from "./MarketplaceHomePage.styles.theme.topbarPrimaryOverflow";
import { marketplaceHomeWorkspaceSearchTriggerStyles } from "./MarketplaceHomePage.styles.theme.workspaceSearchTrigger";
import { marketplaceHomeWorkspaceUserControlStyles } from "./MarketplaceHomePage.styles.theme.workspaceUserControls";
import { buildMarketplaceHomeTopbarDescendantSelector, buildMarketplaceHomeTopbarSelector } from "./marketplaceHomeTopbarSelectors";

const marketplaceHomeScope = ".marketplace-home";

export const marketplaceHomeThemeTopbarStyles = css`
  ${marketplaceHomeWorkspaceUserControlStyles}

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brandDot")} {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: var(--marketplace-brand-dot-background);
    color: var(--marketplace-brand-dot-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    transition: background-color 180ms ease;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brandCopy")} {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brandCopy", " strong")} {
    font-size: 26px;
    line-height: 1;
    font-weight: 700;
    color: var(--marketplace-brand-title);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brandCopy", " small")} {
    font-size: 11px;
    color: var(--marketplace-brand-subtitle);
    font-weight: 600;
    line-height: 1;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "actions")} {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  ${marketplaceHomeTopbarNavigationStyles}

  ${marketplaceHomeTopbarPrimaryOverflowStyles}

  ${marketplaceHomeWorkspaceSearchTriggerStyles}

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "navButton", ".is-active")} {
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, #ffffff 92%, var(--marketplace-nav-button-active-background)) 0%,
        var(--marketplace-nav-button-active-background) 100%
      );
    color: var(--marketplace-nav-button-active-text);
    border-color: var(--marketplace-nav-button-active-border);
    box-shadow: var(--marketplace-nav-button-active-shadow);
    font-weight: 700;
    cursor: default;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "navButton", ":disabled")} {
    opacity: 0.62;
    cursor: not-allowed;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "navButton", ":not(.is-active):not(:disabled):hover")} {
    background: var(--marketplace-nav-button-hover-background);
    border-color: var(--marketplace-nav-button-hover-border);
    box-shadow: var(--marketplace-nav-button-hover-shadow);
    transform: translateY(-1px);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "lightUtility")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 11px;
    border: 1px solid var(--marketplace-utility-shell-border);
    background: var(--marketplace-utility-shell-background);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "utilityButton")} {
    border: 1px solid var(--marketplace-utility-button-border);
    height: 30px;
    border-radius: 8px;
    padding: 0 10px;
    background: var(--marketplace-utility-button-background);
    color: var(--marketplace-utility-button-text);
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  ${buildMarketplaceHomeTopbarDescendantSelector(marketplaceHomeScope, "utilityButton", "actionLabel")} {
    white-space: nowrap;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "utilityButton", ".is-subtle")} {
    color: var(--marketplace-utility-button-subtle-text);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "utilityButton", ":hover:not(:disabled)")} {
    background: var(--marketplace-utility-button-hover-background);
    transform: translateY(-1px);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "utilityButton", ":disabled")} {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${[
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "status"),
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "secondaryCta"),
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "cta")
  ].join(",\n")} {
    min-height: 32px;
    border: 0;
    border-radius: 9px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 1;
    white-space: nowrap;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "status")} {
    background: var(--marketplace-status-background);
    color: var(--marketplace-status-text);
    font-weight: 600;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "secondaryCta")} {
    border: 1px solid var(--marketplace-utility-button-border);
    background: var(--marketplace-utility-button-background);
    color: var(--marketplace-utility-button-text);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "cta")} {
    background: var(--marketplace-cta-background);
    color: var(--marketplace-cta-text);
    font-weight: 700;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brand", ":hover")} {
    opacity: 0.92;
  }

  ${buildMarketplaceHomeTopbarDescendantSelector(marketplaceHomeScope, "brand", "brandDot", { parentSuffix: ":hover" })} {
    background: #343438;
  }

  .marketplace-home .marketplace-topbar-locale-switch {
    height: 30px;
    border-radius: 9px;
    background: var(--marketplace-locale-shell-background);
    padding: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .marketplace-home .marketplace-topbar-theme-switch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 2px;
    padding-right: 6px;
    border-right: 1px solid var(--marketplace-theme-switch-divider);
  }

  .marketplace-home .marketplace-topbar-locale-switch button {
    border: 0;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    padding: 0;
    background: var(--marketplace-locale-button-background);
    color: var(--marketplace-locale-button-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease;
  }

  .marketplace-home .marketplace-topbar-locale-switch button.is-active,
  .marketplace-home .marketplace-topbar-locale-switch button:disabled {
    background: var(--marketplace-locale-button-active-background);
    color: var(--marketplace-locale-button-active-text);
    cursor: default;
  }

  .marketplace-home .marketplace-topbar-locale-switch button:not(:disabled):hover {
    background: var(--marketplace-locale-button-hover-background);
    color: var(--marketplace-locale-button-hover-text);
  }

  .marketplace-home .marketplace-topbar-locale-switch .is-icon-toggle .anticon {
    font-size: 12px;
    line-height: 1;
  }

  .marketplace-home .marketplace-topbar-locale-switch .is-theme-toggle {
    background: var(--marketplace-theme-toggle-background);
    color: var(--marketplace-theme-toggle-text);
  }

  .marketplace-home .marketplace-topbar-locale-switch .is-theme-toggle.is-active,
  .marketplace-home .marketplace-topbar-locale-switch .is-theme-toggle:disabled {
    background: var(--marketplace-theme-toggle-active-background);
    color: var(--marketplace-theme-toggle-active-text);
  }

  .marketplace-home .marketplace-topbar-locale-switch .is-theme-toggle:not(:disabled):hover {
    background: var(--marketplace-theme-toggle-hover-background);
    color: var(--marketplace-theme-toggle-hover-text);
  }

  ${[
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brand", ":focus-visible"),
    ".marketplace-home .workspace-topbar-user-trigger:focus-visible",
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "secondaryCta", ":focus-visible"),
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "cta", ":focus-visible")
  ].join(",\n")} {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "secondaryCta", ":hover")} {
    background: var(--marketplace-utility-button-hover-background);
    color: var(--marketplace-utility-button-text);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "secondaryCta", ":active")} {
    transform: translateY(1px);
  }

  ${[
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "navButton", ":focus-visible"),
    buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "utilityButton", ":focus-visible")
  ].join(",\n")} {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 1px;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "cta", ":hover")} {
    background: var(--marketplace-cta-hover-background);
    color: #f1f1f1;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "cta", ":active")} {
    transform: translateY(1px);
  }

  .marketplace-home .marketplace-topbar-locale-switch button:focus-visible {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 1px;
  }
`;
