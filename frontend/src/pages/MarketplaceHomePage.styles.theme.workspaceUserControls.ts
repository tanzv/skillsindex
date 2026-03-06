import { css } from "@emotion/react";

export const marketplaceHomeWorkspaceUserControlStyles = css`
  .marketplace-home .marketplace-topbar-left-accessory {
    min-width: 0;
    display: inline-flex;
    align-items: center;
  }

  .marketplace-home .workspace-topbar-user-trigger {
    border: 1px solid var(--marketplace-utility-button-border);
    border-radius: 10px;
    background: var(--marketplace-utility-button-background);
    color: var(--marketplace-utility-button-text);
    min-height: 34px;
    padding: 4px 8px 4px 4px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .workspace-topbar-user-trigger:hover {
    background: var(--marketplace-utility-button-hover-background);
    border-color: var(--marketplace-nav-category-hover-border);
    transform: translateY(-1px);
  }

  .marketplace-home .workspace-topbar-avatar {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, color-mix(in srgb, var(--si-color-accent) 74%, transparent), color-mix(in srgb, #2563eb 62%, transparent));
    color: var(--si-color-accent-contrast);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }

  .marketplace-home .workspace-topbar-user-meta {
    min-width: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 1px;
  }

  .marketplace-home .workspace-topbar-user-meta strong {
    max-width: 128px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--marketplace-brand-title);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 700;
  }

  .marketplace-home .workspace-topbar-user-meta small {
    max-width: 128px;
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
    font-size: 12px;
    line-height: 1;
  }

  .workspace-topbar-user-dropdown .ant-dropdown-menu {
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--si-color-border) 62%, transparent);
    background: color-mix(in srgb, var(--si-color-panel) 92%, transparent);
    box-shadow: 0 14px 28px color-mix(in srgb, #020617 34%, transparent);
    min-width: 180px;
    padding: 6px;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-menu-group {
    color: var(--si-color-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 0.64rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-menu-item {
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--si-color-text-primary);
  }

  .workspace-topbar-user-dropdown .workspace-topbar-user-menu-item.is-active {
    color: var(--si-color-accent);
  }
`;
