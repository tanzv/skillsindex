import { css } from "@emotion/react";
import { buildShellLayoutContract, shellLayoutContractVars } from "../prototype/pageShellLayoutContract";
import { marketplaceHomeThemeCategoryTokenStyles } from "./MarketplaceHomePage.styles.theme.categoryTokens";
import { marketplaceHomeThemeLightStyles } from "./MarketplaceHomePage.styles.theme.light";
import { marketplaceHomeThemeTopbarStyles } from "./MarketplaceHomePage.styles.theme.topbar";
import { buildMarketplaceHomeTopbarSelector } from "./marketplaceHomeTopbarSelectors";

const marketplaceHomeScope = ".marketplace-home";

export const marketplaceHomeThemeStyles = css`
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap");

  @keyframes marketplaceFadeDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
      filter: blur(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  @keyframes marketplaceFadeUp {
    from {
      opacity: 0;
      transform: translateY(10px);
      filter: blur(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  @keyframes marketplaceHomePageEnter {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .si-layout-shell-surface {
    margin: 0;
    overflow-x: hidden;
    overflow-y: visible;
    background: #101010;
  }

  .si-layout-shell-surface.si-layout-shell-stage-light {
    background: #eef1f5;
  }

  .marketplace-home {
    --marketplace-home-background: var(--si-color-canvas, #101010);
    --marketplace-home-text: var(--si-color-text-primary, #f1f1f1);
    --marketplace-topbar-background: var(--si-color-surface, #171717);
    --marketplace-topbar-background-alt: #12151b;
    --marketplace-topbar-border: rgba(148, 163, 184, 0.2);
    --marketplace-brand-dot-background: var(--si-color-muted-surface, #2a2a2a);
    --marketplace-brand-dot-text: var(--si-color-text-primary, #e5e5e5);
    --marketplace-brand-title: var(--si-color-text-primary, #f1f1f1);
    --marketplace-brand-subtitle: #b3b3b3;
    --marketplace-brand-subtitle: var(--si-color-text-secondary, #b3b3b3);
    --marketplace-status-background: var(--si-color-muted-surface, #2a2a2a);
    --marketplace-status-text: #d4d4d4;
    --marketplace-status-text: var(--si-color-text-secondary, #d4d4d4);
    --marketplace-cta-background: var(--si-color-panel, #111111);
    --marketplace-cta-text: var(--si-color-text-primary, #e5e5e5);
    --marketplace-cta-hover-background: var(--si-color-surface-alt, #1c1d22);
    --marketplace-locale-shell-background: var(--si-color-surface, #1f1f1f);
    --marketplace-locale-button-background: var(--si-color-muted-surface, #2a2a2a);
    --marketplace-locale-button-text: var(--si-color-text-secondary, #d4d4d4);
    --marketplace-locale-button-active-background: var(--si-color-panel, #2d2d2d);
    --marketplace-locale-button-active-text: var(--si-color-text-primary, #d4d4d4);
    --marketplace-locale-button-hover-background: var(--si-color-surface-alt, #343438);
    --marketplace-locale-button-hover-text: var(--si-color-text-primary, #f1f1f1);
    --marketplace-theme-switch-divider: var(--si-color-border-soft, rgba(255, 255, 255, 0.1));
    --marketplace-theme-toggle-background: var(--si-color-muted-surface, #262626);
    --marketplace-theme-toggle-text: var(--si-color-text-secondary, #d4d4d4);
    --marketplace-theme-toggle-active-background: var(--si-color-accent, #d6d6d6);
    --marketplace-theme-toggle-active-text: var(--si-color-accent-contrast, #111111);
    --marketplace-theme-toggle-hover-background: var(--si-color-surface-alt, #343438);
    --marketplace-theme-toggle-hover-text: var(--si-color-text-primary, #f1f1f1);
    --marketplace-content-gutter: clamp(16px, 2.2vw, 28px);
    ${buildShellLayoutContract({
      inlineGap: "1rem",
      topbarMaxWidth: "calc(100% - (var(--marketplace-content-gutter) * 2))",
      contentMaxWidth: "1412px"
    })}
    --marketplace-nav-shell-background: rgba(255, 255, 255, 0.04);
    --marketplace-nav-shell-border: rgba(255, 255, 255, 0.06);
    --marketplace-nav-button-border: color-mix(in srgb, var(--marketplace-nav-shell-border) 88%, transparent);
    --marketplace-nav-button-text: #e4e4e7;
    --marketplace-nav-button-subtle-text: #a1a1aa;
    --marketplace-nav-button-hover-background: rgba(255, 255, 255, 0.09);
    --marketplace-nav-button-hover-border: rgba(255, 255, 255, 0.22);
    --marketplace-nav-button-hover-shadow:
      0 7px 18px color-mix(in srgb, #000000 24%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 14%, transparent);
    --marketplace-nav-button-active-background: #f5f5f5;
    --marketplace-nav-button-active-border: rgba(255, 255, 255, 0.16);
    --marketplace-nav-button-active-text: #101010;
    --marketplace-nav-button-active-shadow:
      0 10px 24px color-mix(in srgb, #000000 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 36%, transparent);
    --marketplace-nav-button-highlight-background: rgba(255, 255, 255, 0.14);
    --marketplace-nav-badge-background: rgba(255, 255, 255, 0.16);
    --marketplace-nav-badge-text: #fafafa;
    --marketplace-nav-category-hover-border: rgba(255, 255, 255, 0.18);
    --marketplace-nav-ranking-background: rgba(255, 255, 255, 0.08);
    --marketplace-nav-ranking-border: rgba(255, 255, 255, 0.15);
    --marketplace-nav-ranking-text: #f4f4f5;
    --marketplace-utility-shell-background: rgba(255, 255, 255, 0.04);
    --marketplace-utility-shell-border: rgba(255, 255, 255, 0.08);
    --marketplace-utility-button-background: transparent;
    --marketplace-utility-button-border: rgba(255, 255, 255, 0.12);
    --marketplace-utility-button-text: #e5e7eb;
    --marketplace-utility-button-subtle-text: #a1a1aa;
    --marketplace-utility-button-hover-background: rgba(255, 255, 255, 0.1);
    --marketplace-focus-ring: #f4f4f5;
    ${marketplaceHomeThemeCategoryTokenStyles}

    width: 100%;
    max-width: none;
    min-height: 100dvh;
    height: auto;
    margin: 0 auto;
    padding: 0 0 12px;
    background: var(--marketplace-home-background);
    color: var(--marketplace-home-text);
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    transform-origin: top left;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: marketplaceHomePageEnter 320ms ease-out both;
  }

  .marketplace-home * {
    box-sizing: border-box;
  }

  .marketplace-home button {
    font: inherit;
  }

  .marketplace-home .animated-fade-down {
    animation: marketplaceFadeDown 460ms ease-out both;
  }

  .marketplace-home .animated-fade-up {
    animation: marketplaceFadeUp 520ms ease-out both;
  }

  .marketplace-home .delay-1 {
    animation-delay: 80ms;
  }

  .marketplace-home .delay-2 {
    animation-delay: 160ms;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "shell")} {
    width: 100%;
    border-bottom: 1px solid var(--marketplace-topbar-border);
    background: linear-gradient(180deg, var(--marketplace-topbar-background) 0%, var(--marketplace-topbar-background-alt) 100%);
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "topbar")} {
    width: var(${shellLayoutContractVars.topbarWidth});
    min-width: 0;
    height: 84px;
    margin: 0 auto;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0;
  }
  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "belowContent")} {
    width: var(${shellLayoutContractVars.topbarWidth});
    margin: 0 auto;
    padding: 10px 0 0;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "leftGroup")} {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 16px;
  }

  ${buildMarketplaceHomeTopbarSelector(marketplaceHomeScope, "brand")} {
    border: 0;
    background: transparent;
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    cursor: pointer;
    transition: opacity 180ms ease, transform 180ms ease;
  }

  ${marketplaceHomeThemeTopbarStyles}

  ${marketplaceHomeThemeLightStyles}
`;
