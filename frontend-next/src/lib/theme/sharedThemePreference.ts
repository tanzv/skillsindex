import { buildPublicPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";

export type SharedThemePreference = "light" | "dark";

export const sharedThemeStorageKey = "skillsindex.theme";
export const legacyProtectedThemeStorageKey = "skillsindex.protected.theme";

interface ThemeStorageReader {
  getItem(key: string): string | null;
}

interface ThemeStorageWriter {
  setItem(key: string, value: string): void;
}

function normalizeThemePreference(value: string | null | undefined): SharedThemePreference | null {
  return value === "light" || value === "dark" ? value : null;
}

export function resolveStoredThemePreference(
  storage: ThemeStorageReader | null | undefined,
  fallback: SharedThemePreference = "dark"
): SharedThemePreference {
  const sharedPreference = normalizeThemePreference(storage?.getItem(sharedThemeStorageKey));
  if (sharedPreference) {
    return sharedPreference;
  }

  const legacyPreference = normalizeThemePreference(storage?.getItem(legacyProtectedThemeStorageKey));
  if (legacyPreference) {
    return legacyPreference;
  }

  return fallback;
}

export function persistStoredThemePreference(
  storage: ThemeStorageWriter | null | undefined,
  theme: SharedThemePreference
): void {
  storage?.setItem(sharedThemeStorageKey, theme);
  storage?.setItem(legacyProtectedThemeStorageKey, theme);
}

export function resolveBrowserThemePreference(fallback: SharedThemePreference = "dark"): SharedThemePreference {
  if (typeof window === "undefined") {
    return fallback;
  }

  return resolveStoredThemePreference(window.localStorage, fallback);
}

export function persistBrowserThemePreference(theme: SharedThemePreference): void {
  if (typeof window === "undefined") {
    return;
  }

  persistStoredThemePreference(window.localStorage, theme);
}

export function resolveThemePreferenceFromLightFlag(isLightTheme: boolean): SharedThemePreference {
  return isLightTheme ? "light" : "dark";
}

export function buildMarketplaceHrefForTheme(theme: SharedThemePreference, route: string): string {
  const prefix = buildPublicPrefix(theme === "light", false);

  if (route === "/") {
    return prefix || "/";
  }

  return withPublicPathPrefix(prefix, route);
}
