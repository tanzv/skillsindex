"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { workspaceNavigationItems, workspaceRelatedLinks } from "@/src/lib/routing/workspaceNavigation";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";

import { WorkspaceTopbar } from "./WorkspaceTopbar";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";

interface WorkspaceShellProps {
  children: ReactNode;
  session: SessionContext;
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

export function WorkspaceShell({ children, session }: WorkspaceShellProps) {
  const pathname = usePathname();
  const activeWorkspaceItem = workspaceNavigationItems.find((item) => matchesWorkspaceRoute(pathname, item.href)) || workspaceNavigationItems[0];
  const displayName = session.user?.displayName || session.user?.username || "Guest User";
  const role = session.user?.role || "guest";
  const status = session.user?.status || "visitor";
  const brandSubtitle = activeWorkspaceItem.description || `${activeWorkspaceItem.label} command surface aligned with the prototype workspace hierarchy.`;

  return (
    <ProtectedConsoleShell
      scope="workspace-shell"
      shellTestId="workspace-shell"
      sideNavTestId="workspace-side-nav"
      header={<WorkspaceTopbar pathname={pathname} session={session} brandTitle="SkillsIndex" brandSubtitle={brandSubtitle} />}
      sidebar={
        <>
          <section className="workspace-shell-panel">
            <p className="workspace-shell-panel-title">Workspace Deck</p>
            <p className="workspace-shell-panel-copy">
              Command routes keep the same navigation flow as the original workspace center and stay aligned with the
              authenticated dashboard hierarchy.
            </p>
            <div className="workspace-shell-side-list">
              {workspaceNavigationItems.map((item) => {
                const isActive = matchesWorkspaceRoute(pathname, item.href);

                return (
                  <Link key={item.href} href={item.href} className={cn("workspace-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="workspace-shell-side-link-note">
                      {item.description || item.href.replace("/workspace", "") || "/overview"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="workspace-shell-panel">
            <p className="workspace-shell-panel-title">Connected Surfaces</p>
            <p className="workspace-shell-panel-copy">
              Workspace actions branch into marketplace discovery, governed admin controls, and account management.
            </p>
            <div className="workspace-shell-side-list" data-testid="workspace-related-nav">
              {workspaceRelatedLinks.map((item) => {
                const isActive = matchesAppNav(pathname, item.href, item.href === "/" ? ["/", "/search", "/results"] : undefined);

                return (
                  <Link key={item.href} href={item.href} className={cn("workspace-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="workspace-shell-side-link-note">{item.description || item.href}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="workspace-shell-panel">
            <p className="workspace-shell-panel-title">Current Session</p>
            <div className="workspace-shell-panel-list">
              <span className="workspace-shell-chip is-primary">{displayName}</span>
              <span className="workspace-shell-chip">{role}</span>
              <span className="workspace-shell-chip">{status}</span>
              <span className="workspace-shell-chip is-mono">{session.marketplacePublicAccess ? "marketplace:public" : "marketplace:restricted"}</span>
              <p className="workspace-shell-panel-copy">
                Marketplace access: {session.marketplacePublicAccess ? "public" : "restricted"}
              </p>
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
