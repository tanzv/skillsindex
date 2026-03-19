"use client";

import type { MouseEventHandler, ReactNode } from "react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { cn } from "@/src/lib/utils";

export interface MarketplaceSupportLinkItem {
  key?: string;
  href: string;
  label: ReactNode;
  meta?: ReactNode;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

interface MarketplaceSupportLinkListProps {
  items: MarketplaceSupportLinkItem[];
  className?: string;
  itemClassName?: string;
  testId?: string;
}

export function MarketplaceSupportLinkList({
  items,
  className,
  itemClassName,
  testId
}: MarketplaceSupportLinkListProps) {
  return (
    <div className={cn("marketplace-simple-link-list", className)} data-testid={testId}>
      {items.map((item, index) => (
        <PublicLink
          key={item.key || `${item.href}-${index}`}
          href={item.href}
          aria-current={item.isActive ? "page" : undefined}
          onClick={item.onClick}
          className={cn("marketplace-simple-link-item", item.isActive && "is-active", itemClassName)}
        >
          <span className="marketplace-sidebar-link">{item.label}</span>
          {item.meta !== undefined && item.meta !== null ? (
            <span className="marketplace-meta-text">{item.meta}</span>
          ) : null}
        </PublicLink>
      ))}
    </div>
  );
}
