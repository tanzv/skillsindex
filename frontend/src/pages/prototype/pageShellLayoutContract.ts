import { css } from "@emotion/react";

export type ShellLayoutVariant = "default" | "full-width";

export const shellLayoutClassNames = {
  stage: "si-layout-shell-stage",
  surface: "si-layout-shell-surface",
  resultsSurface: "si-layout-shell-surface-results",
  mobileStage: "si-layout-shell-stage-mobile",
  lightStage: "si-layout-shell-stage-light"
} as const;

export interface BuildShellStageClassNameOptions {
  isResultsStage?: boolean;
  isMobileLayout?: boolean;
  isLightTheme?: boolean;
}

export function buildShellStageClassName({
  isResultsStage = false,
  isMobileLayout = false,
  isLightTheme = false
}: BuildShellStageClassNameOptions): string {
  return [
    shellLayoutClassNames.stage,
    shellLayoutClassNames.surface,
    isResultsStage ? shellLayoutClassNames.resultsSurface : "",
    isMobileLayout ? shellLayoutClassNames.mobileStage : "",
    isLightTheme ? shellLayoutClassNames.lightStage : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export const shellLayoutContractVars = {
  inlineGap: "--si-layout-shell-inline-gap",
  topbarMaxWidth: "--si-layout-shell-topbar-max-width",
  topbarWidth: "--si-layout-shell-topbar-width",
  contentMaxWidth: "--si-layout-shell-content-max-width",
  contentWidth: "--si-layout-shell-content-width"
} as const;

interface BuildShellLayoutContractOptions {
  inlineGap: string;
  compactInlineGap?: string;
  topbarMaxWidth: string;
  contentMaxWidth?: string;
  layoutVariant?: ShellLayoutVariant;
}

export function resolveShellContentWidthExpression(layoutVariant?: ShellLayoutVariant): string {
  return layoutVariant === "full-width"
    ? `calc(100% - var(${shellLayoutContractVars.inlineGap}))`
    : `min(var(${shellLayoutContractVars.contentMaxWidth}), calc(100% - var(${shellLayoutContractVars.inlineGap})))`;
}

export function buildShellLayoutContract({
  inlineGap,
  compactInlineGap = "0.75rem",
  topbarMaxWidth,
  contentMaxWidth = topbarMaxWidth,
  layoutVariant
}: BuildShellLayoutContractOptions) {
  return css`
    ${shellLayoutContractVars.inlineGap}: ${inlineGap};
    ${shellLayoutContractVars.topbarMaxWidth}: ${topbarMaxWidth};
    ${shellLayoutContractVars.topbarWidth}: min(
      var(${shellLayoutContractVars.topbarMaxWidth}),
      calc(100% - var(${shellLayoutContractVars.inlineGap}))
    );
    ${shellLayoutContractVars.contentMaxWidth}: ${contentMaxWidth};
    ${shellLayoutContractVars.contentWidth}: ${resolveShellContentWidthExpression(layoutVariant)};

    @media (max-width: 1120px) {
      ${shellLayoutContractVars.inlineGap}: ${compactInlineGap};
    }
  `;
}
