import type { AppLocale } from "../lib/i18n";
import { marketplaceHomeCopy } from "./MarketplaceHomePage.copy";

export type TopbarActionTone = "default" | "subtle" | "highlight";
export type TopbarPrimaryPreset = "compact" | "full";

export interface TopbarActionItem {
  id: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: TopbarActionTone;
  className?: string;
  badge?: string;
  ariaLabel?: string;
}

interface BuildLightTopbarLabels {
  categoryNav: string;
  downloadRankingNav: string;
  workspaceNav?: string;
  executionNav?: string;
  syncNav?: string;
  securityNav?: string;
  developerNav?: string;
  globalSearchNav?: string;
  recentJobsNav?: string;
  profileNav?: string;
}

interface BuildLightTopbarActionsInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  labels: BuildLightTopbarLabels;
  activeActionID?: string;
  primaryPreset?: TopbarPrimaryPreset;
  primaryActionSpecs?: NavigationActionSpec[];
  extraPrimaryActions?: TopbarActionItem[];
}

interface BuildLightTopbarUtilityActionsInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  hasSessionUser: boolean;
  authActionLabel?: string;
  onAuthAction?: () => void;
  labels?: Pick<BuildLightTopbarLabels, "globalSearchNav" | "recentJobsNav" | "profileNav">;
  extraUtilityActions?: TopbarActionItem[];
}

interface BuildMarketplaceTopbarPrimaryActionsInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  locale: AppLocale;
  activeActionID?: string;
  extraPrimaryActions?: TopbarActionItem[];
}

interface BuildMarketplaceTopbarActionBundleInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  locale: AppLocale;
  hasSessionUser: boolean;
  activeActionID?: string;
  authActionLabel?: string;
  onAuthAction?: () => void;
  utilityLabels?: Pick<BuildLightTopbarLabels, "globalSearchNav" | "recentJobsNav" | "profileNav">;
  extraPrimaryActions?: TopbarActionItem[];
  extraUtilityActions?: TopbarActionItem[];
}

export interface NavigationActionSpec {
  id: string;
  label: string;
  routePath: string;
  tone?: TopbarActionTone;
  className?: string;
  badge?: string;
}

export interface MarketplaceTopbarActionBundle {
  primaryActions: TopbarActionItem[];
  utilityActions: TopbarActionItem[];
}

function withExtraActions(baseActions: TopbarActionItem[], extraActions: TopbarActionItem[] | undefined): TopbarActionItem[] {
  if (!extraActions || extraActions.length === 0) {
    return baseActions;
  }
  return [...baseActions, ...extraActions];
}

function buildCompactPrimarySpecs(labels: BuildLightTopbarLabels): NavigationActionSpec[] {
  return [
    {
      id: "category",
      label: labels.categoryNav,
      routePath: "/categories",
      tone: "subtle",
      className: "is-category-action"
    },
    {
      id: "download-ranking",
      label: labels.downloadRankingNav,
      routePath: "/rankings",
      tone: "default",
      className: "is-download-ranking-action",
      badge: "TOP"
    }
  ];
}

export function resolveMarketplaceTopbarPrimaryLabels(locale: AppLocale): Pick<BuildLightTopbarLabels, "categoryNav" | "downloadRankingNav"> {
  const localizedCopy = marketplaceHomeCopy[locale] || marketplaceHomeCopy.en;
  return {
    categoryNav: localizedCopy.categoryNav,
    downloadRankingNav: localizedCopy.downloadRankingNav
  };
}

function buildFullPrimarySpecs(labels: BuildLightTopbarLabels): NavigationActionSpec[] {
  return [
    {
      id: "workspace",
      label: labels.workspaceNav || "Workspace",
      routePath: "/workspace",
      tone: "highlight"
    },
    {
      id: "category",
      label: labels.categoryNav,
      routePath: "/categories",
      tone: "subtle",
      className: "is-category-action"
    },
    {
      id: "download-ranking",
      label: labels.downloadRankingNav,
      routePath: "/rankings",
      tone: "default",
      className: "is-download-ranking-action",
      badge: "TOP"
    },
    {
      id: "execution",
      label: labels.executionNav || "Execution",
      routePath: "/workspace",
      tone: "default"
    },
    {
      id: "sync",
      label: labels.syncNav || "Sync Center",
      routePath: "/workspace",
      tone: "default"
    },
    {
      id: "security",
      label: labels.securityNav || "Security",
      routePath: "/docs",
      tone: "subtle"
    },
    {
      id: "developer",
      label: labels.developerNav || "Developer",
      routePath: "/docs",
      tone: "subtle"
    }
  ];
}

