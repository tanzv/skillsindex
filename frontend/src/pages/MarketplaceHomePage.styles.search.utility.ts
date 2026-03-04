import { css } from "@emotion/react";

export const marketplaceHomeSearchUtilityStyles = css`
  .marketplace-home .marketplace-top-recommend-row {
    width: 100%;
    min-height: 30px;
    padding: 0 2px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .marketplace-home .marketplace-top-recommend-label {
    color: #b3b8c1;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .marketplace-home .marketplace-top-recommend-chips {
    min-width: 0;
    flex: 1;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .marketplace-home .marketplace-top-recommend-chips::-webkit-scrollbar {
    display: none;
  }

  .marketplace-home .marketplace-top-recommend-chips button {
    border: 0;
    height: 26px;
    border-radius: 999px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.08);
    color: #f3f4f6;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .marketplace-top-recommend-chips button:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  .marketplace-home .marketplace-top-recommend-chips button:active {
    transform: translateY(1px);
  }

  .marketplace-home .marketplace-top-recommend-chips button:focus-visible {
    outline: 2px solid #f3f4f6;
    outline-offset: 1px;
  }

  .marketplace-home .marketplace-search-main-row {
    width: 100%;
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .marketplace-home .marketplace-search-input {
    min-width: 0;
    flex: 1;
    height: 52px;
    border-radius: 12px;
    border: 0;
    background: rgba(255, 255, 255, 0.06);
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
  }

  .marketplace-home .marketplace-search-input input {
    width: 100%;
    border: 0;
    outline: none;
    background: transparent;
    color: #f3f4f6;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 1;
  }

  .marketplace-home .marketplace-search-input input::placeholder {
    color: #9da1aa;
    opacity: 1;
  }

  .marketplace-home .marketplace-search-input input:focus-visible {
    outline: 2px solid #d1d5db;
    outline-offset: 1px;
    border-radius: 6px;
  }

  .marketplace-home .marketplace-search-submit,
  .marketplace-home .marketplace-search-filter-btn {
    height: 40px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .marketplace-search-submit {
    padding: 0 14px;
    border: 0;
    background: #f3f4f6;
    color: #111111;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
  }

  .marketplace-home .marketplace-search-filter-btn {
    padding: 0 14px;
    border: 0;
    background: #1d1f24;
    color: #e5e7eb;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  .marketplace-home .marketplace-search-submit:hover:not(:disabled),
  .marketplace-home .marketplace-search-filter-btn:hover {
    filter: brightness(1.06);
  }

  .marketplace-home .marketplace-search-filter-btn:active,
  .marketplace-home .marketplace-search-submit:active:not(:disabled) {
    transform: translateY(1px);
  }

  .marketplace-home .marketplace-search-filter-btn:focus-visible,
  .marketplace-home .marketplace-search-submit:focus-visible {
    outline: 2px solid #e5e7eb;
    outline-offset: 1px;
  }

  .marketplace-home .marketplace-search-submit:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }

  .marketplace-home .marketplace-search-utility-row {
    width: 100%;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .marketplace-home .marketplace-search-utility-left,
  .marketplace-home .marketplace-search-utility-right {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .marketplace-home .marketplace-search-utility-left span,
  .marketplace-home .marketplace-search-utility-right span {
    height: 24px;
    border-radius: 7px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    font-size: 10px;
    font-weight: 700;
    font-family: "JetBrains Mono", monospace;
  }

  .marketplace-home .marketplace-search-utility-left span {
    background: rgba(255, 255, 255, 0.05);
    color: #b7bcc6;
  }

  .marketplace-home .marketplace-search-utility-left span.is-active {
    background: rgba(255, 255, 255, 0.11);
    color: #f3f4f6;
  }

  .marketplace-home .marketplace-search-utility-right span.is-queue {
    background: #2a2c31;
    color: #eceff3;
  }

  .marketplace-home .marketplace-search-utility-right button.is-open-queue {
    border: 0;
    height: 24px;
    border-radius: 7px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    font-size: 10px;
    font-weight: 700;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    color: #111111;
    background: #f3f4f6;
    cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
  }

  .marketplace-home .marketplace-search-utility-right button.is-open-queue:hover {
    background: #ffffff;
  }

  .marketplace-home .marketplace-search-utility-right button.is-open-queue:active {
    transform: translateY(1px);
  }

  .marketplace-home .marketplace-search-utility-right button.is-open-queue:focus-visible {
    outline: 2px solid #e5e7eb;
    outline-offset: 1px;
  }
`;
