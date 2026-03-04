import type { ThemeMode } from "../lib/themeModePath";

export interface ThemeTokenMap {
  "--si-color-canvas": string;
  "--si-color-surface": string;
  "--si-color-surface-alt": string;
  "--si-color-panel": string;
  "--si-color-field": string;
  "--si-color-muted-surface": string;
  "--si-color-border": string;
  "--si-color-border-soft": string;
  "--si-color-text-primary": string;
  "--si-color-text-secondary": string;
  "--si-color-text-weak": string;
  "--si-color-text-inverse": string;
  "--si-color-accent": string;
  "--si-color-accent-contrast": string;
  "--si-color-success-bg": string;
  "--si-color-success-text": string;
  "--si-color-overlay-mask": string;
  "--si-shadow-overlay": string;
  "--si-size-marketplace-top-recommend-row-height": string;
  "--si-size-marketplace-top-recommend-chip-height": string;
  "--si-size-marketplace-top-recommend-chip-font-size": string;
  "--si-size-marketplace-search-main-row-height": string;
  "--si-size-marketplace-search-input-height": string;
  "--si-size-marketplace-search-input-radius": string;
  "--si-size-marketplace-search-input-font-size": string;
  "--si-size-marketplace-search-action-height": string;
  "--si-size-marketplace-search-action-radius": string;
  "--si-size-marketplace-search-action-font-size": string;
  "--si-size-marketplace-search-utility-row-height": string;
  "--si-size-marketplace-search-utility-pill-height": string;
  "--si-size-marketplace-search-utility-pill-radius": string;
  "--si-size-marketplace-search-utility-pill-font-size": string;
  "--si-size-marketplace-search-open-queue-height": string;
  "--si-size-marketplace-results-row-height": string;
  "--si-size-marketplace-latest-row-height": string;
  "--si-size-marketplace-skill-row-padding-y": string;
  "--si-size-marketplace-skill-row-padding-x": string;
  "--si-size-marketplace-card-head-width": string;
  "--si-size-marketplace-card-head-height": string;
  "--si-size-marketplace-card-thumb-size": string;
  "--si-size-marketplace-card-cover-chip-height": string;
  "--si-size-marketplace-card-cover-chip-font-size": string;
  "--si-size-marketplace-card-title-size": string;
  "--si-size-marketplace-card-description-size": string;
  "--si-size-marketplace-card-tag-height": string;
  "--si-size-marketplace-card-tag-font-size": string;
  "--si-size-marketplace-card-foot-font-size": string;
  "--si-size-marketplace-results-header-min-height": string;
  "--si-size-marketplace-results-title-size": string;
  "--si-size-marketplace-results-close-height": string;
  "--si-size-marketplace-results-close-font-size": string;
  "--si-size-marketplace-results-input-height": string;
  "--si-size-marketplace-results-input-font-size": string;
  "--si-size-marketplace-results-action-height": string;
  "--si-size-marketplace-results-action-font-size": string;
  "--si-size-marketplace-results-chip-height": string;
  "--si-size-marketplace-results-chip-font-size": string;
  "--si-size-marketplace-results-shortcut-font-size": string;
  "--si-size-marketplace-results-card-min-height": string;
  "--si-size-marketplace-results-card-title-size": string;
  "--si-size-marketplace-results-card-body-size": string;
  "--si-size-marketplace-results-card-action-size": string;
  "--si-size-marketplace-results-footer-font-size": string;
  "--si-size-marketplace-results-stat-height": string;
  "--si-size-marketplace-results-stat-font-size": string;
}

