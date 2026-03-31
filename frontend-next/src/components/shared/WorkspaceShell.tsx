"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { SessionContext } from "@/src/lib/schemas/session";
import {
  type AdminNavigationMessages,
  type ProtectedTopbarMessages,
  type WorkspaceShellMessages
} from "@/src/lib/i18n/protectedMessages";
import {
  buildWorkspaceShellNavigationRegistry,
  buildProtectedTopbarConfigFromRegistry,
  resolveProtectedBrandSubtitle,
  resolveProtectedNavigationSidebarState
} from "@/src/lib/navigation/protectedNavigationRegistry";
import { marketplaceHomeRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { buildMarketplaceHrefForTheme, type SharedThemePreference } from "@/src/lib/theme/sharedThemePreference";

import { buildAccountCenterMenuConfig } from "./protectedTopbarConfigs";
import { ProtectedSectionSidebar } from "./ProtectedSectionSidebar";
import { ProtectedTopbar } from "./ProtectedTopbar";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";

interface WorkspaceShellProps {
  children: ReactNode;
  initialTheme: SharedThemePreference;
  session: SessionContext;
  workspaceMessages: WorkspaceMessages;
  messages: {
    shell: WorkspaceShellMessages;
    navigation: AdminNavigationMessages;
    topbar: ProtectedTopbarMessages;
  };
}

export function WorkspaceShell({ children, initialTheme, session, workspaceMessages, messages }: WorkspaceShellProps) {
  const pathname = usePathname();
  const registry = buildWorkspaceShellNavigationRegistry({
    adminNavigation: messages.navigation,
    workspacePage: workspaceMessages,
    workspaceShell: messages.shell
  });
  const sidebarState = resolveProtectedNavigationSidebarState(pathname, registry);
  const brandSubtitle = resolveProtectedBrandSubtitle(pathname, registry, messages.shell.brandSubtitleSuffix);

  return (
    <ProtectedConsoleShell
      key={pathname}
      initialTheme={initialTheme}
      scope="workspace-shell"
      shellTestId="workspace-shell"
      sideNavTestId="workspace-side-nav"
      renderHeader={({ openSidebar, isSidebarOpen, theme, setTheme }) => (
        <ProtectedTopbar
          pathname={pathname}
          session={session}
          brandTitle="SkillsIndex"
          brandSubtitle={brandSubtitle}
          brandHref={sidebarState.activeModule.topLevel.href}
          config={buildProtectedTopbarConfigFromRegistry(
            pathname,
            registry,
            {
              primaryGroupLabel: workspaceMessages.topbarPrimaryGroupLabel,
              primaryGroupTag: workspaceMessages.topbarPrimaryGroupTag,
              overflowTitle: workspaceMessages.topbarOverflowTitle,
              overflowHint: workspaceMessages.topbarOverflowHint,
              overflowPrimaryTitle: workspaceMessages.topbarOverflowAppSectionsTitle
            },
            messages.topbar
          )}
          accountCenterMenu={buildAccountCenterMenuConfig(messages.topbar)}
          dataTestId="workspace-topbar"
          navigationAriaLabel={messages.topbar.navigationAriaLabelWorkspace}
          messages={messages.topbar}
          utilityLink={{ href: buildMarketplaceHrefForTheme(theme, marketplaceHomeRoute), label: messages.topbar.marketplaceLinkLabel }}
          accountMenuTriggerVariant="avatar"
          theme={theme}
          onThemeChange={setTheme}
          onOpenNavigation={openSidebar}
          navigationToggleLabel="Open workspace navigation"
          navigationToggleTestId="workspace-topbar-menu-trigger"
          navigationToggleControlsId="workspace-shell-drawer-panel"
          navigationToggleExpanded={isSidebarOpen}
        />
      )}
      sidebar={(
        <ProtectedSectionSidebar
          scope="workspace-shell"
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
          dataTestId="workspace-secondary-sidebar"
        />
      )}
      mainClassName="workspace-shell-main"
    >
      {children}
    </ProtectedConsoleShell>
  );
}
