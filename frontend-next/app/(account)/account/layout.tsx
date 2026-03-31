import "../../protected-shell-route.scss";
import "../../account-shell-route.scss";
import type { ReactNode } from "react";

import { AccountShell } from "@/src/components/shared/AccountShell";
import { loadProtectedLayoutContext } from "@/src/features/protected/loadProtectedLayoutContext";
import { ProtectedI18nProvider } from "@/src/lib/i18n/ProtectedI18nProvider";
import { accountProfileRoute } from "@/src/lib/routing/protectedSurfaceLinks";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const { session, locale, theme, messages, pageMessages } = await loadProtectedLayoutContext(accountProfileRoute);

  return (
    <ProtectedI18nProvider locale={locale} messages={pageMessages}>
      <AccountShell
        initialTheme={theme}
        session={session}
        messages={{
          shell: messages.accountShell,
          navigation: messages.adminNavigation,
          topbar: messages.topbar,
          workspace: pageMessages.workspace
        }}
      >
        {children}
      </AccountShell>
    </ProtectedI18nProvider>
  );
}
