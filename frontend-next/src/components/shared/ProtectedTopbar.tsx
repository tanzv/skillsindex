"use client";

import { ChevronDown, LayoutGrid, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";
import { formatProtectedMessage, type ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";
import { buildProtectedTopbarModel, type ProtectedTopbarConfig, resolveProtectedResponsivePrimaryVisibleCount } from "./protectedTopbarModel";
import type { AccountCenterMenuConfig } from "./protectedTopbarConfigs";
import { AccountCenterMenu } from "./AccountCenterMenu";

type ProtectedThemePreference = "light" | "dark";

export interface ProtectedTopbarProps {
  pathname: string;
  session: SessionContext;
  brandTitle: string;
  brandSubtitle: string;
  brandHref: string;
  config: ProtectedTopbarConfig;
  accountCenterMenu: AccountCenterMenuConfig;
  dataTestId: string;
  navigationAriaLabel: string;
  messages: ProtectedTopbarMessages;
  utilityLink?: {
    href: string;
    label: string;
  };
  theme: ProtectedThemePreference;
  onThemeChange: (nextTheme: ProtectedThemePreference) => void;
  defaultOverflowExpanded?: boolean;
  onOpenNavigation?: () => void;
  navigationToggleLabel?: string;
  navigationToggleTestId?: string;
  navigationToggleControlsId?: string;
  navigationToggleExpanded?: boolean;
}

function resolveTopbarWindow(): (Window & typeof globalThis) | null {
  if (typeof window === "undefined" || typeof window.innerWidth !== "number") {
    return null;
  }
  return window;
}

function resolveProtectedNavigationToggleVisibility(viewportWidth: number | null) {
  if (viewportWidth === null) {
    return false;
  }
  return viewportWidth <= 1180;
}

function resolvePendingPrimaryVisibleCount(config: ProtectedTopbarConfig) {
  return Math.min(4, Math.max(2, config.entries.length));
}

const useSynchronizedLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ProtectedTopbar({
  pathname,
  session,
  brandTitle,
  brandSubtitle,
  brandHref,
  config,
  accountCenterMenu,
  dataTestId,
  navigationAriaLabel,
  messages,
  utilityLink,
  theme,
  onThemeChange,
  defaultOverflowExpanded = false,
  onOpenNavigation,
  navigationToggleLabel = "Open navigation",
  navigationToggleTestId,
  navigationToggleControlsId,
  navigationToggleExpanded = false
}: ProtectedTopbarProps) {
  const [isOverflowExpanded, setIsOverflowExpanded] = useState(defaultOverflowExpanded);
  const overflowScopeRef = useRef<HTMLDivElement | null>(null);
  const primaryNavigationRef = useRef<HTMLElement | null>(null);
  const overflowPanelId = `${dataTestId}-overflow-panel-region`;
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [primaryShellWidth, setPrimaryShellWidth] = useState<number | null>(null);
  const [hasMeasuredPrimaryNavigation, setHasMeasuredPrimaryNavigation] = useState(false);
  const pendingPrimaryVisibleCount = useMemo(() => resolvePendingPrimaryVisibleCount(config), [config]);
  const primaryVisibleCount = useMemo(() => {
    return hasMeasuredPrimaryNavigation ? resolveProtectedResponsivePrimaryVisibleCount(primaryShellWidth) : pendingPrimaryVisibleCount;
  }, [hasMeasuredPrimaryNavigation, pendingPrimaryVisibleCount, primaryShellWidth]);
  const model = useMemo(() => buildProtectedTopbarModel(pathname, config, primaryVisibleCount), [config, pathname, primaryVisibleCount]);
  const hasOverflow = model.hiddenEntries.length > 0;
  const overflowExpanded = hasOverflow && isOverflowExpanded;
  const showNavigationToggle = resolveProtectedNavigationToggleVisibility(viewportWidth);

  const primaryNavigation = (
    <nav ref={primaryNavigationRef} className="workspace-shell-topbar-light-nav protected-topbar-primary-nav" aria-label={navigationAriaLabel}>
      <div
        className="workspace-topbar-primary-groups-shell protected-topbar-primary-shell"
        data-navigation-ready={hasMeasuredPrimaryNavigation ? "true" : "false"}
      >
        {model.primaryGroups.length > 0 ? (
          <div className="workspace-topbar-primary-groups" role="group" aria-label={navigationAriaLabel}>
            {model.primaryGroups.map((group) => (
              <div key={group.id} className={`workspace-topbar-primary-group is-${group.kind}-group`} role="group" aria-label={group.label}>
                <span className="workspace-topbar-primary-group-label" aria-hidden="true">
                  {group.tagLabel}
                </span>
                {group.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    aria-current={entry.active ? "page" : undefined}
                    className={cn("workspace-shell-topbar-nav-button", entry.active && "is-active")}
                  >
                    <span className="workspace-shell-topbar-action-label">{entry.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {hasOverflow ? (
          <div className="workspace-topbar-primary-inline-toggle" role="group" aria-label={messages.overflowControlsAriaLabel}>
            <button
              type="button"
              data-testid={`${dataTestId}-more`}
              className={cn("workspace-topbar-toggle-icon-button", overflowExpanded ? "is-expanded" : "is-collapsed")}
              aria-label={overflowExpanded ? messages.collapseNavigationPanel : messages.expandNavigationPanel}
              aria-expanded={overflowExpanded}
              aria-controls={overflowPanelId}
              aria-haspopup="menu"
              title={overflowExpanded ? messages.hideLabel : messages.moreLabel}
              onClick={() => setIsOverflowExpanded((previousValue) => !previousValue)}
            >
              <span className="workspace-topbar-toggle-button-content" aria-hidden="true">
                <span className="workspace-topbar-toggle-glyph-shell">
                  <LayoutGrid className="workspace-topbar-toggle-panel-icon" />
                </span>
                {!overflowExpanded ? (
                  <span className="workspace-topbar-toggle-badge">
                    <span className="workspace-topbar-toggle-badge-count">{model.hiddenEntries.length}</span>
                  </span>
                ) : null}
                <ChevronDown className="workspace-topbar-toggle-icon" />
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );

  useEffect(() => {
    if (!overflowExpanded) {
      return;
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const overflowScopeElement = overflowScopeRef.current;
      if (!overflowScopeElement || !(event.target instanceof Node)) {
        return;
      }

      if (!overflowScopeElement.contains(event.target)) {
        setIsOverflowExpanded(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOverflowExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [overflowExpanded]);

  useEffect(() => {
    const browserWindow = resolveTopbarWindow();
    if (!browserWindow) {
      return;
    }

    const updateViewportWidth = () => {
      setViewportWidth((previousWidth) => (previousWidth === browserWindow.innerWidth ? previousWidth : browserWindow.innerWidth));
    };

    updateViewportWidth();
    browserWindow.addEventListener("resize", updateViewportWidth);
    return () => {
      browserWindow.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  useSynchronizedLayoutEffect(() => {
    const navigationElement = primaryNavigationRef.current;
    const browserWindow = resolveTopbarWindow();
    if (!navigationElement) {
      return;
    }

    let frameId: number | null = null;

    const commitPrimaryShellWidth = (nextWidth: number) => {
      setHasMeasuredPrimaryNavigation(true);
      setPrimaryShellWidth((previousWidth) => (previousWidth === nextWidth ? previousWidth : nextWidth));
    };

    const updatePrimaryShellWidth = () => {
      const nextWidth = Math.round(navigationElement.getBoundingClientRect().width);
      commitPrimaryShellWidth(nextWidth);
    };

    const schedulePrimaryShellWidthUpdate = () => {
      if (!browserWindow || typeof browserWindow.requestAnimationFrame !== "function") {
        updatePrimaryShellWidth();
        return;
      }

      if (frameId !== null) {
        browserWindow.cancelAnimationFrame(frameId);
      }

      frameId = browserWindow.requestAnimationFrame(() => {
        frameId = null;
        updatePrimaryShellWidth();
      });
    };

    schedulePrimaryShellWidthUpdate();

    if (!browserWindow || typeof ResizeObserver === "undefined") {
      browserWindow?.addEventListener("resize", schedulePrimaryShellWidthUpdate);
      return () => {
        if (frameId !== null) {
          browserWindow?.cancelAnimationFrame(frameId);
        }
        browserWindow?.removeEventListener("resize", schedulePrimaryShellWidthUpdate);
      };
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width || navigationElement.getBoundingClientRect().width);
      commitPrimaryShellWidth(nextWidth);
    });

    resizeObserver.observe(navigationElement);
    browserWindow.addEventListener("resize", schedulePrimaryShellWidthUpdate);
    return () => {
      if (frameId !== null) {
        browserWindow.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      browserWindow.removeEventListener("resize", schedulePrimaryShellWidthUpdate);
    };
  }, [config.entries.length]);

  return (
    <div ref={overflowScopeRef} className="workspace-topbar-interaction-scope protected-topbar-interaction-scope" data-testid={dataTestId}>
      <div className="workspace-topbar-shell workspace-shell-topbar-shell protected-topbar-shell">
        <div className="workspace-shell-topbar protected-topbar">
          <div className="protected-topbar-header-row" data-testid={`${dataTestId}-header-row`}>
            <div className="protected-topbar-leading-group">
              {onOpenNavigation ? (
                <button
                  type="button"
                  data-testid={navigationToggleTestId}
                  className="protected-topbar-menu-trigger"
                  style={showNavigationToggle ? { display: "inline-flex" } : undefined}
                  aria-label={navigationToggleLabel}
                  aria-controls={navigationToggleControlsId}
                  aria-expanded={navigationToggleExpanded}
                  onClick={onOpenNavigation}
                >
                  <PanelLeft className="protected-topbar-menu-trigger-icon" />
                </button>
              ) : null}

              <Link href={brandHref} className="workspace-shell-topbar-brand protected-topbar-brand">
                <span className="workspace-shell-topbar-brand-dot" aria-hidden="true" />
                <span className="workspace-shell-topbar-brand-copy">
                  <strong>{brandTitle}</strong>
                  <small>{brandSubtitle}</small>
                </span>
              </Link>

              <div className="protected-topbar-navigation-row" data-testid={`${dataTestId}-nav-row`}>
                {primaryNavigation}
              </div>
            </div>

            <div className="protected-topbar-trailing-group">
              <div className="workspace-shell-topbar-light-utility protected-topbar-utility" data-testid={`${dataTestId}-utility`}>
                {utilityLink ? (
                  <Link href={utilityLink.href} className="workspace-shell-topbar-nav-button workspace-shell-topbar-utility-link">
                    <span className="workspace-shell-topbar-action-label">{utilityLink.label}</span>
                  </Link>
                ) : null}
              </div>

              <AccountCenterMenu
                session={session}
                messages={messages}
                menuConfig={accountCenterMenu}
                theme={theme}
                onThemeChange={onThemeChange}
                dataTestId={dataTestId}
                onExpandedChange={(isExpanded) => {
                  if (isExpanded) {
                    setIsOverflowExpanded(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {hasOverflow ? (
        <div
          id={overflowPanelId}
          className={cn("workspace-topbar-overflow-wrapper", "protected-topbar-overflow", overflowExpanded ? "is-expanded" : "is-collapsed")}
          aria-hidden={!overflowExpanded}
        >
          <div
            className="workspace-shell-topbar-overflow-panel"
            role="region"
            aria-label={messages.overflowPanelAriaLabel}
            data-testid={`${dataTestId}-overflow-panel`}
          >
            <div className="workspace-topbar-overflow-header">
              <div className="workspace-topbar-overflow-title-block">
                <h3 className="workspace-topbar-overflow-title">{model.overflow.title}</h3>
              </div>
              <div className="workspace-topbar-overflow-summary" aria-hidden="true">
                {model.overflow.groups.map((group) => (
                  <span key={group.id} className={cn("workspace-topbar-overflow-summary-pill", group.active && "is-active")}>
                    <span className="workspace-topbar-overflow-summary-pill-label">{group.title}</span>
                    <span className="workspace-topbar-overflow-summary-pill-count">{group.countLabel}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="workspace-topbar-overflow-groups">
              {model.overflow.groups.map((group) => (
                <section
                  key={group.id}
                  className={cn("workspace-topbar-overflow-group", group.active && "is-active")}
                  data-testid={`${dataTestId}-overflow-group-${group.id}`}
                >
                  <div className="workspace-topbar-overflow-group-header">
                    <h4 className="workspace-topbar-overflow-group-title">{group.title}</h4>
                    <span
                      className="workspace-topbar-overflow-group-count"
                      aria-label={formatProtectedMessage(messages.overflowGroupCountAriaLabelTemplate, {
                        count: group.entries.length
                      })}
                    >
                      {group.countLabel}
                    </span>
                  </div>

                  <div className="workspace-topbar-overflow-group-actions">
                    {group.entries.map((entry) => (
                      <Link
                        key={entry.id}
                        href={entry.href}
                        aria-current={entry.active ? "page" : undefined}
                        className={cn("workspace-shell-topbar-nav-button", entry.active && "is-active")}
                      >
                        <span className="workspace-shell-topbar-action-copy">
                          <span className="workspace-shell-topbar-action-label">{entry.label}</span>
                          <span className="workspace-shell-topbar-action-note">{entry.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
