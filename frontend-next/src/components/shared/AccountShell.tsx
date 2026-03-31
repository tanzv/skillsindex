"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { SessionContext } from "@/src/lib/schemas/session";
import {
  type AccountShellMessages,
  type AdminNavigationMessages,
  type ProtectedTopbarMessages
} from "@/src/lib/i18n/protectedMessages";
import {
  buildAccountShellNavigationRegistry,
  buildProtectedTopbarConfigFromRegistry,
  resolveProtectedBrandSubtitle,
  resolveProtectedNavigationSidebarState
} from "@/src/lib/navigation/protectedNavigationRegistry";
import { marketplaceHomeRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { buildMarketplaceHrefForTheme, type SharedThemePreference } from "@/src/lib/theme/sharedThemePreference";

import { buildAccountCenterMenuConfig, buildAdminAccountCenterMenuConfig } from "./protectedTopbarConfigs";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";
import { ProtectedSectionSidebar } from "./ProtectedSectionSidebar";
import { ProtectedTopbar } from "./ProtectedTopbar";

interface AccountShellProps {
  children: ReactNode;
  initialTheme: SharedThemePreference;
  session: SessionContext;
  messages: {
    shell: AccountShellMessages;
    navigation: AdminNavigationMessages;
    topbar: ProtectedTopbarMessages;
    workspace: WorkspaceMessages;
  };
}

export function AccountShell({ children, initialTheme, session, messages }: AccountShellProps) {
  const pathname = usePathname();
  const registry = buildAccountShellNavigationRegistry({
    adminNavigation: messages.navigation,
    workspacePage: messages.workspace,
    accountShell: messages.shell
  });
  const sidebarState = resolveProtectedNavigationSidebarState(pathname, registry);
  const accountCenterMenu = sidebarState.activeModule.accountCenterVariant === "admin"
    ? buildAdminAccountCenterMenuConfig(messages.topbar, messages.navigation)
    : buildAccountCenterMenuConfig(messages.topbar);

  return (
    <ProtectedConsoleShell
      key={pathname}
      initialTheme={initialTheme}
      scope="account-shell"
      shellTestId="account-shell"
      sideNavTestId="account-side-nav"
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
              overflowTitle: messages.shell.topbarOverflowTitle,
              overflowHint: messages.shell.topbarOverflowHint,
              overflowPrimaryTitle: messages.navigation.topbarOverflowPrimaryTitle
            },
            messages.topbar
          )}
          accountCenterMenu={accountCenterMenu}
          dataTestId="account-topbar"
          navigationAriaLabel={messages.topbar.navigationAriaLabelAccount}
          messages={messages.topbar}
          utilityLink={{ href: buildMarketplaceHrefForTheme(theme, marketplaceHomeRoute), label: messages.topbar.marketplaceLinkLabel }}
          accountMenuTriggerVariant="avatar"
          theme={theme}
          onThemeChange={setTheme}
          onOpenNavigation={openSidebar}
          navigationToggleLabel="Open account navigation"
          navigationToggleTestId="account-topbar-menu-trigger"
          navigationToggleControlsId="account-shell-drawer-panel"
          navigationToggleExpanded={isSidebarOpen}
        />
      )}
      sidebar={(
        <ProtectedSectionSidebar
          scope="account-shell"
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
          dataTestId="account-secondary-sidebar"
        />
      )}
    >
      {children}
    </ProtectedConsoleShell>
  );
}
