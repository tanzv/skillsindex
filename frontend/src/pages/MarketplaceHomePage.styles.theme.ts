import { css } from "@emotion/react";
import {
  marketplaceHomeThemeCategoryTokenLightStyles,
  marketplaceHomeThemeCategoryTokenStyles
} from "./MarketplaceHomePage.styles.theme.categoryTokens";
import { marketplaceHomeTopbarNavigationStyles } from "./MarketplaceHomePage.styles.theme.topbarNavigation";
import { marketplaceHomeTopbarPrimaryOverflowStyles } from "./MarketplaceHomePage.styles.theme.topbarPrimaryOverflow";
import { marketplaceHomeWorkspaceUserControlStyles } from "./MarketplaceHomePage.styles.theme.workspaceUserControls";

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

  .marketplace-home-stage {
    margin: 0;
    overflow-x: hidden;
    overflow-y: visible;
    background: #101010;
  }

  .marketplace-home-stage.is-light-stage {
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

  .marketplace-home .marketplace-topbar-shell {
    width: 100%;
  }

  .marketplace-home .marketplace-topbar {
    width: 100%;
    height: 84px;
    border-radius: 0;
    border-bottom: 1px solid var(--marketplace-topbar-border);
    background: linear-gradient(180deg, var(--marketplace-topbar-background) 0%, var(--marketplace-topbar-background-alt) 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 var(--marketplace-content-gutter);
  }

  .marketplace-home .marketplace-topbar-left-group {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 16px;
  }

  .marketplace-home .marketplace-topbar-brand {
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

  ${marketplaceHomeWorkspaceUserControlStyles}

  .marketplace-home .marketplace-topbar-brand-dot {
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

  .marketplace-home .marketplace-topbar-brand-copy {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .marketplace-home .marketplace-topbar-brand-copy strong {
    font-size: 26px;
    line-height: 1;
    font-weight: 700;
    color: var(--marketplace-brand-title);
  }

  .marketplace-home .marketplace-topbar-brand-copy small {
    font-size: 11px;
    color: var(--marketplace-brand-subtitle);
    font-weight: 600;
    line-height: 1;
  }

  .marketplace-home .marketplace-topbar-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  ${marketplaceHomeTopbarNavigationStyles}

  ${marketplaceHomeTopbarPrimaryOverflowStyles}

  .marketplace-home .marketplace-topbar-nav-button.is-active {
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

  .marketplace-home .marketplace-topbar-nav-button:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }

  .marketplace-home .marketplace-topbar-nav-button:not(.is-active):not(:disabled):hover {
    background: var(--marketplace-nav-button-hover-background);
    border-color: var(--marketplace-nav-button-hover-border);
    box-shadow: var(--marketplace-nav-button-hover-shadow);
    transform: translateY(-1px);
  }

  .marketplace-home .marketplace-topbar-light-utility {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 11px;
    border: 1px solid var(--marketplace-utility-shell-border);
    background: var(--marketplace-utility-shell-background);
  }

  .marketplace-home .marketplace-topbar-utility-button {
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

  .marketplace-home .marketplace-topbar-utility-button .marketplace-topbar-action-label {
    white-space: nowrap;
  }

  .marketplace-home .marketplace-topbar-utility-button.is-subtle {
    color: var(--marketplace-utility-button-subtle-text);
  }

  .marketplace-home .marketplace-topbar-utility-button:hover:not(:disabled) {
    background: var(--marketplace-utility-button-hover-background);
    transform: translateY(-1px);
  }

  .marketplace-home .marketplace-topbar-utility-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .marketplace-home .marketplace-topbar-status,
  .marketplace-home .marketplace-topbar-secondary-cta,
  .marketplace-home .marketplace-topbar-cta {
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

  .marketplace-home .marketplace-topbar-status {
    background: var(--marketplace-status-background);
    color: var(--marketplace-status-text);
    font-weight: 600;
  }

  .marketplace-home .marketplace-topbar-secondary-cta {
    border: 1px solid var(--marketplace-utility-button-border);
    background: var(--marketplace-utility-button-background);
    color: var(--marketplace-utility-button-text);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .marketplace-topbar-cta {
    background: var(--marketplace-cta-background);
    color: var(--marketplace-cta-text);
    font-weight: 700;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .marketplace-topbar-brand:hover {
    opacity: 0.92;
  }

  .marketplace-home .marketplace-topbar-brand:hover .marketplace-topbar-brand-dot {
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

  .marketplace-home .marketplace-topbar-brand:focus-visible,
  .marketplace-home .workspace-topbar-user-trigger:focus-visible,
  .marketplace-home .marketplace-topbar-secondary-cta:focus-visible,
  .marketplace-home .marketplace-topbar-cta:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .marketplace-home .marketplace-topbar-secondary-cta:hover {
    background: var(--marketplace-utility-button-hover-background);
    color: var(--marketplace-utility-button-text);
  }

  .marketplace-home .marketplace-topbar-secondary-cta:active {
    transform: translateY(1px);
  }

  .marketplace-home .marketplace-topbar-nav-button:focus-visible,
  .marketplace-home .marketplace-topbar-utility-button:focus-visible {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 1px;
  }

  .marketplace-home .marketplace-topbar-cta:hover {
    background: var(--marketplace-cta-hover-background);
    color: #f1f1f1;
  }

  .marketplace-home .marketplace-topbar-cta:active {
    transform: translateY(1px);
  }

  .marketplace-home .marketplace-topbar-locale-switch button:focus-visible {
    outline: 2px solid var(--marketplace-focus-ring);
    outline-offset: 1px;
  }

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

  .marketplace-home.is-light-theme .marketplace-topbar {
    height: 86px;
  }

  .marketplace-home.is-light-theme .marketplace-topbar-utility-button {
    background: var(--marketplace-utility-button-background);
    color: var(--marketplace-utility-button-text);
    border: 1px solid var(--marketplace-utility-button-border);
  }

  .marketplace-home.is-light-theme .marketplace-topbar-utility-button.is-subtle {
    color: var(--marketplace-utility-button-subtle-text);
  }

  .marketplace-home.is-light-theme .marketplace-topbar-utility-button:hover:not(:disabled) {
    background: var(--marketplace-utility-button-hover-background);
  }

  @media (prefers-reduced-motion: reduce) {
    .marketplace-home {
      animation: none;
    }
  }

  .marketplace-home.is-light-theme .marketplace-topbar-brand-copy strong {
    font-size: 16px;
    font-weight: 800;
    color: var(--marketplace-brand-title);
  }

  .marketplace-home.is-light-theme .marketplace-topbar-brand-copy small {
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
