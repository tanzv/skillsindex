"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigationGroups, resolveAdminGroup } from "@/src/lib/routing/adminNavigation";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";

import { adminProtectedTopbarConfig } from "./protectedTopbarConfigs";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";
import { ProtectedTopbar } from "./ProtectedTopbar";

interface AdminShellProps {
  children: ReactNode;
  session: SessionContext;
}

export function AdminShell({ children, session }: AdminShellProps) {
  const pathname = usePathname();
  const activeGroup = resolveAdminGroup(pathname);
  const displayName = session.user?.displayName || session.user?.username || "Unknown user";
  const role = session.user?.role || "guest";
  const status = session.user?.status || "inactive";

  return (
    <ProtectedConsoleShell
      scope="admin-shell"
      shellTestId="admin-shell"
      sideNavTestId="admin-side-nav"
      header={
        <ProtectedTopbar
          pathname={pathname}
          session={session}
          brandTitle="SkillsIndex"
          brandSubtitle={`${activeGroup.label} controls aligned with the governed workbench hierarchy.`}
          brandHref="/admin/overview"
          config={adminProtectedTopbarConfig}
          dataTestId="admin-topbar"
          navigationAriaLabel="Admin top navigation"
          utilityLink={{ href: "/", label: "Marketplace" }}
        />
      }
      sidebar={
        <>
          <section className="admin-shell-panel">
            <p className="admin-shell-panel-title">Control Sections</p>
            <div className="admin-shell-group-list">
              {adminNavigationGroups.map((group) => {
                const isActive = group.id === activeGroup.id;

                return (
                  <Link key={group.id} href={group.href} className={cn("admin-shell-group-link", isActive && "is-active")}>
                    <span>{group.label}</span>
                    <span className="admin-shell-group-link-note">{group.items.length} routes</span>
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
                    <span className="admin-shell-side-link-note">{item.description || item.href.replace("/admin/", "")}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="admin-shell-panel">
            <p className="admin-shell-panel-title">Current Admin</p>
            <div className="admin-shell-panel-list">
              <span className="admin-shell-chip is-primary">{displayName}</span>
              <span className="admin-shell-chip">{role}</span>
              <span className="admin-shell-chip">{status}</span>
              <p className="admin-shell-panel-copy">
                Marketplace access: {session.marketplacePublicAccess ? "public" : "restricted"}
              </p>
            </div>
          </section>
        </>
      }
    >
      {children}
    </ProtectedConsoleShell>
  );
}
