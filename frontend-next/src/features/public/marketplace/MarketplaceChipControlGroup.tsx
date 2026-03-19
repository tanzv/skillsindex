"use client";

import Link from "next/link";

import { cn } from "@/src/lib/utils";

interface MarketplaceChipControlItem {
  key: string;
  href: string;
  label: string;
  isActive?: boolean;
  secondaryLabel?: string | number;
}

interface MarketplaceChipControlGroupProps {
  label: string;
  items: MarketplaceChipControlItem[];
  ariaLabel?: string;
  role?: string;
  className?: string;
  rowClassName?: string;
  inline?: boolean;
}

export function MarketplaceChipControlGroup({
  label,
  items,
  ariaLabel,
  role,
  className,
  rowClassName,
  inline = false
}: MarketplaceChipControlGroupProps) {
  return (
    <section
      className={cn("marketplace-control-group", inline && "is-inline", className)}
      aria-label={ariaLabel || label}
      role={role}
    >
      <span className="marketplace-control-label">{label}</span>
      <div className={cn("marketplace-chip-control-row", rowClassName)}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.isActive ? "page" : undefined}
            className={`marketplace-chip-control${item.isActive ? " is-active" : ""}`}
          >
            <span>{item.label}</span>
            {item.secondaryLabel !== undefined ? <span>{item.secondaryLabel}</span> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
