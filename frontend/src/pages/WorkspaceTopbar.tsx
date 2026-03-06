import { useEffect, useMemo, useRef, useState } from "react";

import type { SessionUser } from "../lib/api";
import GlobalUserControlDropdown from "../components/GlobalUserControlDropdown";
import type { GlobalUserControlService } from "../lib/globalUserControlService";
import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import MarketplaceTopbarBase from "./MarketplaceTopbarBase";
import {
  renderMarketplaceTopbarActionButton,
  renderMarketplaceTopbarRightRegistrations,
  resolveMarketplaceTopbarRightRegistrations
} from "./MarketplaceTopbar.shared";
import type { MarketplaceTopbarRightRegistration } from "./MarketplaceTopbar.rightRegistry";

interface WorkspaceTopbarProps {
  isLightTheme: boolean;
  brandTitle: string;
  brandSubtitle: string;
  sessionUser: SessionUser | null;
  userControlService: GlobalUserControlService;
  onBrandClick: () => void;
  primaryActions: TopbarActionItem[];
  utilityActions: TopbarActionItem[];
  rightRegistrations: MarketplaceTopbarRightRegistration[];
  defaultPrimaryExpanded?: boolean;
}

interface WorkspaceTopbarUserProfile {
  displayName: string;
  subtitle: string;
}

interface WorkspaceTopbarPrimaryGroup {
  id: string;
  label: string;
  tagLabel: string;
  className: string;
  actions: TopbarActionItem[];
}

interface WorkspaceTopbarOverflowGroup {
  id: string;
  title: string;
  actions: TopbarActionItem[];
}

interface WorkspaceTopbarOverflowPresentation {
  titleText: string;
  hintText: string;
  metrics: TopbarActionItem[];
  groups: WorkspaceTopbarOverflowGroup[];
}

const PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT = 5;
const WORKSPACE_OVERFLOW_DEFAULT_GROUP_TITLE = "Workspace Menu";
const WORKSPACE_OVERFLOW_MARKETPLACE_GROUP_TITLE = "Marketplace Navigation";
const WORKSPACE_OVERFLOW_PANEL_ID = "workspace-topbar-overflow-panel";
const WORKSPACE_MARKETPLACE_ACTION_IDS = new Set(["category", "ranking", "top", "open-marketplace"]);

