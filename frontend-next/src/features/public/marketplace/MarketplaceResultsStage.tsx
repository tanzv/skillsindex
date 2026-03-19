"use client";

import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

interface MarketplaceResultsStageProps {
  mainContent: ReactNode;
  sideContent?: ReactNode;
  className?: string;
  mainClassName?: string;
  sideClassName?: string;
  layoutTestId?: string;
  mainTestId?: string;
  sideTestId?: string;
}

export function MarketplaceResultsStage({
  mainContent,
  sideContent,
  className,
  mainClassName,
  sideClassName,
  layoutTestId,
  mainTestId,
  sideTestId
}: MarketplaceResultsStageProps) {
  return (
    <div className={cn("marketplace-results-layout", className)} data-testid={layoutTestId}>
      <div className={cn("marketplace-main-column", mainClassName)} data-testid={mainTestId}>
        {mainContent}
      </div>
      {sideContent ? (
        <aside className={cn("marketplace-side-column", sideClassName)} data-testid={sideTestId}>
          {sideContent}
        </aside>
      ) : null}
    </div>
  );
}
