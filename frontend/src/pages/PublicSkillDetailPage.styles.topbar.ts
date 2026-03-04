import { css } from "@emotion/react";

export const publicSkillDetailTopbarStyles = css`
  .skill-detail-page {
    --marketplace-nav-shell-background: rgba(255, 255, 255, 0.04);
    --marketplace-nav-shell-border: rgba(255, 255, 255, 0.06);
    --marketplace-nav-button-text: #e4e4e7;
    --marketplace-nav-button-subtle-text: #a1a1aa;
    --marketplace-nav-button-hover-background: rgba(255, 255, 255, 0.09);
    --marketplace-nav-button-active-background: #f5f5f5;
    --marketplace-nav-button-active-text: #101010;
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
  }

  @keyframes skillDetailTopbarFadeDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .skill-detail-page .animated-fade-down {
    animation: skillDetailTopbarFadeDown 360ms ease-out both;
  }

  .skill-detail-page .marketplace-topbar-shell {
    width: 100%;
  }

  .skill-detail-page .marketplace-topbar {
    width: 100%;
    height: 86px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    background: linear-gradient(180deg, #171717 0%, #12151b 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 12px;
  }

  .skill-detail-page .marketplace-topbar-left-group {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 16px;
  }

  .skill-detail-page .marketplace-topbar-brand {
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

  .skill-detail-page .marketplace-topbar-brand-dot {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: #2a2a2a;
    color: #e5e5e5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    transition: background-color 180ms ease;
  }

  .skill-detail-page .marketplace-topbar-brand-copy {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .skill-detail-page .marketplace-topbar-brand-copy strong {
    font-size: 26px;
    line-height: 1;
    font-weight: 700;
    color: #f1f1f1;
  }

  .skill-detail-page .marketplace-topbar-brand-copy small {
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    color: #b3b3b3;
  }

  .skill-detail-page .marketplace-topbar-light-nav {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: min(100%, 820px);
    overflow-x: auto;
    scrollbar-width: none;
    padding: 4px;
    border-radius: 11px;
    border: 1px solid var(--marketplace-nav-shell-border);
    background: var(--marketplace-nav-shell-background);
  }

  .skill-detail-page .marketplace-topbar-light-nav::-webkit-scrollbar {
    display: none;
  }

  .skill-detail-page .marketplace-topbar-nav-button {
    border: 0;
    height: 30px;
    border-radius: 8px;
    padding: 0 10px;
    background: transparent;
    color: var(--marketplace-nav-button-text);
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  .skill-detail-page .marketplace-topbar-nav-button .marketplace-topbar-action-label {
    white-space: nowrap;
  }

  .skill-detail-page .marketplace-topbar-nav-button .marketplace-topbar-action-badge {
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

  .skill-detail-page .marketplace-topbar-nav-button.is-subtle {
    color: var(--marketplace-nav-button-subtle-text);
  }

  .skill-detail-page .marketplace-topbar-nav-button.is-highlight {
    background: var(--marketplace-nav-button-highlight-background);
  }

  .skill-detail-page .marketplace-topbar-nav-button.is-category-action {
    border: 1px solid transparent;
  }

  .skill-detail-page .marketplace-topbar-nav-button.is-category-action:not(.is-active):not(:disabled):hover {
    border-color: var(--marketplace-nav-category-hover-border);
  }

  .skill-detail-page .marketplace-topbar-nav-button.is-download-ranking-action {
    background: var(--marketplace-nav-ranking-background);
    border: 1px solid var(--marketplace-nav-ranking-border);
    color: var(--marketplace-nav-ranking-text);
  }

  .skill-detail-page .marketplace-topbar-nav-button.is-download-ranking-action:not(.is-active):not(:disabled):hover {
    background: var(--marketplace-nav-button-hover-background);
    border-color: var(--marketplace-nav-category-hover-border);
  }

  .skill-detail-page .marketplace-topbar-nav-button.is-active {
    background: var(--marketplace-nav-button-active-background);
    color: var(--marketplace-nav-button-active-text);
    font-weight: 700;
    cursor: default;
  }

  .skill-detail-page .marketplace-topbar-nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-detail-page .marketplace-topbar-nav-button:not(.is-active):not(:disabled):hover {
    background: var(--marketplace-nav-button-hover-background);
    transform: translateY(-1px);
  }

  .skill-detail-page .marketplace-topbar-light-utility {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 11px;
    border: 1px solid var(--marketplace-utility-shell-border);
    background: var(--marketplace-utility-shell-background);
  }

  .skill-detail-page .marketplace-topbar-utility-button {
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

  .skill-detail-page .marketplace-topbar-utility-button .marketplace-topbar-action-label {
    white-space: nowrap;
  }

  .skill-detail-page .marketplace-topbar-utility-button.is-subtle {
    color: var(--marketplace-utility-button-subtle-text);
  }

  .skill-detail-page .marketplace-topbar-utility-button:hover:not(:disabled) {
    background: var(--marketplace-utility-button-hover-background);
    transform: translateY(-1px);
  }

  .skill-detail-page .marketplace-topbar-utility-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-detail-page .marketplace-topbar-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .skill-detail-page .marketplace-topbar-status,
  .skill-detail-page .marketplace-topbar-cta {
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

  .skill-detail-page .marketplace-topbar-status {
    background: #2a2a2a;
    color: #d4d4d4;
    font-weight: 600;
  }

  .skill-detail-page .marketplace-topbar-cta {
    background: #111111;
    color: #e5e5e5;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  .skill-detail-page .marketplace-topbar-brand:hover {
    opacity: 0.92;
  }

  .skill-detail-page .marketplace-topbar-brand:hover .marketplace-topbar-brand-dot {
    background: #343438;
  }

  .skill-detail-page .marketplace-topbar-cta:hover {
    background: #1c1d22;
    color: #f1f1f1;
  }

  .skill-detail-page .marketplace-topbar-cta:active {
    transform: translateY(1px);
  }

  .skill-detail-page .marketplace-topbar-locale-switch {
    height: 30px;
    border-radius: 9px;
    background: #1f1f1f;
    padding: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .skill-detail-page .marketplace-topbar-theme-switch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 2px;
    padding-right: 6px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .skill-detail-page .marketplace-topbar-locale-switch button {
    border: 0;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    padding: 0;
    background: #2a2a2a;
    color: #d4d4d4;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease;
  }

  .skill-detail-page .marketplace-topbar-locale-switch button.is-active,
  .skill-detail-page .marketplace-topbar-locale-switch button:disabled {
    background: #2d2d2d;
    color: #f1f1f1;
    cursor: default;
  }

  .skill-detail-page .marketplace-topbar-locale-switch button:not(:disabled):hover {
    background: #343438;
    color: #f1f1f1;
  }

  .skill-detail-page .marketplace-topbar-locale-switch .is-icon-toggle .anticon {
    font-size: 12px;
    line-height: 1;
  }

  .skill-detail-page .marketplace-topbar-locale-switch .is-theme-toggle {
    background: #262626;
    color: #d4d4d4;
  }

  .skill-detail-page .marketplace-topbar-locale-switch .is-theme-toggle.is-active,
  .skill-detail-page .marketplace-topbar-locale-switch .is-theme-toggle:disabled {
    background: #d6d6d6;
    color: #111111;
  }

  .skill-detail-page .marketplace-topbar-locale-switch .is-theme-toggle:not(:disabled):hover {
    background: #343438;
    color: #f1f1f1;
  }

  .skill-detail-page .marketplace-topbar-brand:focus-visible,
  .skill-detail-page .marketplace-topbar-cta:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .skill-detail-page .marketplace-topbar-nav-button:focus-visible,
  .skill-detail-page .marketplace-topbar-utility-button:focus-visible,
  .skill-detail-page .marketplace-topbar-locale-switch button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .skill-detail-page.is-light .marketplace-topbar {
    border-bottom-color: #dbe4ee;
    background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%);
  }

  .skill-detail-page.is-light .marketplace-topbar-brand-dot {
    background: #d7dee9;
    color: #2f4660;
  }

  .skill-detail-page.is-light .marketplace-topbar-brand-copy strong {
    font-size: 16px;
    font-weight: 800;
    color: #14263d;
  }

  .skill-detail-page.is-light .marketplace-topbar-brand-copy small {
    color: #3f5671;
  }

  .skill-detail-page.is-light .marketplace-topbar-status {
    background: #e2e8f0;
    color: #334155;
  }

  .skill-detail-page.is-light .marketplace-topbar-cta {
    background: #1f2937;
    color: #f8fafc;
  }

  .skill-detail-page.is-light .marketplace-topbar-locale-switch {
    background: #e8edf5;
  }

  .skill-detail-page.is-light {
    --marketplace-nav-shell-background: rgba(148, 163, 184, 0.12);
    --marketplace-nav-shell-border: rgba(148, 163, 184, 0.28);
    --marketplace-nav-button-text: #334155;
    --marketplace-nav-button-subtle-text: #64748b;
    --marketplace-nav-button-hover-background: rgba(148, 163, 184, 0.18);
    --marketplace-nav-button-active-background: #1f2937;
    --marketplace-nav-button-active-text: #f8fafc;
    --marketplace-nav-button-highlight-background: rgba(59, 130, 246, 0.18);
    --marketplace-nav-badge-background: rgba(37, 99, 235, 0.2);
    --marketplace-nav-badge-text: #1d4ed8;
    --marketplace-nav-category-hover-border: rgba(59, 130, 246, 0.38);
    --marketplace-nav-ranking-background: rgba(37, 99, 235, 0.12);
    --marketplace-nav-ranking-border: rgba(37, 99, 235, 0.25);
    --marketplace-nav-ranking-text: #1e40af;
    --marketplace-utility-shell-background: rgba(148, 163, 184, 0.1);
    --marketplace-utility-shell-border: rgba(148, 163, 184, 0.24);
    --marketplace-utility-button-background: #ffffff;
    --marketplace-utility-button-border: rgba(148, 163, 184, 0.3);
    --marketplace-utility-button-text: #334155;
    --marketplace-utility-button-subtle-text: #475569;
    --marketplace-utility-button-hover-background: rgba(226, 232, 240, 0.8);
  }

  .skill-detail-page.is-light .marketplace-topbar-theme-switch {
    border-right-color: rgba(15, 23, 42, 0.14);
  }

  .skill-detail-page.is-light .marketplace-topbar-locale-switch button {
    background: #ffffff;
    color: #334155;
  }

  .skill-detail-page.is-light .marketplace-topbar-locale-switch button.is-active,
  .skill-detail-page.is-light .marketplace-topbar-locale-switch button:disabled {
    background: #dbe4ee;
    color: #14263d;
  }

  .skill-detail-page.is-light .marketplace-topbar-locale-switch .is-theme-toggle {
    background: #f2f6fc;
    color: #475569;
  }

  .skill-detail-page.is-light .marketplace-topbar-locale-switch .is-theme-toggle.is-active,
  .skill-detail-page.is-light .marketplace-topbar-locale-switch .is-theme-toggle:disabled {
    background: #1f2937;
    color: #ffffff;
  }
`;
