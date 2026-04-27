import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import {
  normalizePublicLocale,
  publicLocaleCookieName,
  resolvePreferredPublicLocale
} from "@/src/lib/i18n/publicLocale";
import { resolveThemePreferenceFromCookieValue, sharedThemeCookieName } from "@/src/lib/theme/sharedThemePreference";
import "./globals.css";
import "./system-status-page.scss";

export const metadata: Metadata = {
  title: "SkillsIndex",
  description: "Next.js migration workspace for SkillsIndex.",
  icons: {
    icon: [
      { url: "/brand/skillsindex-tab-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/brand/skillsindex-tab-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/brand/skillsindex-tab-light.svg"]
  }
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const locale = normalizePublicLocale(
    cookieStore.get(publicLocaleCookieName)?.value || resolvePreferredPublicLocale(requestHeaders.get("accept-language"))
  );
  const theme = resolveThemePreferenceFromCookieValue(cookieStore.get(sharedThemeCookieName)?.value);

  return (
    <html lang={locale} data-shared-theme={theme}>
      <body data-shared-theme={theme}>{children}</body>
    </html>
  );
}
