"use client";

import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

interface ProtectedConsoleShellProps {
  scope: "admin-shell" | "workspace-shell" | "account-shell";
  shellTestId: string;
  sideNavTestId: string;
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  mainClassName?: string;
}

export function ProtectedConsoleShell({
  scope,
  shellTestId,
  sideNavTestId,
  header,
  sidebar,
  children,
  mainClassName
}: ProtectedConsoleShellProps) {
  const frameClassName = `${scope}-frame`;

  return (
    <div className={cn("protected-shell-root", `${scope}-root`)} data-testid={shellTestId}>
      <header className={`${scope}-header`}>
        <div className={cn(frameClassName, `${scope}-header-row`)}>{header}</div>
      </header>

      <div className={`${scope}-body`}>
        <div className={cn(frameClassName, `${scope}-grid`)}>
          <aside className={`${scope}-sidebar`} data-testid={sideNavTestId}>
            {sidebar}
          </aside>

          <main className={mainClassName}>{children}</main>
        </div>
      </div>
    </div>
  );
}
