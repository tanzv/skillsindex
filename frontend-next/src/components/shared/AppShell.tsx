import Link from "next/link";
import type { ReactNode } from "react";

import { TopNav, type TopNavItem } from "@/src/components/navigation/TopNav";
import { SideNav, type SideNavItem } from "@/src/components/navigation/SideNav";
import { cn } from "@/src/lib/utils";

interface AppShellProps {
  brandTitle: string;
  brandSubtitle: string;
  homeHref: string;
  topNavItems: TopNavItem[];
  activeTopNavHref?: string;
  sideNavHeading?: string;
  sideNavItems?: SideNavItem[];
  activeSideNavHref?: string;
  quickActions?: ReactNode;
  children: ReactNode;
  sidebarMode?: "none" | "secondary";
}

export function AppShell({
  brandTitle,
  brandSubtitle,
  homeHref,
  topNavItems,
  activeTopNavHref,
  sideNavHeading = "Section",
  sideNavItems = [],
  activeSideNavHref = "",
  quickActions,
  children,
  sidebarMode = "none"
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Link href={homeHref} className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              SkillsIndex
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{brandTitle}</h1>
              <p className="text-sm text-slate-500">{brandSubtitle}</p>
            </div>
          </div>
          <TopNav items={topNavItems} activeHref={activeTopNavHref} />
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div
          className={cn("grid gap-6", sidebarMode === "secondary" ? "lg:grid-cols-[280px_minmax(0,1fr)]" : "lg:grid-cols-1")}
        >
          {sidebarMode === "secondary" ? (
            <SideNav heading={sideNavHeading} items={sideNavItems} activeHref={activeSideNavHref} />
          ) : null}
          <main className="space-y-6">
            {quickActions ? <div className="flex flex-wrap items-center gap-3">{quickActions}</div> : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
