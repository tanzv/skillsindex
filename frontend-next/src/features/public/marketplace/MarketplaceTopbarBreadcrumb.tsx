"use client";

import { Fragment } from "react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { cn } from "@/src/lib/utils";

export interface MarketplaceTopbarBreadcrumbItem {
  href?: string;
  label: string;
  isCurrent?: boolean;
  isSoft?: boolean;
}

interface MarketplaceTopbarBreadcrumbProps {
  ariaLabel: string;
  items: MarketplaceTopbarBreadcrumbItem[];
  className?: string;
  testId?: string;
}

export function MarketplaceTopbarBreadcrumb({
  ariaLabel,
  items,
  className,
  testId
}: MarketplaceTopbarBreadcrumbProps) {
  return (
    <nav className={cn("marketplace-breadcrumb", className)} aria-label={ariaLabel} data-testid={testId}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = item.isCurrent || isLast;

        return (
          <Fragment key={`${item.label}-${index}`}>
            {item.href && !isCurrent ? (
              <PublicLink href={item.href} className="marketplace-breadcrumb-link">
                {item.label}
              </PublicLink>
            ) : (
              <span className={cn("marketplace-breadcrumb-current", item.isSoft && "is-soft")}>{item.label}</span>
            )}

            {!isLast ? <span className="marketplace-breadcrumb-separator">/</span> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
