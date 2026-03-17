"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { accountNavigationItems } from "@/src/lib/routing/accountNavigation";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";

import { accountProtectedTopbarConfig } from "./protectedTopbarConfigs";
import { ProtectedConsoleShell } from "./ProtectedConsoleShell";
import { ProtectedTopbar } from "./ProtectedTopbar";

interface AccountShellProps {
  children: ReactNode;
  session: SessionContext;
}

export function AccountShell({ children, session }: AccountShellProps) {
  const pathname = usePathname();
  const activeAccountItem = accountNavigationItems.find((item) => item.href === pathname) || accountNavigationItems[0];
  const displayName = session.user?.displayName || session.user?.username || "Unknown user";
  const role = session.user?.role || "guest";
  const status = session.user?.status || "inactive";

  return (
    <ProtectedConsoleShell
      scope="account-shell"
      shellTestId="account-shell"
      sideNavTestId="account-side-nav"
      header={
        <ProtectedTopbar
          pathname={pathname}
          session={session}
          brandTitle="SkillsIndex"
          brandSubtitle={`${activeAccountItem.label} controls aligned with the prototype account workspace.`}
          brandHref="/account/profile"
          config={accountProtectedTopbarConfig}
          dataTestId="account-topbar"
          navigationAriaLabel="Account top navigation"
          utilityLink={{ href: "/", label: "Marketplace" }}
        />
      }
      sidebar={
        <>
          <section className="account-shell-panel">
            <p className="account-shell-panel-title">Account Sections</p>
            <div className="account-shell-side-list">
              {accountNavigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link key={item.href} href={item.href} className={cn("account-shell-side-link", isActive && "is-active")}>
                    <span>{item.label}</span>
                    <span className="account-shell-side-link-note">{item.href.replace("/account/", "")}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="account-shell-panel">
            <p className="account-shell-panel-title">Current User</p>
            <div className="account-shell-panel-list">
              <span className="account-shell-chip is-primary">{displayName}</span>
              <span className="account-shell-chip">{role}</span>
              <span className="account-shell-chip">{status}</span>
              <p className="account-shell-panel-copy">
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
