import "../../protected-shell-route.scss";
import "../../admin-shell-route.scss";
import type { ReactNode } from "react";

import { AdminShell } from "@/src/components/shared/AdminShell";
import { loadProtectedLayoutContext } from "@/src/features/protected/loadProtectedLayoutContext";
import { ProtectedI18nProvider } from "@/src/lib/i18n/ProtectedI18nProvider";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { session, locale, messages, pageMessages } = await loadProtectedLayoutContext("/admin/overview", {
    requireSession: false
  });

  return (
    <ProtectedI18nProvider locale={locale} messages={pageMessages}>
      <AdminShell
        session={session}
        messages={{
          shell: messages.adminShell,
          navigation: messages.adminNavigation,
          topbar: messages.topbar,
          workspace: pageMessages.workspace
        }}
      >
        {children}
      </AdminShell>
    </ProtectedI18nProvider>
  );
}
