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
  labels?: Pick<BuildLightTopbarLabels, "globalSearchNav" | "recentJobsNav" | "profileNav">;
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

export function buildLightTopbarUtilityActions({
  onNavigate,
  toPublicPath,
  hasSessionUser,
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
  return withExtraActions(utilityActions, extraUtilityActions);
}
