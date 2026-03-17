export interface AppTopbarClassNames {
  shell: string;
  topbar: string;
  leftGroup: string;
  brand: string;
  brandDot: string;
  brandCopy: string;
  leftAccessory: string;
  lightNav: string;
  primaryTrailing: string;
  lightUtility: string;
  actions: string;
  belowContent: string;
  navButton: string;
  utilityButton: string;
  actionLabel: string;
  actionBadge: string;
  status: string;
  secondaryCta: string;
  cta: string;
  overflowPanel: string;
}

export type AppTopbarClassNameKey = keyof AppTopbarClassNames;
export type AppTopbarVariant = "marketplace" | "workspace-shell";

function createAppTopbarClassNames(prefix: string): AppTopbarClassNames {
  return {
    shell: `${prefix}-shell`,
    topbar: prefix,
    leftGroup: `${prefix}-left-group`,
    brand: `${prefix}-brand`,
    brandDot: `${prefix}-brand-dot`,
    brandCopy: `${prefix}-brand-copy`,
    leftAccessory: `${prefix}-left-accessory`,
    lightNav: `${prefix}-light-nav`,
    primaryTrailing: `${prefix}-primary-trailing`,
    lightUtility: `${prefix}-light-utility`,
    actions: `${prefix}-actions`,
    belowContent: `${prefix}-below-content`,
    navButton: `${prefix}-nav-button`,
    utilityButton: `${prefix}-utility-button`,
    actionLabel: `${prefix}-action-label`,
    actionBadge: `${prefix}-action-badge`,
    status: `${prefix}-status`,
    secondaryCta: `${prefix}-secondary-cta`,
    cta: `${prefix}-cta`,
    overflowPanel: `${prefix}-overflow-panel`
  };
}

export const marketplaceTopbarClassNames = createAppTopbarClassNames("marketplace-topbar");
export const workspaceShellTopbarClassNames = createAppTopbarClassNames("workspace-shell-topbar");

export function resolveAppTopbarClassNames(variant: AppTopbarVariant = "marketplace"): AppTopbarClassNames {
  return variant === "workspace-shell" ? workspaceShellTopbarClassNames : marketplaceTopbarClassNames;
}
