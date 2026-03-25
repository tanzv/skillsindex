"use client";

import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

interface MarketplaceResultsListSectionProps {
  title: string;
  description: string;
  hasResults: boolean;
  resultsContent: ReactNode;
  emptyContent: ReactNode;
  testId?: string;
  className?: string;
  headerMeta?: ReactNode;
  footerMeta?: ReactNode;
  contentClassName?: string;
}

export function MarketplaceResultsListSection({
  title,
  description,
  hasResults,
  resultsContent,
  emptyContent,
  testId,
  className,
  headerMeta,
  footerMeta,
  contentClassName
}: MarketplaceResultsListSectionProps) {
  return (
    <section className={cn("marketplace-section-card", className)} data-testid={testId}>
      <div className="marketplace-section-header">
        <h2>{title}</h2>
        <p>{description}</p>
        {headerMeta}
      </div>

      <div className={cn("marketplace-list-stack", contentClassName)}>{hasResults ? resultsContent : emptyContent}</div>
      {hasResults ? footerMeta : null}
    </section>
  );
}
