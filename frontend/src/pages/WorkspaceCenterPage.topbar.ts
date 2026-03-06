import {
  buildLightTopbarUtilityActions,
  type TopbarActionItem
} from "./MarketplaceHomePage.lightTopbar";
import { createGlobalNavigationRegistry } from "../lib/globalNavigationRegistry";

interface WorkspaceTopbarPrimaryLabels {
  categories: string;
  rankings: string;
  top: string;
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

const WORKSPACE_TOPBAR_PRIMARY_SLOT = "workspace-topbar-primary";

type WorkspaceTopbarPrimaryRegistry = ReturnType<
  typeof createGlobalNavigationRegistry<typeof WORKSPACE_TOPBAR_PRIMARY_SLOT, TopbarActionItem>
>;

function registerWorkspaceTopbarPrimaryAction(
  registry: WorkspaceTopbarPrimaryRegistry,
  key: string,
  order: number,
  item: TopbarActionItem
): void {
  registry.register({
    key,
    slot: WORKSPACE_TOPBAR_PRIMARY_SLOT,
    order,
    item
  });
}

function buildWorkspaceMarketplaceEntryActions({
  onNavigate,
  toPublicPath,
  labels
}: Pick<WorkspaceTopbarPrimaryInput, "onNavigate" | "toPublicPath" | "labels">): TopbarActionItem[] {
  return [
    {
      id: "category",
      label: labels.categories,
      tone: "subtle",
      className: "is-category-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/categories"))
    },
    {
      id: "ranking",
      label: labels.rankings,
      tone: "default",
      className: "is-download-ranking-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/rankings"))
    },
    {
      id: "top",
      label: labels.top,
      tone: "subtle",
      className: "is-top-action is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/rankings?scope=top"))
    },
    {
      id: "open-marketplace",
      label: labels.openMarketplace,
      tone: "default",
      className: "is-marketplace-entry-action",
      onClick: () => onNavigate(toPublicPath("/"))
    }
  ];
}

function deduplicateWorkspaceTopbarActions(actions: TopbarActionItem[]): TopbarActionItem[] {
  const deduplicatedActions: TopbarActionItem[] = [];
  const seenActionIDs = new Set<string>();

  for (const action of actions) {
    if (seenActionIDs.has(action.id)) {
      continue;
    }
    seenActionIDs.add(action.id);
    deduplicatedActions.push(action);
  }

  return deduplicatedActions;
}

export function buildWorkspaceCenterTopbarPrimaryActions({
  onNavigate,
  toPublicPath,
  toAdminPath,
  hasSessionUser,
  labels,
  extraPrimaryActions
}: WorkspaceTopbarPrimaryInput): TopbarActionItem[] {
  const registry = createGlobalNavigationRegistry<typeof WORKSPACE_TOPBAR_PRIMARY_SLOT, TopbarActionItem>();

  buildWorkspaceMarketplaceEntryActions({
    onNavigate,
    toPublicPath,
    labels
  }).forEach((action, index) => {
    registerWorkspaceTopbarPrimaryAction(registry, `workspace-topbar-marketplace-${action.id}`, (index + 1) * 10, action);
  });

  registerWorkspaceTopbarPrimaryAction(registry, "workspace-topbar-open-dashboard", 50, {
    id: "open-dashboard",
    label: hasSessionUser ? labels.openDashboard : labels.signIn,
    tone: "highlight",
    className: "is-open-dashboard-action is-backend-entry-action",
    onClick: () => onNavigate(hasSessionUser ? toAdminPath("/admin/overview") : toPublicPath("/login"))
  });

  if (extraPrimaryActions && extraPrimaryActions.length > 0) {
    let extraOrder = 100;
    for (const action of extraPrimaryActions) {
      registerWorkspaceTopbarPrimaryAction(registry, `workspace-topbar-extra-${action.id}`, extraOrder, action);
      extraOrder += 10;
    }
  }

  return deduplicateWorkspaceTopbarActions(registry.resolve(WORKSPACE_TOPBAR_PRIMARY_SLOT));
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
