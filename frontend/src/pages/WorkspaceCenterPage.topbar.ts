import {
  buildLightTopbarUtilityActions,
  type TopbarActionItem
} from "./MarketplaceHomePage.lightTopbar";
import { createGlobalNavigationRegistry } from "../lib/globalNavigationRegistry";

interface WorkspaceTopbarPrimaryLabels {
  navCategories: string;
  navRankings: string;
  navTop: string;
  openMarketplace: string;
  openDashboard: string;
  signIn: string;
}

interface WorkspaceTopbarPrimaryInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
  hasSessionUser: boolean;
  labels: WorkspaceTopbarPrimaryLabels;
  extraPrimaryActions?: TopbarActionItem[];
}

interface WorkspaceTopbarUtilityLabels {
  globalSearch?: string;
  recentJobs?: string;
}

interface WorkspaceTopbarUtilityInput {
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  hasSessionUser: boolean;
  labels?: WorkspaceTopbarUtilityLabels;
  extraUtilityActions?: TopbarActionItem[];
}

export function buildWorkspaceCenterTopbarPrimaryActions({
  onNavigate,
  toPublicPath,
  toAdminPath,
  hasSessionUser,
  labels,
  extraPrimaryActions
}: WorkspaceTopbarPrimaryInput): TopbarActionItem[] {
  const registry = createGlobalNavigationRegistry<"workspace-topbar-primary", TopbarActionItem>();
  registry.register({
    key: "workspace-topbar-category",
    slot: "workspace-topbar-primary",
    order: 10,
    item: {
      id: "category",
      label: labels.navCategories,
      tone: "subtle",
      className: "is-category-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/categories"))
    }
  });
  registry.register({
    key: "workspace-topbar-ranking",
    slot: "workspace-topbar-primary",
    order: 20,
    item: {
      id: "ranking",
      label: labels.navRankings,
      tone: "default",
      className: "is-download-ranking-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/rankings"))
    }
  });
  registry.register({
    key: "workspace-topbar-top",
    slot: "workspace-topbar-primary",
    order: 30,
    item: {
      id: "top",
      label: labels.navTop,
      tone: "default",
      className: "is-top-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/rankings?scope=top"))
    }
  });
  registry.register({
    key: "workspace-topbar-open-marketplace",
    slot: "workspace-topbar-primary",
    order: 40,
    item: {
      id: "open-marketplace",
      label: labels.openMarketplace,
      tone: "default",
      className: "is-open-marketplace-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/"))
    }
  });
  registry.register({
    key: "workspace-topbar-open-dashboard",
    slot: "workspace-topbar-primary",
    order: 60,
    item: {
      id: "open-dashboard",
      label: hasSessionUser ? labels.openDashboard : labels.signIn,
      tone: "highlight",
      className: "is-open-dashboard-action is-backend-entry-action",
      onClick: () => onNavigate(hasSessionUser ? toAdminPath("/admin/overview") : toPublicPath("/login"))
    }
  });

  if (extraPrimaryActions && extraPrimaryActions.length > 0) {
    let extraOrder = 100;
    for (const action of extraPrimaryActions) {
      registry.register({
        key: `workspace-topbar-extra-${action.id}`,
        slot: "workspace-topbar-primary",
        order: extraOrder,
        item: action
      });
      extraOrder += 10;
    }
  }

  const registrations = registry.resolveRegistrations("workspace-topbar-primary");
  const deduplicatedActions: TopbarActionItem[] = [];
  const seenActionIDs = new Set<string>();

  for (const registration of registrations) {
    if (seenActionIDs.has(registration.item.id)) {
      continue;
    }
    seenActionIDs.add(registration.item.id);
    deduplicatedActions.push(registration.item);
  }

  return deduplicatedActions;
}

export function buildWorkspaceCenterTopbarUtilityActions({
  onNavigate,
  toPublicPath,
  hasSessionUser,
  labels,
  extraUtilityActions
}: WorkspaceTopbarUtilityInput): TopbarActionItem[] {
  const baseActions = buildLightTopbarUtilityActions({
    onNavigate,
    toPublicPath,
    hasSessionUser,
    labels: labels
      ? {
          globalSearchNav: labels.globalSearch,
          recentJobsNav: labels.recentJobs
        }
      : undefined
  }).filter((action) => {
    return action.id === "global-search" || action.id === "recent-jobs";
  });

  if (!extraUtilityActions || extraUtilityActions.length === 0) {
    return baseActions;
  }

  return [
    ...baseActions,
    ...extraUtilityActions.filter((action) => {
      return action.id !== "global-search" && action.id !== "recent-jobs";
    })
  ];
}
