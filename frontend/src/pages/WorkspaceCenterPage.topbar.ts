import {
  buildLightTopbarPrimaryActions,
  buildLightTopbarUtilityActions,
  type TopbarActionItem
} from "./MarketplaceHomePage.lightTopbar";

interface WorkspaceTopbarPrimaryLabels {
  navCategories: string;
  navRankings: string;
}

interface WorkspaceTopbarPrimaryInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  labels: WorkspaceTopbarPrimaryLabels;
  extraPrimaryActions?: TopbarActionItem[];
}

interface WorkspaceTopbarUtilityLabels {
  signIn: string;
  openDashboard: string;
}

interface WorkspaceTopbarUtilityInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
  hasSessionUser: boolean;
  labels: WorkspaceTopbarUtilityLabels;
  extraUtilityActions?: TopbarActionItem[];
}

export function buildWorkspaceCenterTopbarPrimaryActions({
  onNavigate,
  toPublicPath,
  labels,
  extraPrimaryActions
}: WorkspaceTopbarPrimaryInput): TopbarActionItem[] {
  return buildLightTopbarPrimaryActions({
    onNavigate,
    toPublicPath,
    labels: {
      categoryNav: labels.navCategories,
      downloadRankingNav: labels.navRankings
    },
    extraPrimaryActions
  });
}

export function buildWorkspaceCenterTopbarUtilityActions({
  onNavigate,
  toPublicPath,
  toAdminPath,
  hasSessionUser,
  labels,
  extraUtilityActions
}: WorkspaceTopbarUtilityInput): TopbarActionItem[] {
  return buildLightTopbarUtilityActions({
    onNavigate,
    toPublicPath,
    hasSessionUser,
    authActionLabel: hasSessionUser ? labels.openDashboard : labels.signIn,
    onAuthAction: () => {
      onNavigate(hasSessionUser ? toAdminPath("/admin/overview") : toPublicPath("/login"));
    },
    extraUtilityActions
  });
}