function hasActionClass(action: TopbarActionItem, className: string): boolean {
  const classTokens = String(action.className || "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  return classTokens.includes(className);
}

function isWorkspaceOverflowMetaAction(action: TopbarActionItem): boolean {
  return (
    hasActionClass(action, "is-menu-label") ||
    hasActionClass(action, "is-menu-title") ||
    hasActionClass(action, "is-menu-hint") ||
    hasActionClass(action, "is-menu-metric") ||
    hasActionClass(action, "is-menu-group-label")
  );
}

function isWorkspaceMarketplaceEntryAction(action: TopbarActionItem): boolean {
  return hasActionClass(action, "is-marketplace-entry-action") || WORKSPACE_MARKETPLACE_ACTION_IDS.has(action.id);
}

function isWorkspaceBackendPrimaryAction(action: TopbarActionItem): boolean {
  return !isWorkspaceOverflowMetaAction(action) && !isWorkspaceMarketplaceEntryAction(action);
}

interface WorkspacePrimaryActionPresentation {
  visibleActions: TopbarActionItem[];
  hiddenActions: TopbarActionItem[];
}

function resolveWorkspacePrimaryActionPresentation(actions: TopbarActionItem[]): WorkspacePrimaryActionPresentation {
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
      if (isWorkspaceOverflowMetaAction(actions[index])) {
        continue;
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

function resolveWorkspaceTopbarPrimaryGroups(actions: TopbarActionItem[]): WorkspaceTopbarPrimaryGroup[] {
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
      label: "Workspace Navigation",
      tagLabel: "Workspace",
      className: "is-workspace-group",
      actions: workspaceActions
    },
    {
      id: "workspace-primary-entry-group",
      label: "Access Navigation",
      tagLabel: "Access",
      className: "is-entry-group",
      actions: accessActions
    },
    {
      id: "workspace-primary-quick-group",
      label: "Quick Navigation",
      tagLabel: "Quick",
      className: "is-quick-group",
      actions: quickActions
    }
  ].filter((group) => group.actions.length > 0);
}

function resolveWorkspaceOverflowPresentation(actions: TopbarActionItem[]): WorkspaceTopbarOverflowPresentation {
  let titleText = WORKSPACE_OVERFLOW_DEFAULT_GROUP_TITLE;
  let hintText = "";
  const metrics: TopbarActionItem[] = [];
  const groups: WorkspaceTopbarOverflowGroup[] = [];
  const marketplaceActions = actions.filter((action) => isWorkspaceMarketplaceEntryAction(action));
  const nonMarketplaceActions = actions.filter((action) => !isWorkspaceMarketplaceEntryAction(action));

  let currentGroup: WorkspaceTopbarOverflowGroup | null = null;

  function flushCurrentGroup(): void {
    if (currentGroup && currentGroup.actions.length > 0) {
      groups.push(currentGroup);
    }
    currentGroup = null;
  }

  for (const action of nonMarketplaceActions) {
    if (hasActionClass(action, "is-menu-title")) {
      titleText = action.label;
      continue;
    }

    if (hasActionClass(action, "is-menu-hint")) {
      hintText = action.label;
      continue;
    }

    if (hasActionClass(action, "is-menu-metric")) {
      metrics.push(action);
      continue;
    }

    if (hasActionClass(action, "is-menu-group-label")) {
      flushCurrentGroup();
      currentGroup = {
        id: `workspace-overflow-group-${action.id}`,
        title: action.label,
        actions: []
      };
      continue;
    }

    if (!currentGroup) {
      currentGroup = {
        id: "workspace-overflow-group-default",
        title: WORKSPACE_OVERFLOW_DEFAULT_GROUP_TITLE,
        actions: []
      };
    }
    currentGroup.actions.push(action);
  }

  flushCurrentGroup();

  return {
    titleText,
    hintText,
    metrics,
    groups: [
      ...(marketplaceActions.length > 0
        ? [
            {
              id: "workspace-overflow-group-marketplace",
              title: WORKSPACE_OVERFLOW_MARKETPLACE_GROUP_TITLE,
              actions: marketplaceActions
            }
          ]
        : []),
      ...groups
    ]
  };
}

function resolveWorkspaceTopbarUserProfile(sessionUser: SessionUser | null): WorkspaceTopbarUserProfile {
  const baseDisplayName = String(sessionUser?.display_name || sessionUser?.username || "").trim();
  const displayName = baseDisplayName || "Guest User";
  const subtitle = String(sessionUser?.role || "").trim() || "Workspace Visitor";
  return {
    displayName,
    subtitle
  };
}

export default function WorkspaceTopbar({
  isLightTheme,
  brandTitle,
  brandSubtitle,
  sessionUser,
  userControlService,
  onBrandClick,
  primaryActions,
  utilityActions,
  rightRegistrations,
  defaultPrimaryExpanded = false
}: WorkspaceTopbarProps) {
  const profile = useMemo(() => resolveWorkspaceTopbarUserProfile(sessionUser), [sessionUser]);
  const [isPrimaryExpanded, setIsPrimaryExpanded] = useState(defaultPrimaryExpanded);
  const interactionScopeRef = useRef<HTMLDivElement | null>(null);
  const primaryActionPresentation = useMemo(
    () => resolveWorkspacePrimaryActionPresentation(primaryActions),
    [primaryActions]
  );
  const hasPrimaryOverflow = primaryActionPresentation.hiddenActions.length > 0;

  useEffect(() => {
    if (!isPrimaryExpanded) {
      return;
    }

    const handleDocumentPointerDown = (event: PointerEvent): void => {
      const interactionScopeElement = interactionScopeRef.current;
      if (!interactionScopeElement || !(event.target instanceof Node)) {
        return;
      }
      if (!interactionScopeElement.contains(event.target)) {
        setIsPrimaryExpanded(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsPrimaryExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isPrimaryExpanded]);

  useEffect(() => {
    if (!hasPrimaryOverflow && isPrimaryExpanded) {
      setIsPrimaryExpanded(false);
    }
  }, [hasPrimaryOverflow, isPrimaryExpanded]);

  const userCenterTrigger = useMemo(
    () => (
      <GlobalUserControlDropdown
        service={userControlService}
        displayName={profile.displayName}
        subtitle={profile.subtitle}
        avatarFallback="WU"
      />
    ),
    [profile.displayName, profile.subtitle, userControlService]
  );

  const resolvedRightRegistrations = useMemo(
    () =>
      resolveMarketplaceTopbarRightRegistrations({
        isLightTheme,
        utilityActions,
        rightRegistrations: [
          ...rightRegistrations,
          {
            key: "workspace-user-center",
            slot: "both",
            order: 90,
            render: () => userCenterTrigger
          }
        ]
      }),
    [isLightTheme, rightRegistrations, userCenterTrigger, utilityActions]
  );

  const rightContent = useMemo(
    () => renderMarketplaceTopbarRightRegistrations(resolvedRightRegistrations),
    [resolvedRightRegistrations]
  );
  const hiddenPrimaryActions = primaryActionPresentation.hiddenActions;
  const primaryActionsForRender = hasPrimaryOverflow
    ? primaryActionPresentation.visibleActions
    : primaryActions;

  const primaryToggleAction = useMemo(() => {
    if (!hasPrimaryOverflow) {
      return null;
    }

    return {
      id: "workspace-primary-nav-toggle",
      label: isPrimaryExpanded ? "Hide" : "More",
      tone: "subtle" as const,
      className: "is-primary-nav-toggle",
      ariaLabel: isPrimaryExpanded ? "Collapse primary navigation panel" : "Expand primary navigation panel",
      onClick: () => {
        setIsPrimaryExpanded((previousExpanded) => !previousExpanded);
      }
    };
  }, [hasPrimaryOverflow, isPrimaryExpanded]);

  const primaryTrailingContent = useMemo(() => {
    if (!primaryToggleAction) {
      return null;
    }
    return (
      <button
        type="button"
        className={`workspace-topbar-toggle-icon-button ${isPrimaryExpanded ? "is-expanded" : "is-collapsed"}`}
        aria-label={primaryToggleAction.ariaLabel}
        aria-expanded={isPrimaryExpanded}
        aria-controls={WORKSPACE_OVERFLOW_PANEL_ID}
        aria-haspopup="menu"
        onClick={primaryToggleAction.onClick}
      >
        <span className="workspace-topbar-toggle-button-content" aria-hidden="true">
          <span className="workspace-topbar-toggle-label">{primaryToggleAction.label}</span>
          {!isPrimaryExpanded ? (
            <span className="workspace-topbar-toggle-badge">
              <span className="workspace-topbar-toggle-badge-count">{hiddenPrimaryActions.length}</span>
            </span>
          ) : null}
          <span className="workspace-topbar-toggle-icon">⌄</span>
        </span>
      </button>
    );
  }, [hiddenPrimaryActions.length, isPrimaryExpanded, primaryToggleAction]);

  const primaryGroups = useMemo(
    () => resolveWorkspaceTopbarPrimaryGroups(primaryActionsForRender),
    [primaryActionsForRender]
  );

  const primaryNavigationContent = useMemo(() => {
    if (primaryGroups.length === 0) {
      return null;
    }

    return (
      <div className="workspace-topbar-primary-groups-shell">
        <div className="workspace-topbar-primary-groups" role="group" aria-label="Primary navigation">
          {primaryGroups.map((group) => (
            <div
              key={group.id}
              className={`workspace-topbar-primary-group ${group.className}`}
              role="group"
              aria-label={group.label}
            >
              <span className="workspace-topbar-primary-group-label" aria-hidden="true">
                {group.tagLabel}
              </span>
              {group.actions.map((action) => renderMarketplaceTopbarActionButton(action, "primary"))}
            </div>
          ))}
        </div>
        {primaryTrailingContent ? (
          <div className="workspace-topbar-primary-inline-toggle" role="group" aria-label="Primary navigation controls">
            {primaryTrailingContent}
          </div>
        ) : null}
      </div>
    );
  }, [primaryGroups, primaryTrailingContent]);

  const expandedPrimaryPanel = useMemo(() => {
    if (!hasPrimaryOverflow || hiddenPrimaryActions.length === 0) {
      return null;
    }

    const overflowPresentation = resolveWorkspaceOverflowPresentation(hiddenPrimaryActions);

    return (
      <div
        id={WORKSPACE_OVERFLOW_PANEL_ID}
        className={`workspace-topbar-overflow-wrapper ${isPrimaryExpanded ? "is-expanded" : "is-collapsed"}`}
        aria-hidden={!isPrimaryExpanded}
      >
        <div className="marketplace-topbar-overflow-panel" role="region" aria-label="Expanded workspace navigation panel">
          <div className="workspace-topbar-overflow-header">
            <h3 className="workspace-topbar-overflow-title">{overflowPresentation.titleText}</h3>
            {overflowPresentation.hintText ? (
              <p className="workspace-topbar-overflow-hint">{overflowPresentation.hintText}</p>
            ) : null}
            {overflowPresentation.metrics.length > 0 ? (
              <div className="workspace-topbar-overflow-metrics">
                {overflowPresentation.metrics.map((metricAction) =>
                  renderMarketplaceTopbarActionButton(metricAction, "primary")
                )}
              </div>
            ) : null}
          </div>

          <div className="workspace-topbar-overflow-groups">
            {overflowPresentation.groups.map((group) => (
              <section key={group.id} className="workspace-topbar-overflow-group">
                <h4 className="workspace-topbar-overflow-group-title">{group.title}</h4>
                <div className="workspace-topbar-overflow-group-actions">
                  {group.actions.map((action) => renderMarketplaceTopbarActionButton(action, "primary"))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }, [hasPrimaryOverflow, hiddenPrimaryActions, isPrimaryExpanded]);

  return (
    <div ref={interactionScopeRef} className="workspace-topbar-interaction-scope">
      <MarketplaceTopbarBase
        shellClassName="animated-fade-down workspace-topbar-shell"
        dataAnimated
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        onBrandClick={onBrandClick}
        isLightTheme={isLightTheme}
        primaryActions={[]}
        primaryNavigationContent={primaryNavigationContent}
        renderPrimaryActionButton={(action) => renderMarketplaceTopbarActionButton(action, "primary")}
        rightContent={rightContent}
        belowContent={expandedPrimaryPanel}
      />
    </div>
  );
}