const marketplaceDimensionTokens: Pick<
  ThemeTokenMap,
  | "--si-size-marketplace-top-recommend-row-height"
  | "--si-size-marketplace-top-recommend-chip-height"
  | "--si-size-marketplace-top-recommend-chip-font-size"
  | "--si-size-marketplace-search-main-row-height"
  | "--si-size-marketplace-search-input-height"
  | "--si-size-marketplace-search-input-radius"
  | "--si-size-marketplace-search-input-font-size"
  | "--si-size-marketplace-search-action-height"
  | "--si-size-marketplace-search-action-radius"
  | "--si-size-marketplace-search-action-font-size"
  | "--si-size-marketplace-search-utility-row-height"
  | "--si-size-marketplace-search-utility-pill-height"
  | "--si-size-marketplace-search-utility-pill-radius"
  | "--si-size-marketplace-search-utility-pill-font-size"
  | "--si-size-marketplace-search-open-queue-height"
  | "--si-size-marketplace-results-row-height"
  | "--si-size-marketplace-latest-row-height"
  | "--si-size-marketplace-skill-row-padding-y"
  | "--si-size-marketplace-skill-row-padding-x"
  | "--si-size-marketplace-card-head-width"
  | "--si-size-marketplace-card-head-height"
  | "--si-size-marketplace-card-thumb-size"
  | "--si-size-marketplace-card-cover-chip-height"
  | "--si-size-marketplace-card-cover-chip-font-size"
  | "--si-size-marketplace-card-title-size"
  | "--si-size-marketplace-card-description-size"
  | "--si-size-marketplace-card-tag-height"
  | "--si-size-marketplace-card-tag-font-size"
  | "--si-size-marketplace-card-foot-font-size"
  | "--si-size-marketplace-results-header-min-height"
  | "--si-size-marketplace-results-title-size"
  | "--si-size-marketplace-results-close-height"
  | "--si-size-marketplace-results-close-font-size"
  | "--si-size-marketplace-results-input-height"
  | "--si-size-marketplace-results-input-font-size"
  | "--si-size-marketplace-results-action-height"
  | "--si-size-marketplace-results-action-font-size"
  | "--si-size-marketplace-results-chip-height"
  | "--si-size-marketplace-results-chip-font-size"
  | "--si-size-marketplace-results-shortcut-font-size"
  | "--si-size-marketplace-results-card-min-height"
  | "--si-size-marketplace-results-card-title-size"
  | "--si-size-marketplace-results-card-body-size"
  | "--si-size-marketplace-results-card-action-size"
  | "--si-size-marketplace-results-footer-font-size"
  | "--si-size-marketplace-results-stat-height"
  | "--si-size-marketplace-results-stat-font-size"
> = {
  "--si-size-marketplace-top-recommend-row-height": "36px",
  "--si-size-marketplace-top-recommend-chip-height": "34px",
  "--si-size-marketplace-top-recommend-chip-font-size": "12px",
  "--si-size-marketplace-search-main-row-height": "58px",
  "--si-size-marketplace-search-input-height": "56px",
  "--si-size-marketplace-search-input-radius": "14px",
  "--si-size-marketplace-search-input-font-size": "16px",
  "--si-size-marketplace-search-action-height": "46px",
  "--si-size-marketplace-search-action-radius": "11px",
  "--si-size-marketplace-search-action-font-size": "13px",
  "--si-size-marketplace-search-utility-row-height": "34px",
  "--si-size-marketplace-search-utility-pill-height": "28px",
  "--si-size-marketplace-search-utility-pill-radius": "8px",
  "--si-size-marketplace-search-utility-pill-font-size": "11px",
  "--si-size-marketplace-search-open-queue-height": "30px",
  "--si-size-marketplace-results-row-height": "196px",
  "--si-size-marketplace-latest-row-height": "198px",
  "--si-size-marketplace-skill-row-padding-y": "14px",
  "--si-size-marketplace-skill-row-padding-x": "16px",
  "--si-size-marketplace-card-head-width": "72px",
  "--si-size-marketplace-card-head-height": "42px",
  "--si-size-marketplace-card-thumb-size": "40px",
  "--si-size-marketplace-card-cover-chip-height": "18px",
  "--si-size-marketplace-card-cover-chip-font-size": "10px",
  "--si-size-marketplace-card-title-size": "15px",
  "--si-size-marketplace-card-description-size": "12px",
  "--si-size-marketplace-card-tag-height": "20px",
  "--si-size-marketplace-card-tag-font-size": "10px",
  "--si-size-marketplace-card-foot-font-size": "11px",
  "--si-size-marketplace-results-header-min-height": "44px",
  "--si-size-marketplace-results-title-size": "18px",
  "--si-size-marketplace-results-close-height": "34px",
  "--si-size-marketplace-results-close-font-size": "12px",
  "--si-size-marketplace-results-input-height": "46px",
  "--si-size-marketplace-results-input-font-size": "13px",
  "--si-size-marketplace-results-action-height": "46px",
  "--si-size-marketplace-results-action-font-size": "13px",
  "--si-size-marketplace-results-chip-height": "34px",
  "--si-size-marketplace-results-chip-font-size": "13px",
  "--si-size-marketplace-results-shortcut-font-size": "12px",
  "--si-size-marketplace-results-card-min-height": "100px",
  "--si-size-marketplace-results-card-title-size": "14px",
  "--si-size-marketplace-results-card-body-size": "12px",
  "--si-size-marketplace-results-card-action-size": "12px",
  "--si-size-marketplace-results-footer-font-size": "12px",
  "--si-size-marketplace-results-stat-height": "28px",
  "--si-size-marketplace-results-stat-font-size": "12px"
};

