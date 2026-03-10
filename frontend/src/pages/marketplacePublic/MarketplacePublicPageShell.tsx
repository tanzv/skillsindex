import type { ReactNode } from "react";

import { buildShellStageClassName } from "../prototype/pageShellLayoutContract";
import MarketplacePublicPageStyles from "./MarketplacePublicPageStyles";

interface MarketplacePublicPageShellProps {
  isResultsStage?: boolean;
  isMobileLayout?: boolean;
  isLightTheme?: boolean;
  stageTestId?: string;
  stageClassName?: string;
  rootClassName: string;
  rootTestId: string;
  children: ReactNode;
}

export interface MarketplacePublicStageClassNameOptions {
  isResultsStage: boolean;
  isMobileLayout: boolean;
  isLightTheme: boolean;
}

export function buildMarketplacePublicStageClassName({
  isResultsStage,
  isMobileLayout,
  isLightTheme
}: MarketplacePublicStageClassNameOptions): string {
  return buildShellStageClassName({
    isResultsStage,
    isMobileLayout,
    isLightTheme
  });
}

export default function MarketplacePublicPageShell({
  isResultsStage = false,
  isMobileLayout = false,
  isLightTheme = false,
  stageTestId = "shell-stage",
  stageClassName = "",
  rootClassName,
  rootTestId,
  children
}: MarketplacePublicPageShellProps) {
  return (
    <div
      className={[
        buildMarketplacePublicStageClassName({
          isResultsStage,
          isMobileLayout,
          isLightTheme
        }),
        stageClassName
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: "100%", minHeight: "100dvh", height: "auto" }}
      data-testid={stageTestId}
    >
      <MarketplacePublicPageStyles />
      <div
        className={rootClassName}
        style={{ width: "100%", height: "auto", minHeight: "100dvh", margin: 0 }}
        data-testid={rootTestId}
      >
        {children}
      </div>
    </div>
  );
}
