import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { appCopy } from "../App.copy";
import { loginPageCopy } from "../pages/login/LoginPage.copy";
import { marketplaceHomeCopy } from "../pages/marketplaceHome/MarketplaceHomePage.copy";

export type AppLocale = "en" | "zh";

const defaultLocale: AppLocale = "zh";
export const localeStorageKey = "skillsindex.locale";

let i18nInitialized = false;

const i18nResources = {
  en: {
    translation: {
      app: appCopy.en,
      login: loginPageCopy.en,
      marketplace: marketplaceHomeCopy.en
    }
  },
  zh: {
    translation: {
      app: appCopy.zh,
      login: loginPageCopy.zh,
      marketplace: marketplaceHomeCopy.zh
    }
  }
};

export function normalizeLocale(raw: string | null | undefined): AppLocale {
  if (raw === "en" || raw === "zh") {
    return raw;
  }
  return defaultLocale;
}

export function readStoredLocale(storageKey: string = localeStorageKey): AppLocale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }
  const value = window.localStorage.getItem(storageKey);
  return normalizeLocale(value);
}

export function ensureI18nInitialized() {
  if (i18nInitialized) {
    return i18next;
  }

  i18next.use(initReactI18next).init({
    resources: i18nResources,
    lng: readStoredLocale(),
    fallbackLng: defaultLocale,
    supportedLngs: ["en", "zh"],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

  i18nInitialized = true;
  return i18next;
}

export async function changeLocale(nextLocale: AppLocale): Promise<AppLocale> {
  const normalizedLocale = normalizeLocale(nextLocale);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(localeStorageKey, normalizedLocale);
  }

  const i18nInstance = ensureI18nInitialized();
  if (i18nInstance.resolvedLanguage !== normalizedLocale) {
    await i18nInstance.changeLanguage(normalizedLocale);
  }
  return normalizedLocale;
}

export function resolveActiveLocale(): AppLocale {
  const i18nInstance = ensureI18nInitialized();
  return normalizeLocale(i18nInstance.resolvedLanguage || i18nInstance.language);
}
