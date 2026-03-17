"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/src/lib/utils";

export interface SideNavItem {
  href: string;
  label: string;
}

interface SideNavProps {
  heading: string;
  items: SideNavItem[];
  activeHref: string;
}

export function SideNav({ heading, items, activeHref }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{heading}</p>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = activeHref === item.href || pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
