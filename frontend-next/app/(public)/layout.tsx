import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { PublicShell } from "@/src/components/shared/PublicShell";
import { PublicI18nProvider } from "@/src/features/public/i18n/PublicI18nProvider";
import { PublicViewerSessionProvider } from "@/src/features/public/PublicViewerSessionProvider";
import { getServerSessionContext, isAuthenticatedSession } from "@/src/lib/auth/session";
import { loadPublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages.server";
import {
  normalizePublicLocale,
  publicLocaleCookieName,
  resolvePreferredPublicLocale
} from "@/src/lib/i18n/publicLocale";
import { PublicRoutePathProvider } from "@/src/lib/routing/PublicRoutePathProvider";

interface PublicLayoutProps {
  children: ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const resolvedPublicPathname = requestHeaders.get("x-public-original-pathname") || "/";
  const session = await getServerSessionContext();
  const locale = normalizePublicLocale(
    cookieStore.get(publicLocaleCookieName)?.value || resolvePreferredPublicLocale(requestHeaders.get("accept-language"))
  );
  const messages = await loadPublicMarketplaceMessages(locale);

  return (
    <PublicRoutePathProvider pathname={resolvedPublicPathname}>
      <PublicViewerSessionProvider isAuthenticated={isAuthenticatedSession(session)}>
        <PublicI18nProvider locale={locale} messages={messages}>
          <PublicShell>{children}</PublicShell>
        </PublicI18nProvider>
      </PublicViewerSessionProvider>
    </PublicRoutePathProvider>
  );
}
