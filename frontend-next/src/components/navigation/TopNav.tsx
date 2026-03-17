"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/src/lib/utils";

export interface TopNavItem {
  href: string;
  label: string;
  matchPrefixes?: string[];
}

interface TopNavProps {
  items: TopNavItem[];
  activeHref?: string;
}

export function TopNav({ items, activeHref }: TopNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Primary navigation">
      {items.map((item) => {
        const matchPrefixes = item.matchPrefixes || [item.href];
        const isActive =
          activeHref === item.href ||
          matchPrefixes.some((prefix) =>
            prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)
          );
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
