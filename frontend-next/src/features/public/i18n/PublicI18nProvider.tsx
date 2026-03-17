"use client";

import { createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  defaultPublicLocale,
  normalizePublicLocale,
  publicLocaleCookieName,
  publicLocaleStorageKey,
  type PublicLocale
} from "@/src/lib/i18n/publicLocale";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

interface PublicI18nContextValue {
  locale: PublicLocale;
  messages: PublicMarketplaceMessages;
  setLocale: (nextLocale: PublicLocale) => void;
}

const PublicI18nContext = createContext<PublicI18nContextValue | null>(null);

interface PublicI18nProviderProps {
  locale: PublicLocale;
  messages: PublicMarketplaceMessages;
  children: React.ReactNode;
}

export function PublicI18nProvider({ locale, messages, children }: PublicI18nProviderProps) {
  const router = useRouter();

  const value = useMemo<PublicI18nContextValue>(
    () => ({
      locale,
      messages,
      setLocale(nextLocale) {
        const normalizedLocale = normalizePublicLocale(nextLocale);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(publicLocaleStorageKey, normalizedLocale);
          document.cookie = `${publicLocaleCookieName}=${normalizedLocale}; path=/; max-age=31536000; samesite=lax`;
        }
        router.refresh();
      }
    }),
    [locale, messages, router]
  );

  return <PublicI18nContext.Provider value={value}>{children}</PublicI18nContext.Provider>;
}

export function usePublicI18n() {
  const context = useContext(PublicI18nContext);
  if (!context) {
    return {
      locale: defaultPublicLocale,
      messages: {} as PublicMarketplaceMessages,
      setLocale: () => {}
    };
  }

  return context;
}