const darkThemeTokens: ThemeTokenMap = {
  "--si-color-canvas": "#101010",
  "--si-color-surface": "#171717",
  "--si-color-surface-alt": "#1a1a1a",
  "--si-color-panel": "#111111",
  "--si-color-field": "#171717",
  "--si-color-muted-surface": "#242424",
  "--si-color-border": "#2b2b2b",
  "--si-color-border-soft": "#3a3a3a",
  "--si-color-text-primary": "#e5e5e5",
  "--si-color-text-secondary": "#a3a3a3",
  "--si-color-text-weak": "#8f8f8f",
  "--si-color-text-inverse": "#111111",
  "--si-color-accent": "#d6d6d6",
  "--si-color-accent-contrast": "#111111",
  "--si-color-success-bg": "#14532d",
  "--si-color-success-text": "#bbf7d0",
  "--si-color-overlay-mask": "rgba(3, 8, 16, 0.74)",
  "--si-shadow-overlay": "0 24px 40px rgba(0, 0, 0, 0.34)",
  ...marketplaceDimensionTokens
};

const lightThemeTokens: ThemeTokenMap = {
  "--si-color-canvas": "#eef1f5",
  "--si-color-surface": "#ffffff",
  "--si-color-surface-alt": "#d6d6d6",
  "--si-color-panel": "#ffffff",
  "--si-color-field": "#ffffff",
  "--si-color-muted-surface": "#f3f4f6",
  "--si-color-border": "#d6d6d6",
  "--si-color-border-soft": "#e5e5e5",
  "--si-color-text-primary": "#111111",
  "--si-color-text-secondary": "#555555",
  "--si-color-text-weak": "#6a6a6a",
  "--si-color-text-inverse": "#ffffff",
  "--si-color-accent": "#111111",
  "--si-color-accent-contrast": "#e5e5e5",
  "--si-color-success-bg": "#ecfdf3",
  "--si-color-success-text": "#065f46",
  "--si-color-overlay-mask": "rgba(15, 23, 42, 0.34)",
  "--si-shadow-overlay": "0 18px 34px rgba(0, 0, 0, 0.12)",
  ...marketplaceDimensionTokens
};

export const standardThemeTokens: Record<ThemeMode, ThemeTokenMap> = {
  dark: darkThemeTokens,
  light: lightThemeTokens
};

export function getThemeTokens(mode: ThemeMode): ThemeTokenMap {
  return standardThemeTokens[mode];
}

export function applyThemeTokens(mode: ThemeMode, target: HTMLElement = document.documentElement): void {
  const tokens = getThemeTokens(mode);
  target.setAttribute("data-theme-mode", mode);
  for (const [tokenName, tokenValue] of Object.entries(tokens)) {
    target.style.setProperty(tokenName, tokenValue);
  }
}
