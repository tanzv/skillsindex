import { css } from "@emotion/react";

import { marketplaceHomeThemeCategoryTokenLightStyles } from "./MarketplaceHomePage.styles.theme.categoryTokens";
import { buildMarketplaceHomeTopbarSelector } from "./marketplaceHomeTopbarSelectors";

const marketplaceHomeLightThemeScope = ".marketplace-home.is-light-theme";

export const marketplaceHomeThemeLightStyles = css`
  .marketplace-home.is-light-theme {
    --marketplace-topbar-background-alt: #f5f5f5;
    --marketplace-topbar-border: #d4d4d4;
    --marketplace-nav-shell-background: rgba(255, 255, 255, 0.9);
    --marketplace-nav-shell-border: #d4d4d4;
    --marketplace-nav-button-border: #dcdce0;
    --marketplace-nav-button-text: #27272a;
    --marketplace-nav-button-subtle-text: #71717a;
    --marketplace-nav-button-hover-background: #efefef;
    --marketplace-nav-button-hover-border: #c9c9cf;
    --marketplace-nav-button-hover-shadow:
      0 6px 16px color-mix(in srgb, #111111 10%, transparent),
      inset 0 1px 0 #ffffff;
    --marketplace-nav-button-active-background: #111111;
    --marketplace-nav-button-active-border: #111111;
    --marketplace-nav-button-active-text: #ffffff;
    --marketplace-nav-button-active-shadow:
      0 8px 18px color-mix(in srgb, #111111 18%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 20%, transparent);
    --marketplace-nav-button-highlight-background: #e4e4e7;
    --marketplace-nav-badge-background: #111111;
    --marketplace-nav-badge-text: #ffffff;
    --marketplace-nav-category-hover-border: #d4d4d4;
    --marketplace-nav-ranking-background: #f4f4f5;
    --marketplace-nav-ranking-border: #d4d4d4;
    --marketplace-nav-ranking-text: #27272a;
    --marketplace-utility-shell-background: rgba(255, 255, 255, 0.9);
    --marketplace-utility-shell-border: #d4d4d4;
    --marketplace-utility-button-background: #ffffff;
    --marketplace-utility-button-border: #d4d4d4;
    --marketplace-utility-button-text: #27272a;
    --marketplace-utility-button-subtle-text: #71717a;
    --marketplace-utility-button-hover-background: #f5f5f5;
    --marketplace-focus-ring: #111111;
    ${marketplaceHomeThemeCategoryTokenLightStyles}
    background: var(--marketplace-home-background);
    color: var(--marketplace-home-text);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeLightThemeScope, "topbar")} {
    height: 86px;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeLightThemeScope, "utilityButton")} {
    background: var(--marketplace-utility-button-background);
    color: var(--marketplace-utility-button-text);
    border: 1px solid var(--marketplace-utility-button-border);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeLightThemeScope, "utilityButton", ".is-subtle")} {
    color: var(--marketplace-utility-button-subtle-text);
  }

  ${buildMarketplaceHomeTopbarSelector(
    marketplaceHomeLightThemeScope,
    "utilityButton",
    ":hover:not(:disabled)"
  )} {
    background: var(--marketplace-utility-button-hover-background);
  }

  .marketplace-home.is-workspace-shell {
    animation: none;
  }

  .marketplace-home.is-workspace-shell .animated-fade-down,
  .marketplace-home.is-workspace-shell .animated-fade-up {
    animation: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .marketplace-home {
      animation: none;
    }
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeLightThemeScope, "brandCopy", " strong")} {
    font-size: 16px;
    font-weight: 800;
    color: var(--marketplace-brand-title);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeLightThemeScope, "brandCopy", " small")} {
    color: var(--marketplace-brand-subtitle);
  }

  @media (prefers-reduced-motion: reduce) {
    .marketplace-home .animated-fade-down,
    .marketplace-home .animated-fade-up {
      animation: none !important;
    }

    .marketplace-home * {
      transition-duration: 0ms !important;
      animation-duration: 0ms !important;
    }
  }
`;
