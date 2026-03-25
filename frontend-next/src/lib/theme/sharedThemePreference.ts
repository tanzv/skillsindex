import { buildPublicPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";

export type SharedThemePreference = "light" | "dark";

export const sharedThemeStorageKey = "skillsindex.theme";
export const legacyProtectedThemeStorageKey = "skillsindex.protected.theme";
export const sharedThemeCookieName = sharedThemeStorageKey;

const sharedThemeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

interface ThemeStorageReader {
  getItem(key: string): string | null;
}

interface ThemeStorageWriter {
  setItem(key: string, value: string): void;
}

interface ThemeCookieDocument {
  cookie: string;
}

function normalizeThemePreference(value: string | null | undefined): SharedThemePreference | null {
  return value === "light" || value === "dark" ? value : null;
}

export function resolveThemePreferenceFromCookieValue(
  value: string | null | undefined,
  fallback: SharedThemePreference = "dark"
): SharedThemePreference {
  return normalizeThemePreference(value) ?? fallback;
}

export function resolveThemePreferenceFromCookieHeader(
  cookieHeader: string | null | undefined,
  fallback: SharedThemePreference = "dark"
): SharedThemePreference {
  if (!cookieHeader) {
    return fallback;
  }

  for (const cookieSegment of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookieSegment.split("=");

    if (rawName?.trim() !== sharedThemeCookieName) {
      continue;
    }

    return resolveThemePreferenceFromCookieValue(decodeURIComponent(rawValueParts.join("=").trim()), fallback);
  }

  return fallback;
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

export function persistThemePreferenceCookie(
  documentRef: ThemeCookieDocument | null | undefined,
  theme: SharedThemePreference
): void {
  if (!documentRef) {
    return;
  }

  documentRef.cookie =
    `${sharedThemeCookieName}=${encodeURIComponent(theme)}; Max-Age=${sharedThemeCookieMaxAgeSeconds}; Path=/; SameSite=Lax`;
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
  persistThemePreferenceCookie(document, theme);
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
