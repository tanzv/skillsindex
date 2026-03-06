import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";

import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";

export interface WorkspaceTopbarUserProfile {
  displayName: string;
  subtitle: string;
}

export interface WorkspaceTopbarPrimaryGroup {
  id: string;
  label: string;
  tagLabel: string;
  className: string;
  actions: TopbarActionItem[];
}

export interface WorkspaceTopbarOverflowGroup {
  id: string;
  title: string;
  countLabel: string;
  active: boolean;
  actions: TopbarActionItem[];
}

export interface WorkspaceTopbarOverflowPresentation {
  titleText: string;
  hintText: string;
  metrics: TopbarActionItem[];
  groups: WorkspaceTopbarOverflowGroup[];
}

export interface WorkspacePrimaryActionPresentation {
  visibleActions: TopbarActionItem[];
  hiddenActions: TopbarActionItem[];
}

const PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT = 5;
const WORKSPACE_OVERFLOW_ACCESS_GROUP_ID = "workspace-overflow-group-access";
const WORKSPACE_MARKETPLACE_ACTION_IDS = new Set(["category", "ranking", "top", "open-marketplace"]);

interface WorkspaceTopbarLocaleText {
  overflowDefaultGroupTitle: string;
  overflowMarketplaceGroupTitle: string;
  overflowAccessGroupTitle: string;
  overflowSectionsGroupTitle: string;
  overflowHubsGroupTitle: string;
  overflowOrganizationGroupTitle: string;
  workspaceNavigationLabel: string;
  workspaceTagLabel: string;
  accessNavigationLabel: string;
  accessTagLabel: string;
  quickNavigationLabel: string;
  quickTagLabel: string;
  guestUser: string;
  workspaceVisitor: string;
}

function resolveWorkspaceTopbarLocaleText(locale: AppLocale): WorkspaceTopbarLocaleText {
  if (locale === "zh") {
    return {
      overflowDefaultGroupTitle: "\u5de5\u4f5c\u53f0\u83dc\u5355",
      overflowMarketplaceGroupTitle: "\u5e02\u573a\u5bfc\u822a",
      overflowAccessGroupTitle: "\u5165\u53e3\u5bfc\u822a",
      overflowSectionsGroupTitle: "\u5de5\u4f5c\u53f0\u5206\u533a",
      overflowHubsGroupTitle: "\u5173\u8054\u4e2d\u5fc3",
      overflowOrganizationGroupTitle: "\u7ec4\u7ec7\u7ba1\u7406",
      workspaceNavigationLabel: "\u5de5\u4f5c\u53f0\u5bfc\u822a",
      workspaceTagLabel: "\u5de5\u4f5c\u53f0",
      accessNavigationLabel: "\u5165\u53e3\u5bfc\u822a",
      accessTagLabel: "\u5165\u53e3",
      quickNavigationLabel: "\u5feb\u901f\u5bfc\u822a",
      quickTagLabel: "\u5feb\u6377",
      guestUser: "\u8bbf\u5ba2\u7528\u6237",
      workspaceVisitor: "\u5de5\u4f5c\u53f0\u8bbf\u5ba2"
    };
  }

  return {
    overflowDefaultGroupTitle: "Workspace Menu",
    overflowMarketplaceGroupTitle: "Marketplace Navigation",
    overflowAccessGroupTitle: "Access Navigation",
    overflowSectionsGroupTitle: "Workspace Sections",
    overflowHubsGroupTitle: "Related Hubs",
    overflowOrganizationGroupTitle: "Organization Management",
    workspaceNavigationLabel: "Workspace Navigation",
    workspaceTagLabel: "Workspace",
    accessNavigationLabel: "Access Navigation",
    accessTagLabel: "Access",
    quickNavigationLabel: "Quick Navigation",
    quickTagLabel: "Quick",
    guestUser: "Guest User",
    workspaceVisitor: "Workspace Visitor"
  };
}

function resolveActionClassTokens(action: TopbarActionItem): string[] {
  return String(action.className || "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function hasActionClass(action: TopbarActionItem, className: string): boolean {
  return resolveActionClassTokens(action).includes(className);
}

function resolveWorkspaceMenuGroupToken(action: TopbarActionItem): string {
  for (const classToken of resolveActionClassTokens(action)) {
    if (classToken.startsWith("is-menu-group-")) {
      return classToken.slice("is-menu-group-".length);
    }
  }
  return "";
}

function formatTokenAsTitle(rawToken: string): string {
  return rawToken
    .split("-")
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ""))
    .join(" ")
    .trim();
}

function resolveWorkspaceOverflowGroupTitleFromToken(menuGroupToken: string, text: WorkspaceTopbarLocaleText): string {
  if (menuGroupToken === "sections") {
    return text.overflowSectionsGroupTitle;
  }
  if (menuGroupToken === "hubs") {
    return text.overflowHubsGroupTitle;
  }
  if (menuGroupToken === "organization-management") {
    return text.overflowOrganizationGroupTitle;
  }
  const normalizedTitle = formatTokenAsTitle(menuGroupToken);
  return normalizedTitle || text.overflowDefaultGroupTitle;
}

function createOverflowGroup(id: string, title: string): WorkspaceTopbarOverflowGroup {
  return {
    id,
    title,
    countLabel: "0",
    active: false,
    actions: []
  };
}

function finalizeOverflowGroup(group: WorkspaceTopbarOverflowGroup): WorkspaceTopbarOverflowGroup {
  return {
    ...group,
    countLabel: String(group.actions.length),
    active: group.actions.some((action) => Boolean(action.active))
  };
}

function isWorkspaceMarketplaceEntryAction(action: TopbarActionItem): boolean {
  return hasActionClass(action, "is-marketplace-entry-action") || WORKSPACE_MARKETPLACE_ACTION_IDS.has(action.id);
}

