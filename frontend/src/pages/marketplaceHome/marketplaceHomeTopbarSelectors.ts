import {
  marketplaceTopbarClassNames,
  workspaceShellTopbarClassNames,
  type AppTopbarClassNameKey
} from "../../components/appTopbarClassNames";

const topbarVariants = [marketplaceTopbarClassNames, workspaceShellTopbarClassNames] as const;

export function buildMarketplaceHomeTopbarSelector(
  scopeSelector: string,
  classNameKey: AppTopbarClassNameKey,
  suffix = ""
): string {
  return topbarVariants.map((variant) => `${scopeSelector} .${variant[classNameKey]}${suffix}`).join(",\n");
}

export function buildMarketplaceHomeTopbarDescendantSelector(
  scopeSelector: string,
  parentClassNameKey: AppTopbarClassNameKey,
  childClassNameKey: AppTopbarClassNameKey,
  options: { parentSuffix?: string; childSuffix?: string } = {}
): string {
  const { parentSuffix = "", childSuffix = "" } = options;
  return topbarVariants
    .map(
      (variant) =>
        `${scopeSelector} .${variant[parentClassNameKey]}${parentSuffix} .${variant[childClassNameKey]}${childSuffix}`
    )
    .join(",\n");
}
