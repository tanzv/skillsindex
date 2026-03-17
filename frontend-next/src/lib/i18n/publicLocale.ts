export type PublicLocale = "en" | "zh";

export const publicLocaleCookieName = "skillsindex_locale";
export const publicLocaleStorageKey = "skillsindex.locale";
export const defaultPublicLocale: PublicLocale = "zh";

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
