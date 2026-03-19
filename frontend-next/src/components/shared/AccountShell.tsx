"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildAccountNavigationItems } from "@/src/lib/routing/accountNavigation";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";
import { type AccountShellMessages, type AdminNavigationMessages, type ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";

import { buildAccountCenterMenuConfig, buildAccountProtectedTopbarConfig } from "./protectedTopbarConfigs";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";
import { ProtectedTopbar } from "./ProtectedTopbar";

interface AccountShellProps {
  children: ReactNode;
  session: SessionContext;
  messages: {
    shell: AccountShellMessages;
    navigation: AdminNavigationMessages;
    topbar: ProtectedTopbarMessages;
  };
}

export function AccountShell({ children, session, messages }: AccountShellProps) {
  const pathname = usePathname();
  const accountNavigationItems = buildAccountNavigationItems(messages.shell);
  const activeAccountItem = accountNavigationItems.find((item) => item.href === pathname) || accountNavigationItems[0];

  return (
    <ProtectedConsoleShell
      key={pathname}
      scope="account-shell"
      shellTestId="account-shell"
      sideNavTestId="account-side-nav"
      renderHeader={({ openSidebar, isSidebarOpen, theme, setTheme }) => (
        <ProtectedTopbar
          pathname={pathname}
          session={session}
          brandTitle="SkillsIndex"
          brandSubtitle={`${activeAccountItem.label} ${messages.shell.brandSubtitleSuffix}`}
          brandHref="/account/profile"
          config={buildAccountProtectedTopbarConfig(messages.navigation, messages.shell, messages.topbar)}
          accountCenterMenu={buildAccountCenterMenuConfig(messages.topbar)}
          dataTestId="account-topbar"
          navigationAriaLabel={messages.topbar.navigationAriaLabelAccount}
          messages={messages.topbar}
          utilityLink={{ href: "/", label: messages.topbar.marketplaceLinkLabel }}
          theme={theme}
          onThemeChange={setTheme}
          onOpenNavigation={openSidebar}
          navigationToggleLabel="Open account navigation"
          navigationToggleTestId="account-topbar-menu-trigger"
          navigationToggleControlsId="account-shell-drawer-panel"
          navigationToggleExpanded={isSidebarOpen}
        />
      )}
      sidebar={
        <>
          <section className="account-shell-panel">
            <p className="account-shell-panel-title">{messages.shell.sectionsTitle}</p>
            <div className="account-shell-side-list">
              {accountNavigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link key={item.href} href={item.href} className={cn("account-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="account-shell-side-link-note">{item.description || item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      }
    >
      {children}
    </ProtectedConsoleShell>
  );
}
