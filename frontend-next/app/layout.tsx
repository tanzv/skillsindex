import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import {
  normalizePublicLocale,
  publicLocaleCookieName,
  resolvePreferredPublicLocale
} from "@/src/lib/i18n/publicLocale";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillsIndex",
  description: "Next.js migration workspace for SkillsIndex."
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

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
