import type { ReactNode } from "react";

import { AccountShell } from "@/src/components/shared/AccountShell";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";
import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await getServerSessionContext();
  const locale = await resolveServerLocale();
  const messages = await loadProtectedMessages(locale);
  const pageMessages = await loadProtectedPageMessages(locale);
  requireRouteSession(session, "/account/profile");

  return (
    <ProtectedI18nProvider locale={locale} messages={pageMessages}>
      <AccountShell
        session={session}
        messages={{ shell: messages.accountShell, navigation: messages.adminNavigation, topbar: messages.topbar }}
      >
        {children}
      </AccountShell>
    </ProtectedI18nProvider>
  );
}
