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
}

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
  "--si-shadow-overlay": "0 24px 40px rgba(0, 0, 0, 0.34)"
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
  "--si-shadow-overlay": "0 18px 34px rgba(0, 0, 0, 0.12)"
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