function isWorkspaceBackendPrimaryAction(action: TopbarActionItem): boolean {
  return !isWorkspaceMarketplaceEntryAction(action);
}

export function resolveWorkspacePrimaryActionPresentation(actions: TopbarActionItem[]): WorkspacePrimaryActionPresentation {
  const selectedActionIndexes = new Set<number>();

  for (let index = 0; index < actions.length; index += 1) {
    if (selectedActionIndexes.size >= PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT) {
      break;
    }
    if (!isWorkspaceBackendPrimaryAction(actions[index])) {
      continue;
    }
    selectedActionIndexes.add(index);
  }

  if (selectedActionIndexes.size === 0) {
    for (let index = 0; index < actions.length; index += 1) {
      if (selectedActionIndexes.size >= PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT) {
        break;
      }
      selectedActionIndexes.add(index);
    }
  }

  const visibleActions: TopbarActionItem[] = [];
  const hiddenActions: TopbarActionItem[] = [];

  for (let index = 0; index < actions.length; index += 1) {
    if (selectedActionIndexes.has(index)) {
      visibleActions.push(actions[index]);
      continue;
    }
    hiddenActions.push(actions[index]);
  }

  return {
    visibleActions,
    hiddenActions
  };
}

export function resolveWorkspaceTopbarPrimaryGroups(actions: TopbarActionItem[], locale: AppLocale): WorkspaceTopbarPrimaryGroup[] {
  const text = resolveWorkspaceTopbarLocaleText(locale);
  const workspaceActions: TopbarActionItem[] = [];
  const accessActions: TopbarActionItem[] = [];
  const quickActions: TopbarActionItem[] = [];

  for (const action of actions) {
    if (action.id === "open-dashboard" || hasActionClass(action, "is-backend-entry-action")) {
      accessActions.push(action);
      continue;
    }
    if (hasActionClass(action, "is-menu-entry")) {
      workspaceActions.push(action);
      continue;
    }
    quickActions.push(action);
  }

  return [
    {
      id: "workspace-primary-workspace-group",
      label: text.workspaceNavigationLabel,
      tagLabel: text.workspaceTagLabel,
      className: "is-workspace-group",
      actions: workspaceActions
    },
    {
      id: "workspace-primary-entry-group",
      label: text.accessNavigationLabel,
      tagLabel: text.accessTagLabel,
      className: "is-entry-group",
      actions: accessActions
    },
    {
      id: "workspace-primary-quick-group",
      label: text.quickNavigationLabel,
      tagLabel: text.quickTagLabel,
      className: "is-quick-group",
      actions: quickActions
    }
  ].filter((group) => group.actions.length > 0);
}

export function resolveWorkspaceOverflowPresentation(actions: TopbarActionItem[], locale: AppLocale): WorkspaceTopbarOverflowPresentation {
  const text = resolveWorkspaceTopbarLocaleText(locale);
  const groups: WorkspaceTopbarOverflowGroup[] = [];
  const dynamicGroups: WorkspaceTopbarOverflowGroup[] = [];
  const dynamicGroupMap = new Map<string, WorkspaceTopbarOverflowGroup>();
  const marketplaceActions = actions.filter((action) => isWorkspaceMarketplaceEntryAction(action));
  const nonMarketplaceActions = actions.filter((action) => !isWorkspaceMarketplaceEntryAction(action));

  function appendToGroup(groupID: string, groupTitle: string, action: TopbarActionItem): void {
    let targetGroup = dynamicGroupMap.get(groupID);
    if (!targetGroup) {
      targetGroup = createOverflowGroup(groupID, groupTitle);
      dynamicGroupMap.set(groupID, targetGroup);
      dynamicGroups.push(targetGroup);
    }
    targetGroup.actions.push(action);
  }

  for (const action of nonMarketplaceActions) {
    const menuGroupToken = resolveWorkspaceMenuGroupToken(action);
    if (menuGroupToken) {
      appendToGroup(
        `workspace-overflow-group-${menuGroupToken}`,
        resolveWorkspaceOverflowGroupTitleFromToken(menuGroupToken, text),
        action
      );
      continue;
    }

    if (action.id === "open-dashboard" || hasActionClass(action, "is-backend-entry-action")) {
      appendToGroup(WORKSPACE_OVERFLOW_ACCESS_GROUP_ID, text.overflowAccessGroupTitle, action);
      continue;
    }

    appendToGroup("workspace-overflow-group-default", text.overflowDefaultGroupTitle, action);
  }

  if (marketplaceActions.length > 0) {
    groups.push(
      finalizeOverflowGroup({
        ...createOverflowGroup("workspace-overflow-group-marketplace", text.overflowMarketplaceGroupTitle),
        actions: marketplaceActions
      })
    );
  }
  groups.push(
    ...dynamicGroups
      .filter((group) => group.actions.length > 0)
      .map((group) => finalizeOverflowGroup(group))
      .sort((left, right) => {
        if (left.active === right.active) {
          return left.title.localeCompare(right.title);
        }
        return left.active ? -1 : 1;
      })
  );

  return {
    titleText: text.overflowDefaultGroupTitle,
    hintText: "",
    metrics: [],
    groups
  };
}

export function resolveWorkspaceTopbarUserProfile(sessionUser: SessionUser | null, locale: AppLocale): WorkspaceTopbarUserProfile {
  const text = resolveWorkspaceTopbarLocaleText(locale);
  const baseDisplayName = String(sessionUser?.display_name || sessionUser?.username || "").trim();
  const displayName = baseDisplayName || text.guestUser;
  const subtitle = String(sessionUser?.role || "").trim() || text.workspaceVisitor;
  return {
    displayName,
    subtitle
  };
}
