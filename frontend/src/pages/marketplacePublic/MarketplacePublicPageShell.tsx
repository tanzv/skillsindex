import type { ReactNode } from "react";
import MarketplacePublicPageStyles from "./MarketplacePublicPageStyles";

interface MarketplacePublicPageShellProps {
  isResultsStage?: boolean;
  isMobileLayout?: boolean;
  isLightTheme?: boolean;
  stageTestId?: string;
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
  return [
    "prototype-shell",
    "marketplace-home-stage",
    isResultsStage ? "marketplace-results-page-stage" : "",
    isMobileLayout ? "is-mobile-stage" : "",
    isLightTheme ? "is-light-stage" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MarketplacePublicPageShell({
  isResultsStage = false,
  isMobileLayout = false,
  isLightTheme = false,
  stageTestId = "marketplace-home-stage",
  rootClassName,
  rootTestId,
  children
}: MarketplacePublicPageShellProps) {
  return (
    <div
      className={buildMarketplacePublicStageClassName({
        isResultsStage,
        isMobileLayout,
        isLightTheme
      })}
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
