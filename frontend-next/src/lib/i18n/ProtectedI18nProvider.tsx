"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  applyBrowserPublicLocale,
  defaultPublicLocale,
  normalizePublicLocale,
  type PublicLocale
} from "@/src/lib/i18n/publicLocale";
import type { ProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages";

interface ProtectedI18nContextValue {
  locale: PublicLocale;
  messages: ProtectedPageMessages;
  setLocale: (nextLocale: PublicLocale) => void;
}

const ProtectedI18nContext = createContext<ProtectedI18nContextValue | null>(null);

interface ProtectedI18nProviderProps {
  locale: PublicLocale;
  messages: ProtectedPageMessages;
  children?: ReactNode;
}

export function ProtectedI18nProvider({ locale, messages, children }: ProtectedI18nProviderProps) {
  const value = useMemo<ProtectedI18nContextValue>(
    () => ({
      locale,
      messages,
      setLocale(nextLocale) {
        const normalizedLocale = normalizePublicLocale(nextLocale);
        if (normalizedLocale === locale || typeof window === "undefined") {
          return;
        }

        applyBrowserPublicLocale(normalizedLocale, {
          storage: window.localStorage,
          documentRef: document,
          locationRef: window.location
        });
      }
    }),
    [locale, messages]
  );

  return <ProtectedI18nContext.Provider value={value}>{children}</ProtectedI18nContext.Provider>;
}

export function useProtectedI18n() {
  const context = useContext(ProtectedI18nContext);
  if (!context) {
    return {
      locale: defaultPublicLocale,
      messages: {} as ProtectedPageMessages,
      setLocale: () => {}
    };
  }

  return context;
}
