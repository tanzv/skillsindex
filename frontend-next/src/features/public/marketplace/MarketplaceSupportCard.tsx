"use client";

import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

interface MarketplaceSupportCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  testId?: string;
}

export function MarketplaceSupportCard({
  title,
  description,
  children,
  headerAction,
  className,
  testId
}: MarketplaceSupportCardProps) {
  return (
    <section className={cn("marketplace-section-card", className)} data-testid={testId}>
      <div className={cn("marketplace-section-header", headerAction && "marketplace-support-card-header")}>
        <div className={cn(headerAction && "marketplace-support-card-copy")}>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {headerAction ? <div className="marketplace-support-card-action">{headerAction}</div> : null}
      </div>
      {children}
    </section>
  );
}
