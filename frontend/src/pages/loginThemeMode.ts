import type { ThemeMode } from "../lib/themeModePath";

const LIGHT_LOGIN_PATH_PATTERN = /^\/(?:mobile\/)?light\/login(?:\/|$)/;

export function resolveLoginThemeMode(pathname: string, explicitMode?: ThemeMode): ThemeMode {
  if (explicitMode) {
    return explicitMode;
  }
  return LIGHT_LOGIN_PATH_PATTERN.test(pathname) ? "light" : "dark";
}
