import { AppstoreOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SessionUser } from "../lib/api";
import type { GlobalUserControlService } from "../lib/globalUserControlService";
import type { AppLocale } from "../lib/i18n";
import GlobalUserControlDropdown from "./GlobalUserControlDropdown";
import type { TopbarActionItem } from "../pages/marketplaceHome/MarketplaceHomePage.lightTopbar";
import AppShellTopbar from "./AppShellTopbar";
import type { MarketplaceTopbarRightRegistration } from "../pages/marketplacePublic/MarketplaceTopbar.rightRegistry";
import {
  renderAppTopbarActionButton,
  resolveAppTopbarRightRegistrations
} from "./appTopbar.shared";
import { workspaceShellTopbarClassNames } from "./appTopbarClassNames";
import {
  resolveWorkspaceOverflowPresentation,
  resolveWorkspacePrimaryActionPresentation,
  resolveWorkspacePrimaryShellWidth,
  resolveWorkspaceResponsivePrimaryVisibleCount,
  resolveWorkspaceTopbarPrimaryGroups,
  resolveWorkspaceTopbarUserProfile
} from "./AppGlobalTopbar.helpers";

export interface AppGlobalTopbarProps {
  locale: AppLocale;
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

const APP_GLOBAL_OVERFLOW_PANEL_ID = "workspace-topbar-overflow-panel";
type AppGlobalTopbarSurface = "none" | "primary-overflow" | "user-menu";

function resolveTopbarBrowserWindow(): (Window & typeof globalThis) | null {
  const root = globalThis as typeof globalThis & { window?: Partial<Window> };
  const candidate = (root.window || root) as Partial<Window> & typeof globalThis;
  if (typeof candidate.innerWidth !== "number") {
    return null;
  }
  if (typeof candidate.addEventListener !== "function" || typeof candidate.removeEventListener !== "function") {
    return null;
  }
  return candidate as Window & typeof globalThis;
}

export default function AppGlobalTopbar({
  locale,
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
}: AppGlobalTopbarProps) {
  const profile = useMemo(() => resolveWorkspaceTopbarUserProfile(sessionUser, locale), [locale, sessionUser]);
  const [activeSurface, setActiveSurface] = useState<AppGlobalTopbarSurface>(
    defaultPrimaryExpanded ? "primary-overflow" : "none"
  );
  const interactionScopeRef = useRef<HTMLDivElement | null>(null);
  const primaryShellRef = useRef<HTMLDivElement | null>(null);
  const [primaryShellWidth, setPrimaryShellWidth] = useState<number | null>(() => {
    const browserWindow = resolveTopbarBrowserWindow();
    return browserWindow ? resolveWorkspacePrimaryShellWidth(browserWindow.innerWidth) : null;
  });
  const primaryVisibleCount = useMemo(
    () => resolveWorkspaceResponsivePrimaryVisibleCount(primaryShellWidth),
    [primaryShellWidth]
  );
  const primaryActionPresentation = useMemo(
    () => resolveWorkspacePrimaryActionPresentation(primaryActions, primaryVisibleCount),
    [primaryActions, primaryVisibleCount]
  );
  const hasPrimaryOverflow = primaryActionPresentation.hiddenActions.length > 0;
  const isPrimaryExpanded = activeSurface === "primary-overflow";
  const isUserMenuOpen = activeSurface === "user-menu";
  const topbarCopy = useMemo(() => {
    if (locale === "zh") {
      return {
        more: "更多",
        hide: "收起",
        expandAria: "展开应用导航面板",
        collapseAria: "收起应用导航面板",
        primaryNavigationAria: "应用导航",
        primaryControlsAria: "应用导航控制",
        expandedPanelAria: "已展开的应用导航面板"
      };
    }

    return {
      more: "More",
      hide: "Hide",
      expandAria: "Expand app navigation panel",
      collapseAria: "Collapse app navigation panel",
      primaryNavigationAria: "App navigation",
      primaryControlsAria: "App navigation controls",
      expandedPanelAria: "Expanded app navigation panel"
    };
  }, [locale]);

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
        setActiveSurface("none");
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setActiveSurface("none");
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
      setActiveSurface("none");
    }
  }, [hasPrimaryOverflow, isPrimaryExpanded]);

  useEffect(() => {
    const primaryShellElement = primaryShellRef.current;
    const browserWindow = resolveTopbarBrowserWindow();
    if (!primaryShellElement) {
      return;
    }

    const updatePrimaryShellWidth = (): void => {
      const nextWidth = Math.round(primaryShellElement.getBoundingClientRect().width);
      setPrimaryShellWidth((previousWidth) => (previousWidth === nextWidth ? previousWidth : nextWidth));
    };

    updatePrimaryShellWidth();

    if (!browserWindow || typeof ResizeObserver === "undefined") {
      browserWindow?.addEventListener("resize", updatePrimaryShellWidth);
      return () => {
        browserWindow?.removeEventListener("resize", updatePrimaryShellWidth);
      };
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width || primaryShellElement.getBoundingClientRect().width);
      setPrimaryShellWidth((previousWidth) => (previousWidth === nextWidth ? previousWidth : nextWidth));
    });

    resizeObserver.observe(primaryShellElement);
    browserWindow.addEventListener("resize", updatePrimaryShellWidth);
    return () => {
      resizeObserver.disconnect();
      browserWindow.removeEventListener("resize", updatePrimaryShellWidth);
    };
  }, [primaryActions.length]);


  const handleUserDropdownOpenChange = useCallback((open: boolean): void => {
    setActiveSurface(open ? "user-menu" : "none");
  }, []);

  const hiddenPrimaryActions = useMemo(
    () =>
      primaryActionPresentation.hiddenActions.map((action) => ({
        ...action,
        onClick: () => {
          setActiveSurface("none");
          action.onClick();
        }
      })),
    [primaryActionPresentation.hiddenActions]
  );

  const userCenterTrigger = useMemo(
    () => (
      <GlobalUserControlDropdown
        service={userControlService}
        displayName={profile.displayName}
        subtitle={profile.subtitle}
        avatarFallback="WU"
        open={isUserMenuOpen}
        onOpenChange={handleUserDropdownOpenChange}
      />
    ),
    [handleUserDropdownOpenChange, isUserMenuOpen, profile.displayName, profile.subtitle, userControlService]
  );

  const resolvedRightRegistrations = useMemo(
    () =>
      resolveAppTopbarRightRegistrations({
        isLightTheme,
        utilityActions,
        classNames: workspaceShellTopbarClassNames,
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

  const primaryActionsForRender = hasPrimaryOverflow
    ? primaryActionPresentation.visibleActions
    : primaryActions;

  const primaryToggleAction = useMemo(() => {
    if (!hasPrimaryOverflow) {
      return null;
    }

    return {
      id: "workspace-primary-nav-toggle",
      label: isPrimaryExpanded ? topbarCopy.hide : topbarCopy.more,
      tone: "subtle" as const,
      className: "is-primary-nav-toggle",
      ariaLabel: isPrimaryExpanded ? topbarCopy.collapseAria : topbarCopy.expandAria,
      onClick: () => {
        setActiveSurface((previousSurface) =>
          previousSurface === "primary-overflow" ? "none" : "primary-overflow"
        );
      }
    };
  }, [hasPrimaryOverflow, isPrimaryExpanded, topbarCopy.collapseAria, topbarCopy.expandAria, topbarCopy.hide, topbarCopy.more]);

  const primaryGroups = useMemo(
    () => resolveWorkspaceTopbarPrimaryGroups(primaryActionsForRender, locale),
    [locale, primaryActionsForRender]
  );

  const primaryNavigationContent = useMemo(() => {
    if (primaryGroups.length === 0 && !primaryToggleAction) {
      return null;
    }

    return (
      <div ref={primaryShellRef} className="workspace-topbar-primary-groups-shell">
        {primaryGroups.length > 0 ? (
          <div className="workspace-topbar-primary-groups" role="group" aria-label={topbarCopy.primaryNavigationAria}>
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
                {group.actions.map((action) =>
                  renderAppTopbarActionButton(action, "primary", workspaceShellTopbarClassNames)
                )}
              </div>
            ))}
          </div>
        ) : null}

        {primaryToggleAction ? (
          <div className="workspace-topbar-primary-inline-toggle" role="group" aria-label={topbarCopy.primaryControlsAria}>
            <button
              type="button"
              className={`workspace-topbar-toggle-icon-button ${isPrimaryExpanded ? "is-expanded" : "is-collapsed"}`}
              aria-label={primaryToggleAction.ariaLabel}
              aria-expanded={isPrimaryExpanded}
              aria-controls={APP_GLOBAL_OVERFLOW_PANEL_ID}
              aria-haspopup="menu"
              title={primaryToggleAction.label}
              onClick={primaryToggleAction.onClick}
            >
              <span className="workspace-topbar-toggle-button-content" aria-hidden="true">
                <span className="workspace-topbar-toggle-glyph-shell">
                  <AppstoreOutlined className="workspace-topbar-toggle-panel-icon" />
                </span>
                <span className="workspace-topbar-toggle-label">{primaryToggleAction.label}</span>
                {!isPrimaryExpanded ? (
                  <span className="workspace-topbar-toggle-badge">
                    <span className="workspace-topbar-toggle-badge-count">{hiddenPrimaryActions.length}</span>
                  </span>
                ) : null}
                <span className="workspace-topbar-toggle-icon">⌄</span>
              </span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }, [
    hiddenPrimaryActions.length,
    isPrimaryExpanded,
    primaryGroups,
    primaryToggleAction,
    topbarCopy.primaryControlsAria,
    topbarCopy.primaryNavigationAria
  ]);

  const expandedPrimaryPanel = useMemo(() => {
    if (!hasPrimaryOverflow || hiddenPrimaryActions.length === 0) {
      return null;
    }

    const overflowPresentation = resolveWorkspaceOverflowPresentation(hiddenPrimaryActions, locale);

    return (
      <div
        id={APP_GLOBAL_OVERFLOW_PANEL_ID}
        className={`workspace-topbar-overflow-wrapper ${isPrimaryExpanded ? "is-expanded" : "is-collapsed"}`}
        aria-hidden={!isPrimaryExpanded}
      >
        <div className={workspaceShellTopbarClassNames.overflowPanel} role="region" aria-label={topbarCopy.expandedPanelAria}>
          <div className="workspace-topbar-overflow-header">
            <h3 className="workspace-topbar-overflow-title">{overflowPresentation.titleText}</h3>
            {overflowPresentation.hintText ? (
              <p className="workspace-topbar-overflow-hint">{overflowPresentation.hintText}</p>
            ) : null}
            {overflowPresentation.metrics.length > 0 ? (
              <div className="workspace-topbar-overflow-metrics">
                {overflowPresentation.metrics.map((metricAction) =>
                  renderAppTopbarActionButton(metricAction, "primary", workspaceShellTopbarClassNames)
                )}
              </div>
            ) : null}
          </div>

          <div className="workspace-topbar-overflow-groups">
            {overflowPresentation.groups.map((group) => (
              <section key={group.id} className={`workspace-topbar-overflow-group${group.active ? " is-active" : ""}`}>
                <div className="workspace-topbar-overflow-group-header">
                  <h4 className="workspace-topbar-overflow-group-title">{group.title}</h4>
                  <span className="workspace-topbar-overflow-group-count" aria-label={`${group.actions.length} actions`}>
                    {group.countLabel}
                  </span>
                </div>
                <div className="workspace-topbar-overflow-group-actions">
                  {group.actions.map((action) =>
                    renderAppTopbarActionButton(action, "primary", workspaceShellTopbarClassNames)
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }, [hasPrimaryOverflow, hiddenPrimaryActions, isPrimaryExpanded, locale, topbarCopy.expandedPanelAria]);

  return (
    <div ref={interactionScopeRef} className="workspace-topbar-interaction-scope">
      <AppShellTopbar
        variant="workspace-shell"
        shellClassName="animated-fade-down workspace-topbar-shell"
        dataAnimated
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        onBrandClick={onBrandClick}
        isLightTheme={isLightTheme}
        primaryActions={[]}
        primaryNavigationContent={primaryNavigationContent}
        rightRegistrations={resolvedRightRegistrations}
      />
      {expandedPrimaryPanel}
    </div>
  );
}
