import "../../protected-shell-route.scss";
import "../../workspace-shell-route.scss";
import type { ReactNode } from "react";

import { WorkspaceShell } from "@/src/components/shared/WorkspaceShell";
import { loadProtectedLayoutContext } from "@/src/features/protected/loadProtectedLayoutContext";
import { ProtectedI18nProvider } from "@/src/lib/i18n/ProtectedI18nProvider";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { session, locale, messages, pageMessages } = await loadProtectedLayoutContext("/workspace");

  return (
    <ProtectedI18nProvider locale={locale} messages={pageMessages}>
      <WorkspaceShell
        session={session}
        workspaceMessages={pageMessages.workspace}
        messages={{ shell: messages.workspaceShell, navigation: messages.adminNavigation, topbar: messages.topbar }}
      >
        {children}
      </WorkspaceShell>
    </ProtectedI18nProvider>
  );
}
