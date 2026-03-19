"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildWorkspaceNavigationItems, buildWorkspaceRelatedLinks } from "@/src/lib/routing/workspaceNavigation";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";
import { type ProtectedTopbarMessages, type WorkspaceShellMessages } from "@/src/lib/i18n/protectedMessages";

import { WorkspaceTopbar } from "./WorkspaceTopbar";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";

interface WorkspaceShellProps {
  children: ReactNode;
  session: SessionContext;
  workspaceMessages: WorkspaceMessages;
  messages: {
    shell: WorkspaceShellMessages;
    topbar: ProtectedTopbarMessages;
  };
}

function matchesAppNav(pathname: string, href: string, matchPrefixes?: string[]) {
  const prefixes = matchPrefixes || [href];
  return prefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)));
}

function matchesWorkspaceRoute(pathname: string, href: string) {
  if (href === "/workspace") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({ children, session, workspaceMessages, messages }: WorkspaceShellProps) {
  const pathname = usePathname();
  const workspaceNavigationItems = buildWorkspaceNavigationItems(workspaceMessages);
  const workspaceRelatedLinks = buildWorkspaceRelatedLinks(workspaceMessages);
  const activeWorkspaceItem = workspaceNavigationItems.find((item) => matchesWorkspaceRoute(pathname, item.href)) || workspaceNavigationItems[0];
  const brandSubtitle = activeWorkspaceItem.description || `${activeWorkspaceItem.label} ${messages.shell.brandSubtitleSuffix}`;

  return (
    <ProtectedConsoleShell
      key={pathname}
      scope="workspace-shell"
      shellTestId="workspace-shell"
      sideNavTestId="workspace-side-nav"
      renderHeader={({ openSidebar, isSidebarOpen, theme, setTheme }) => (
        <WorkspaceTopbar
          pathname={pathname}
          session={session}
          brandTitle="SkillsIndex"
          brandSubtitle={brandSubtitle}
          messages={messages.topbar}
          workspaceMessages={workspaceMessages}
          theme={theme}
          onThemeChange={setTheme}
          onOpenNavigation={openSidebar}
          navigationToggleLabel="Open workspace navigation"
          navigationToggleTestId="workspace-topbar-menu-trigger"
          navigationToggleControlsId="workspace-shell-drawer-panel"
          navigationToggleExpanded={isSidebarOpen}
        />
      )}
      sidebar={
        <>
          <section className="workspace-shell-panel">
            <p className="workspace-shell-panel-title">{messages.shell.deckTitle}</p>
            <p className="workspace-shell-panel-copy">
              {messages.shell.deckDescription}
            </p>
            <div className="workspace-shell-side-list">
              {workspaceNavigationItems.map((item) => {
                const isActive = matchesWorkspaceRoute(pathname, item.href);

                return (
                  <Link key={item.href} href={item.href} className={cn("workspace-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="workspace-shell-side-link-note">
                      {item.description || item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="workspace-shell-panel">
            <p className="workspace-shell-panel-title">{messages.shell.connectedSurfacesTitle}</p>
            <p className="workspace-shell-panel-copy">
              {messages.shell.connectedSurfacesDescription}
            </p>
            <div className="workspace-shell-side-list" data-testid="workspace-related-nav">
              {workspaceRelatedLinks.map((item) => {
                const isActive = matchesAppNav(pathname, item.href, item.href === "/" ? ["/", "/search", "/results"] : undefined);

                return (
                  <Link key={item.href} href={item.href} className={cn("workspace-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="workspace-shell-side-link-note">{item.description || item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      }
      mainClassName="workspace-shell-main"
    >
      {children}
    </ProtectedConsoleShell>
  );
}
