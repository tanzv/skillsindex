"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { SessionContext } from "@/src/lib/schemas/session";
import {
  type AdminNavigationMessages,
  type AdminShellMessages,
  type ProtectedTopbarMessages
} from "@/src/lib/i18n/protectedMessages";
import {
  buildAdminShellNavigationRegistry,
  buildProtectedTopbarConfigFromRegistry,
  resolveProtectedBrandSubtitle,
  resolveProtectedNavigationSidebarState
} from "@/src/lib/navigation/protectedNavigationRegistry";
import { marketplaceHomeRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { buildMarketplaceHrefForTheme } from "@/src/lib/theme/sharedThemePreference";

import { buildAccountCenterMenuConfig, buildAdminAccountCenterMenuConfig } from "./protectedTopbarConfigs";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";
import { ProtectedSectionSidebar } from "./ProtectedSectionSidebar";
import { ProtectedTopbar } from "./ProtectedTopbar";

interface AdminShellProps {
  children: ReactNode;
  session: SessionContext;
  messages: {
    shell: AdminShellMessages;
    navigation: AdminNavigationMessages;
    topbar: ProtectedTopbarMessages;
    workspace: WorkspaceMessages;
  };
}

export function AdminShell({ children, session, messages }: AdminShellProps) {
  const pathname = usePathname();
  const registry = buildAdminShellNavigationRegistry({
    adminNavigation: messages.navigation,
    workspacePage: messages.workspace
  });
  const sidebarState = resolveProtectedNavigationSidebarState(pathname, registry);
  const accountCenterMenu = sidebarState.activeModule.accountCenterVariant === "admin"
    ? buildAdminAccountCenterMenuConfig(messages.topbar, messages.navigation)
    : buildAccountCenterMenuConfig(messages.topbar);

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
          brandSubtitle={resolveProtectedBrandSubtitle(pathname, registry, messages.shell.brandSubtitleSuffix)}
          brandHref={sidebarState.activeModule.topLevel.href}
          config={buildProtectedTopbarConfigFromRegistry(
            pathname,
            registry,
            {
              primaryGroupLabel: messages.navigation.topbarPrimaryGroupLabel,
              primaryGroupTag: messages.navigation.topbarPrimaryGroupTag,
              overflowTitle: messages.navigation.topbarOverflowTitle,
              overflowHint: messages.navigation.topbarOverflowHint,
              overflowPrimaryTitle: messages.navigation.topbarOverflowPrimaryTitle
            },
            messages.topbar
          )}
          accountCenterMenu={accountCenterMenu}
          dataTestId="admin-topbar"
          navigationAriaLabel={messages.topbar.navigationAriaLabelAdmin}
          messages={messages.topbar}
          utilityLink={{ href: buildMarketplaceHrefForTheme(theme, marketplaceHomeRoute), label: messages.topbar.marketplaceLinkLabel }}
          accountMenuTriggerVariant="avatar"
          theme={theme}
          onThemeChange={setTheme}
          onOpenNavigation={openSidebar}
          navigationToggleLabel="Open admin navigation"
          navigationToggleTestId="admin-topbar-menu-trigger"
          navigationToggleControlsId="admin-shell-drawer-panel"
          navigationToggleExpanded={isSidebarOpen}
        />
      )}
      sidebar={(
        <ProtectedSectionSidebar
          scope="admin-shell"
          title={sidebarState.activeModule.sidebar.title}
          description={sidebarState.activeModule.sidebar.description}
          groups={sidebarState.groups.map((group) => ({
            id: group.id,
            title: group.title,
            items: group.items.map((item) => ({
              id: item.id,
              href: item.href,
              label: item.label,
              note: item.description || item.label,
              active: item.active
            }))
          }))}
          dataTestId="admin-secondary-sidebar"
        />
      )}
    >
      {children}
    </ProtectedConsoleShell>
  );
}