function resolvePrimaryActionSpecs({
  labels,
  primaryPreset,
  primaryActionSpecs
}: {
  labels: BuildLightTopbarLabels;
  primaryPreset: TopbarPrimaryPreset;
  primaryActionSpecs?: NavigationActionSpec[];
}): NavigationActionSpec[] {
  if (primaryActionSpecs && primaryActionSpecs.length > 0) {
    return primaryActionSpecs;
  }
  return primaryPreset === "full" ? buildFullPrimarySpecs(labels) : buildCompactPrimarySpecs(labels);
}

function buildNavigationActions({
  specs,
  onNavigate,
  toPublicPath,
  activeActionID
}: {
  specs: NavigationActionSpec[];
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  activeActionID?: string;
}): TopbarActionItem[] {
  return specs.map((spec) => ({
    id: spec.id,
    label: spec.label,
    tone: spec.tone || "default",
    className: spec.className,
    badge: spec.badge,
    active: activeActionID ? spec.id === activeActionID : false,
    onClick: () => onNavigate(toPublicPath(spec.routePath))
  }));
}

export function buildLightTopbarPrimaryActions({
  onNavigate,
  toPublicPath,
  labels,
  activeActionID,
  primaryPreset = "compact",
  primaryActionSpecs,
  extraPrimaryActions
}: BuildLightTopbarActionsInput): TopbarActionItem[] {
  const resolvedPrimarySpecs = resolvePrimaryActionSpecs({
    labels,
    primaryPreset,
    primaryActionSpecs
  });

  const baseActions = buildNavigationActions({
    specs: resolvedPrimarySpecs,
    onNavigate,
    toPublicPath,
    activeActionID
  });
  return withExtraActions(baseActions, extraPrimaryActions);
}

export function buildMarketplaceTopbarPrimaryActions({
  onNavigate,
  toPublicPath,
  locale,
  activeActionID,
  extraPrimaryActions
}: BuildMarketplaceTopbarPrimaryActionsInput): TopbarActionItem[] {
  return buildLightTopbarPrimaryActions({
    onNavigate,
    toPublicPath,
    activeActionID,
    labels: resolveMarketplaceTopbarPrimaryLabels(locale),
    extraPrimaryActions
  });
}

export function buildMarketplaceTopbarActionBundle({
  onNavigate,
  toPublicPath,
  locale,
  hasSessionUser,
  activeActionID,
  authActionLabel,
  onAuthAction,
  utilityLabels,
  extraPrimaryActions,
  extraUtilityActions
}: BuildMarketplaceTopbarActionBundleInput): MarketplaceTopbarActionBundle {
  return {
    primaryActions: buildMarketplaceTopbarPrimaryActions({
      onNavigate,
      toPublicPath,
      locale,
      activeActionID,
      extraPrimaryActions
    }),
    utilityActions: buildLightTopbarUtilityActions({
      onNavigate,
      toPublicPath,
      hasSessionUser,
      authActionLabel,
      onAuthAction,
      labels: utilityLabels,
      extraUtilityActions
    })
  };
}

export function buildLightTopbarUtilityActions({
  onNavigate,
  toPublicPath,
  hasSessionUser,
  authActionLabel,
  onAuthAction,
  labels,
  extraUtilityActions
}: BuildLightTopbarUtilityActionsInput): TopbarActionItem[] {
  const utilityActions: TopbarActionItem[] = [
    {
      id: "global-search",
      label: labels?.globalSearchNav || "Global Search",
      tone: "subtle",
      onClick: () => onNavigate(toPublicPath("/results"))
    },
    {
      id: "recent-jobs",
      label: labels?.recentJobsNav || "Recent Jobs",
      tone: "default",
      onClick: () => onNavigate(toPublicPath("/workspace"))
    },
    {
      id: "profile",
      label: labels?.profileNav || "Profile",
      tone: "default",
      onClick: () => onNavigate(hasSessionUser ? "/account/profile" : toPublicPath("/login"))
    }
  ];

  if (authActionLabel && onAuthAction) {
    utilityActions.push({
      id: "auth-action",
      label: authActionLabel,
      tone: "highlight",
      className: "is-auth-action",
      onClick: onAuthAction
    });
  }

  return withExtraActions(utilityActions, extraUtilityActions);
}
