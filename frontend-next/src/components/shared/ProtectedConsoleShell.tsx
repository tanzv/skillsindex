"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

import {
  persistBrowserThemePreference,
  resolveBrowserThemePreference,
  type SharedThemePreference
} from "@/src/lib/theme/sharedThemePreference";
import { cn } from "@/src/lib/utils";

interface ProtectedConsoleShellHeaderControls {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  theme: SharedThemePreference;
  setTheme: (nextTheme: SharedThemePreference) => void;
}

interface ProtectedConsoleShellProps {
  scope: "admin-shell" | "workspace-shell" | "account-shell";
  shellTestId: string;
  sideNavTestId: string;
  renderHeader: (controls: ProtectedConsoleShellHeaderControls) => ReactNode;
  sidebar: ReactNode;
  children?: ReactNode;
  mainClassName?: string;
}

const useSynchronizedLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ProtectedConsoleShell({
  scope,
  shellTestId,
  sideNavTestId,
  renderHeader,
  sidebar,
  children,
  mainClassName
}: ProtectedConsoleShellProps) {
  const frameClassName = `${scope}-frame`;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<SharedThemePreference>("dark");
  const [hasResolvedThemePreference, setHasResolvedThemePreference] = useState(false);
  const drawerNavTestId = `${sideNavTestId}-drawer`;
  const drawerPanelId = `${shellTestId}-drawer-panel`;

  useSynchronizedLayoutEffect(() => {
    const resolvedTheme = resolveBrowserThemePreference();
    setTheme((previousTheme) => (previousTheme === resolvedTheme ? previousTheme : resolvedTheme));
    setHasResolvedThemePreference(true);
  }, []);

  useEffect(() => {
    if (!hasResolvedThemePreference) {
      return;
    }

    persistBrowserThemePreference(theme);
  }, [hasResolvedThemePreference, theme]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  const headerControls: ProtectedConsoleShellHeaderControls = {
    isSidebarOpen,
    openSidebar: () => setIsSidebarOpen(true),
    closeSidebar: () => setIsSidebarOpen(false),
    toggleSidebar: () => setIsSidebarOpen((previousValue) => !previousValue),
    theme,
    setTheme
  };

  return (
    <div
      className={cn("protected-shell-root", "protected-console-root", `${scope}-root`)}
      data-testid={shellTestId}
      data-protected-theme={theme}
    >
      <header className={cn(`${scope}-header`, "protected-console-header")}>
        <div className={cn(frameClassName, "protected-console-frame", `${scope}-header-row`, "protected-console-header-row")}>
          {renderHeader(headerControls)}
        </div>
      </header>

      <div className={cn(`${scope}-body`, "protected-console-body")}>
        <div className={cn(frameClassName, "protected-console-frame", `${scope}-grid`, "protected-console-grid")}>
          <aside className={cn(`${scope}-sidebar`, "protected-console-sidebar", "protected-console-sidebar-desktop")} data-testid={sideNavTestId}>
            {sidebar}
          </aside>

          <main className={cn("protected-console-main", mainClassName)}>{children}</main>
        </div>
      </div>

      <button
        type="button"
        className={cn("protected-console-drawer-backdrop", isSidebarOpen && "is-open")}
        aria-hidden={!isSidebarOpen}
        data-testid={`${shellTestId}-drawer-backdrop`}
        onClick={headerControls.closeSidebar}
      />

      <aside
        id={drawerPanelId}
        className={cn(`${scope}-sidebar`, "protected-console-sidebar", "protected-console-sidebar-drawer", isSidebarOpen && "is-open")}
        data-testid={drawerNavTestId}
        aria-hidden={!isSidebarOpen}
      >
        {isSidebarOpen ? sidebar : null}
      </aside>
    </div>
  );
}
