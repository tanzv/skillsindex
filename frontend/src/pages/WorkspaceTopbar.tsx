import { AppstoreOutlined, DownOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SessionUser } from "../lib/api";
import GlobalUserControlDropdown from "../components/GlobalUserControlDropdown";
import type { GlobalUserControlService } from "../lib/globalUserControlService";
import type { AppLocale } from "../lib/i18n";
import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import MarketplaceTopbarBase from "./MarketplaceTopbarBase";
import type { MarketplaceTopbarRightRegistration } from "./MarketplaceTopbar.rightRegistry";
import {
  renderMarketplaceTopbarActionButton,
  renderMarketplaceTopbarRightRegistrations,
  resolveMarketplaceTopbarRightRegistrations
} from "./MarketplaceTopbar.shared";
import {
  resolveWorkspaceOverflowPresentation,
  resolveWorkspacePrimaryActionPresentation,
  resolveWorkspaceTopbarPrimaryGroups,
  resolveWorkspaceTopbarUserProfile
} from "./WorkspaceTopbar.helpers";

interface WorkspaceTopbarProps {
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

const WORKSPACE_OVERFLOW_PANEL_ID = "workspace-topbar-overflow-panel";
type WorkspaceTopbarSurface = "none" | "primary-overflow" | "user-menu";

export default function WorkspaceTopbar({
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
}: WorkspaceTopbarProps) {
  const profile = useMemo(() => resolveWorkspaceTopbarUserProfile(sessionUser, locale), [locale, sessionUser]);
  const [activeSurface, setActiveSurface] = useState<WorkspaceTopbarSurface>(
    defaultPrimaryExpanded ? "primary-overflow" : "none"
  );
  const interactionScopeRef = useRef<HTMLDivElement | null>(null);
  const primaryActionPresentation = useMemo(
    () => resolveWorkspacePrimaryActionPresentation(primaryActions),
    [primaryActions]
  );
  const hasPrimaryOverflow = primaryActionPresentation.hiddenActions.length > 0;
  const isPrimaryExpanded = activeSurface === "primary-overflow";
  const isUserMenuOpen = activeSurface === "user-menu";
  const topbarCopy = useMemo(() => {
    if (locale === "zh") {
      return {
        more: "\u66f4\u591a",
        hide: "\u6536\u8d77",
        expandAria: "\u5c55\u5f00\u5e94\u7528\u5bfc\u822a\u9762\u677f",
        collapseAria: "\u6536\u8d77\u5e94\u7528\u5bfc\u822a\u9762\u677f",
        primaryNavigationAria: "\u4e3b\u5bfc\u822a",
        primaryControlsAria: "\u4e3b\u5bfc\u822a\u63a7\u5236",
        expandedPanelAria: "\u5df2\u5c55\u5f00\u7684\u5e94\u7528\u5bfc\u822a\u9762\u677f"
      };
    }

    return {
      more: "More",
      hide: "Hide",
      expandAria: "Expand app navigation panel",
      collapseAria: "Collapse app navigation panel",
      primaryNavigationAria: "Primary navigation",
      primaryControlsAria: "Primary navigation controls",
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
    if (primaryGroups.length === 0) {
      return null;
    }

    return (
      <div className="workspace-topbar-primary-groups-shell">
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
              {group.actions.map((action) => renderMarketplaceTopbarActionButton(action, "primary"))}
            </div>
          ))}
        </div>
      </div>
    );
  }, [primaryGroups, topbarCopy.primaryNavigationAria]);

  const expandedPrimaryPanel = useMemo(() => {
    if (!hasPrimaryOverflow || hiddenPrimaryActions.length === 0) {
      return null;
    }

    const overflowPresentation = resolveWorkspaceOverflowPresentation(hiddenPrimaryActions, locale);

    return (
      <div
        id={WORKSPACE_OVERFLOW_PANEL_ID}
        className={`workspace-topbar-overflow-wrapper ${isPrimaryExpanded ? "is-expanded" : "is-collapsed"}`}
        aria-hidden={!isPrimaryExpanded}
      >
        <div className="marketplace-topbar-overflow-panel" role="region" aria-label={topbarCopy.expandedPanelAria}>
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
              <section key={group.id} className={`workspace-topbar-overflow-group${group.active ? " is-active" : ""}`}>
                <div className="workspace-topbar-overflow-group-header">
                  <h4 className="workspace-topbar-overflow-group-title">{group.title}</h4>
                  <span className="workspace-topbar-overflow-group-count" aria-label={`${group.actions.length} actions`}>
                    {group.countLabel}
                  </span>
                </div>
                <div className="workspace-topbar-overflow-group-actions">
                  {group.actions.map((action) => renderMarketplaceTopbarActionButton(action, "primary"))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }, [hasPrimaryOverflow, hiddenPrimaryActions, isPrimaryExpanded, locale, topbarCopy.expandedPanelAria]);

  const primaryTrailingContent = useMemo(() => {
    if (!primaryToggleAction) {
      return null;
    }

    return (
      <div className="workspace-topbar-primary-inline-toggle" role="group" aria-label={topbarCopy.primaryControlsAria}>
        <button
          type="button"
          className={`workspace-topbar-toggle-icon-button ${isPrimaryExpanded ? "is-expanded" : "is-collapsed"}`}
          aria-label={primaryToggleAction.ariaLabel}
          aria-expanded={isPrimaryExpanded}
          aria-controls={WORKSPACE_OVERFLOW_PANEL_ID}
          aria-haspopup="menu"
          title={primaryToggleAction.label}
          onClick={primaryToggleAction.onClick}
        >
          <span className="workspace-topbar-toggle-button-content" aria-hidden="true">
            <span className="workspace-topbar-toggle-glyph-shell">
              <AppstoreOutlined className="workspace-topbar-toggle-panel-icon" />
            </span>
            {!isPrimaryExpanded ? (
              <span className="workspace-topbar-toggle-badge">
                <span className="workspace-topbar-toggle-badge-count">{hiddenPrimaryActions.length}</span>
              </span>
            ) : null}
            <DownOutlined className="workspace-topbar-toggle-icon" />
          </span>
        </button>
        {expandedPrimaryPanel}
      </div>
    );
  }, [expandedPrimaryPanel, hiddenPrimaryActions.length, isPrimaryExpanded, primaryToggleAction, topbarCopy.primaryControlsAria]);

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
        primaryTrailingContent={primaryTrailingContent}
        renderPrimaryActionButton={(action) => renderMarketplaceTopbarActionButton(action, "primary")}
        rightContent={rightContent}
      />
    </div>
  );
}
