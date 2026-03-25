export type PublicLocale = "en" | "zh";

export const publicLocaleCookieName = "skillsindex_locale";
export const publicLocaleStorageKey = "skillsindex.locale";
export const defaultPublicLocale: PublicLocale = "zh";

interface PublicLocaleStorageWriter {
  setItem(key: string, value: string): void;
}

interface PublicLocaleDocumentRef {
  cookie: string;
  documentElement?: {
    lang: string;
  } | null;
}

interface PublicLocaleLocationRef {
  pathname: string;
  search: string;
  hash: string;
  assign(url: string): void;
}

export function normalizePublicLocale(rawValue: string | null | undefined): PublicLocale {
  if (rawValue === "en" || rawValue === "zh") {
    return rawValue;
  }

  return defaultPublicLocale;
}

export function resolvePreferredPublicLocale(acceptLanguage: string | null | undefined): PublicLocale {
  const normalized = String(acceptLanguage || "").toLowerCase();
  if (normalized.includes("zh")) {
    return "zh";
  }
  if (normalized.includes("en")) {
    return "en";
  }
  return defaultPublicLocale;
}

export function formatPublicDate(dateValue: string, locale: PublicLocale): string {
  return new Date(dateValue).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function persistBrowserPublicLocale(
  locale: PublicLocale,
  storage: PublicLocaleStorageWriter | null | undefined,
  documentRef: PublicLocaleDocumentRef | null | undefined
): PublicLocale {
  const normalizedLocale = normalizePublicLocale(locale);

  storage?.setItem(publicLocaleStorageKey, normalizedLocale);

  if (documentRef) {
    documentRef.cookie = `${publicLocaleCookieName}=${normalizedLocale}; path=/; max-age=31536000; samesite=lax`;
    if (documentRef.documentElement) {
      documentRef.documentElement.lang = normalizedLocale;
    }
  }

  return normalizedLocale;
}

export function buildBrowserLocaleReloadTarget(locationRef: PublicLocaleLocationRef): string {
  return `${locationRef.pathname}${locationRef.search}${locationRef.hash}`;
}

export function applyBrowserPublicLocale(
  locale: PublicLocale,
  options: {
    storage?: PublicLocaleStorageWriter | null;
    documentRef?: PublicLocaleDocumentRef | null;
    locationRef?: PublicLocaleLocationRef | null;
  } = {}
): PublicLocale {
  const normalizedLocale = persistBrowserPublicLocale(locale, options.storage, options.documentRef);

  if (options.locationRef) {
    options.locationRef.assign(buildBrowserLocaleReloadTarget(options.locationRef));
  }

  return normalizedLocale;
}
