"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildAdminNavigationGroups, resolveAdminGroup } from "@/src/lib/routing/adminNavigation";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";
import {
  type AdminNavigationMessages,
  type AdminShellMessages,
  formatProtectedMessage,
  type ProtectedTopbarMessages
} from "@/src/lib/i18n/protectedMessages";

import { buildAdminAccountCenterMenuConfig, buildAdminProtectedTopbarConfig } from "./protectedTopbarConfigs";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";
import { ProtectedTopbar } from "./ProtectedTopbar";

interface AdminShellProps {
  children: ReactNode;
  session: SessionContext;
  messages: {
    shell: AdminShellMessages;
    navigation: AdminNavigationMessages;
    topbar: ProtectedTopbarMessages;
  };
}

export function AdminShell({ children, session, messages }: AdminShellProps) {
  const pathname = usePathname();
  const navigationGroups = buildAdminNavigationGroups(messages.navigation);
  const activeGroup = resolveAdminGroup(pathname, navigationGroups);

  return (
    <ProtectedConsoleShell
      key={pathname}
      scope="admin-shell"
      shellTestId="admin-shell"
      sideNavTestId="admin-side-nav"
      renderHeader={({ openSidebar, isSidebarOpen, theme, setTheme }) => (
        <ProtectedTopbar
          pathname={pathname}
          session={session}
          brandTitle="SkillsIndex"
          brandSubtitle={`${activeGroup.label} ${messages.shell.brandSubtitleSuffix}`}
          brandHref="/admin/overview"
          config={buildAdminProtectedTopbarConfig(messages.navigation, messages.topbar)}
          accountCenterMenu={buildAdminAccountCenterMenuConfig(messages.topbar, messages.navigation)}
          dataTestId="admin-topbar"
          navigationAriaLabel={messages.topbar.navigationAriaLabelAdmin}
          messages={messages.topbar}
          utilityLink={{ href: "/", label: messages.topbar.marketplaceLinkLabel }}
          theme={theme}
          onThemeChange={setTheme}
          onOpenNavigation={openSidebar}
          navigationToggleLabel="Open admin navigation"
          navigationToggleTestId="admin-topbar-menu-trigger"
          navigationToggleControlsId="admin-shell-drawer-panel"
          navigationToggleExpanded={isSidebarOpen}
        />
      )}
      sidebar={
        <>
          <section className="admin-shell-panel">
            <p className="admin-shell-panel-title">{messages.shell.controlSectionsTitle}</p>
            <div className="admin-shell-group-list">
              {navigationGroups.map((group) => {
                const isActive = group.id === activeGroup.id;

                return (
                  <Link key={group.id} href={group.href} className={cn("admin-shell-group-link", isActive && "is-active")}>
                    <span>{group.label}</span>
                    <span className="admin-shell-group-link-note">
                      {formatProtectedMessage(messages.shell.groupRouteCount, { count: group.items.length })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="admin-shell-panel">
            <p className="admin-shell-panel-title">{activeGroup.label}</p>
            <div className="admin-shell-side-list">
              {activeGroup.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link key={item.href} href={item.href} className={cn("admin-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="admin-shell-side-link-note">{item.description || item.label}</span>
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
