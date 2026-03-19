import type { ReactNode } from "react";

import { WorkspaceShell } from "@/src/components/shared/WorkspaceShell";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";
import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const session = await getServerSessionContext();
  const locale = await resolveServerLocale();
  const messages = await loadProtectedMessages(locale);
  const pageMessages = await loadProtectedPageMessages(locale);
  requireRouteSession(session, "/workspace");

  return (
    <ProtectedI18nProvider locale={locale} messages={pageMessages}>
      <WorkspaceShell
        session={session}
        workspaceMessages={pageMessages.workspace}
        messages={{ shell: messages.workspaceShell, topbar: messages.topbar }}
      >
        {children}
      </WorkspaceShell>
    </ProtectedI18nProvider>
  );
}
