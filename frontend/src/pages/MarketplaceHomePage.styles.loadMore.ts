import { css } from "@emotion/react";

export const marketplaceHomeLoadMoreStyles = css`
  @keyframes marketplaceAutoLoadRingSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes marketplaceAutoLoadDotPulse {
    0%,
    80%,
    100% {
      transform: scale(0.88);
      opacity: 0.52;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes marketplaceAutoLoadSwing {
    0%,
    100% {
      transform: translateX(0) rotate(0deg);
    }
    25% {
      transform: translateX(-2px) rotate(-8deg);
    }
    75% {
      transform: translateX(2px) rotate(8deg);
    }
  }

  @keyframes marketplaceAutoLoadArrowSlide {
    0% {
      transform: translateY(-2px);
      opacity: 0.45;
    }
    60% {
      transform: translateY(3px);
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 0.65;
    }
  }

  .marketplace-home .marketplace-pagination-shell {
    width: 100%;
    min-height: 40px;
    height: auto;
    border-radius: 0;
    border: 0;
    background: transparent;
    padding: 4px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
  }

  .marketplace-home .marketplace-pagination-load-more {
    width: 100%;
    min-height: 40px;
    height: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    pointer-events: none;
    position: relative;
    overflow: visible;
  }

  .marketplace-home .marketplace-pagination-load-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    height: 16px;
    transform-origin: center;
  }

  .marketplace-home .marketplace-pagination-loading-arrow {
    width: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    transform-origin: center;
  }

  .marketplace-home .marketplace-pagination-loading-ring {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid #8a8a8a;
    border-top-color: #f0f0f0;
    opacity: 0.92;
  }

  .marketplace-home .marketplace-pagination-loading-dots {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .marketplace-home .marketplace-pagination-loading-dots span {
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: #7a7a7a;
    opacity: 0.88;
  }

  .marketplace-home .marketplace-pagination-loading-dots span:nth-of-type(2) {
    background: #8a8a8a;
  }

  .marketplace-home .marketplace-pagination-loading-dots span:nth-of-type(3) {
    background: #9a9a9a;
  }

  .marketplace-home .marketplace-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .marketplace-home .marketplace-pagination-load-more.is-idle .marketplace-pagination-loading-ring {
    animation: marketplaceAutoLoadRingSpin 2200ms linear infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-idle .marketplace-pagination-load-indicator {
    animation: marketplaceAutoLoadSwing 1200ms ease-in-out infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-idle .marketplace-pagination-loading-arrow {
    animation: marketplaceAutoLoadArrowSlide 1200ms ease-in-out infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-idle .marketplace-pagination-loading-dots span {
    animation: marketplaceAutoLoadDotPulse 1200ms ease-in-out infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-idle .marketplace-pagination-loading-dots span:nth-of-type(2) {
    animation-delay: 140ms;
  }

  .marketplace-home .marketplace-pagination-load-more.is-idle .marketplace-pagination-loading-dots span:nth-of-type(3) {
    animation-delay: 260ms;
  }

  .marketplace-home .marketplace-pagination-load-more.is-loading .marketplace-pagination-loading-ring {
    animation: marketplaceAutoLoadRingSpin 760ms linear infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-loading .marketplace-pagination-load-indicator {
    animation: marketplaceAutoLoadSwing 540ms ease-in-out infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-loading .marketplace-pagination-loading-arrow {
    animation: marketplaceAutoLoadArrowSlide 540ms ease-in-out infinite;
    color: #d1d5db;
  }

  .marketplace-home .marketplace-pagination-load-more.is-loading .marketplace-pagination-loading-dots span {
    animation: marketplaceAutoLoadDotPulse 760ms ease-in-out infinite;
  }

  .marketplace-home .marketplace-pagination-load-more.is-loading .marketplace-pagination-loading-dots span:nth-of-type(2) {
    animation-delay: 120ms;
  }

  .marketplace-home .marketplace-pagination-load-more.is-loading .marketplace-pagination-loading-dots span:nth-of-type(3) {
    animation-delay: 220ms;
  }

  .marketplace-home .marketplace-pagination-load-more.is-completed .marketplace-pagination-loading-ring {
    border-color: #cfd8e3;
    border-top-color: #ffffff;
  }

  .marketplace-home .marketplace-pagination-load-more.is-completed .marketplace-pagination-load-indicator {
    animation: marketplaceAutoLoadSwing 380ms ease-out 1;
  }

  .marketplace-home .marketplace-pagination-load-more.is-completed .marketplace-pagination-loading-arrow {
    color: #e5e7eb;
    opacity: 0.92;
  }

  .marketplace-home .marketplace-pagination-load-more.is-completed .marketplace-pagination-loading-dots span {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .marketplace-home .marketplace-pagination-load-more .marketplace-pagination-loading-ring,
    .marketplace-home .marketplace-pagination-load-more .marketplace-pagination-loading-dots span,
    .marketplace-home .marketplace-pagination-load-more .marketplace-pagination-load-indicator,
    .marketplace-home .marketplace-pagination-load-more .marketplace-pagination-loading-arrow {
      animation: none !important;
    }
  }

  @media (max-width: 900px) {
    .marketplace-home .marketplace-pagination-load-more {
      min-height: 40px;
    }
  }

  .marketplace-home.is-light-theme .marketplace-pagination-load-more {
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-loading-ring {
    border-color: #718096;
    border-top-color: #111827;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-loading-arrow {
    color: #4b5563;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-loading-dots span {
    background: #6b7280;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-loading-dots span:nth-of-type(2) {
    background: #4b5563;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-loading-dots span:nth-of-type(3) {
    background: #374151;
  }

  .marketplace-home .marketplace-pagination-empty-hint {
    width: 100%;
    min-height: 40px;
    border-radius: 10px;
    border: 1px dashed #3f3f3f;
    padding: 8px 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #d1d5db;
    font-size: 11px;
    line-height: 1.3;
    text-align: center;
  }

  .marketplace-home .marketplace-pagination-empty-hint strong {
    color: #f3f4f6;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
  }

  .marketplace-home .marketplace-pagination-empty-hint span {
    color: #a8adb7;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.3;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-empty-hint {
    border-color: #c8ced8;
    color: #4b5563;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-empty-hint strong {
    color: #111827;
  }

  .marketplace-home.is-light-theme .marketplace-pagination-empty-hint span {
    color: #6b7280;
  }
`;
