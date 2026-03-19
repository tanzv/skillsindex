import type { ReactNode } from "react";

import { AdminShell } from "@/src/components/shared/AdminShell";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";
import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSessionContext();
  const locale = await resolveServerLocale();
  const messages = await loadProtectedMessages(locale);
  const pageMessages = await loadProtectedPageMessages(locale);
  requireRouteSession(session, "/admin/overview");

  return (
    <ProtectedI18nProvider locale={locale} messages={pageMessages}>
      <AdminShell
        session={session}
        messages={{ shell: messages.adminShell, navigation: messages.adminNavigation, topbar: messages.topbar }}
      >
        {children}
      </AdminShell>
    </ProtectedI18nProvider>
  );
}
