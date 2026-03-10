import { css } from "@emotion/react";

export const marketplaceHomeWorkspaceSearchTriggerStyles = css`
  @keyframes marketplaceSearchTriggerSweep {
    0% {
      opacity: 0;
      transform: translateX(-160%) skewX(-20deg);
    }
    22% {
      opacity: 0.35;
    }
    100% {
      opacity: 0;
      transform: translateX(300%) skewX(-20deg);
    }
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger {
    position: relative;
    inline-size: clamp(182px, 18vw, 248px);
    height: 30px;
    justify-content: flex-start;
    border-radius: 999px;
    padding: 0 14px;
    border-color: color-mix(in srgb, var(--marketplace-utility-button-border) 82%, transparent);
    background: color-mix(in srgb, var(--marketplace-utility-button-background) 70%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
    overflow: hidden;
    transition:
      background-color 220ms ease,
      border-color 220ms ease,
      color 220ms ease,
      box-shadow 220ms ease,
      transform 220ms ease;
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger .marketplace-topbar-action-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger .marketplace-topbar-action-label::before {
    content: "⌕";
    font-size: 11px;
    opacity: 0.72;
    transform: translateY(-0.5px);
    transition: opacity 180ms ease;
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger::after {
    content: "";
    position: absolute;
    inset: -45% auto -45% -40%;
    width: 38%;
    transform: translateX(-160%) skewX(-20deg);
    background: linear-gradient(
      120deg,
      transparent 0%,
      color-mix(in srgb, #ffffff 40%, transparent) 50%,
      transparent 100%
    );
    opacity: 0;
    pointer-events: none;
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--marketplace-utility-button-hover-background) 84%, #ffffff 16%);
    border-color: color-mix(in srgb, var(--marketplace-focus-ring) 44%, transparent);
    box-shadow:
      0 10px 24px color-mix(in srgb, #111111 20%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 24%, transparent);
    transform: translateY(-1px);
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger:hover:not(:disabled)::after {
    animation: marketplaceSearchTriggerSweep 680ms cubic-bezier(0.2, 0.72, 0.24, 1) both;
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger:hover:not(:disabled) .marketplace-topbar-action-label::before {
    opacity: 0.95;
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger:focus-visible {
    border-color: color-mix(in srgb, var(--marketplace-focus-ring) 62%, transparent);
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--marketplace-focus-ring) 36%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 28%, transparent),
      0 8px 18px color-mix(in srgb, #111111 16%, transparent);
    transform: translateY(-1px);
  }

  .marketplace-home .workspace-topbar-shell .marketplace-topbar-utility-button.is-search-trigger:focus-visible::after {
    animation: marketplaceSearchTriggerSweep 720ms cubic-bezier(0.2, 0.72, 0.24, 1) both;
  }
`;
