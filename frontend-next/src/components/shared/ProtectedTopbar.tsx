"use client";

import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";

import {
  buildProtectedTopbarModel,
  type ProtectedTopbarConfig,
  resolveProtectedPrimaryShellWidth,
  resolveProtectedResponsivePrimaryVisibleCount
} from "./protectedTopbarModel";

export interface ProtectedTopbarProps {
  pathname: string;
  session: SessionContext;
  brandTitle: string;
  brandSubtitle: string;
  brandHref: string;
  config: ProtectedTopbarConfig;
  dataTestId: string;
  navigationAriaLabel: string;
  utilityLink?: {
    href: string;
    label: string;
  };
  defaultOverflowExpanded?: boolean;
}

function resolveTopbarWindow(): (Window & typeof globalThis) | null {
  if (typeof window === "undefined" || typeof window.innerWidth !== "number") {
    return null;
  }

  return window;
}

function resolveUserInitials(displayName: string) {
  const tokens = displayName
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return "GU";
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0] || ""}${tokens[1][0] || ""}`.toUpperCase();
}

export function ProtectedTopbar({
  pathname,
  session,
  brandTitle,
  brandSubtitle,
  brandHref,
  config,
  dataTestId,
  navigationAriaLabel,
  utilityLink,
  defaultOverflowExpanded = false
}: ProtectedTopbarProps) {
  const [isOverflowExpanded, setIsOverflowExpanded] = useState(defaultOverflowExpanded);
  const interactionScopeRef = useRef<HTMLDivElement | null>(null);
  const primaryNavigationRef = useRef<HTMLElement | null>(null);
  const overflowPanelId = `${dataTestId}-overflow-panel-region`;
  const [primaryShellWidth, setPrimaryShellWidth] = useState<number | null>(() => {
    const browserWindow = resolveTopbarWindow();
    return browserWindow ? resolveProtectedPrimaryShellWidth(browserWindow.innerWidth) : null;
  });

  const primaryVisibleCount = useMemo(
    () => resolveProtectedResponsivePrimaryVisibleCount(primaryShellWidth),
    [primaryShellWidth]
  );
  const model = useMemo(() => buildProtectedTopbarModel(pathname, config, primaryVisibleCount), [config, pathname, primaryVisibleCount]);
  const hasOverflow = model.hiddenEntries.length > 0;
  const overflowExpanded = hasOverflow && isOverflowExpanded;
  const userName = session.user?.displayName || session.user?.username || "Guest User";
  const userSubtitle = `${session.user?.role || "guest"} · ${session.user?.status || "visitor"}`;
  const userInitials = resolveUserInitials(userName);

  useEffect(() => {
    if (!overflowExpanded) {
      return;
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const interactionScopeElement = interactionScopeRef.current;
      if (!interactionScopeElement || !(event.target instanceof Node)) {
        return;
      }

      if (!interactionScopeElement.contains(event.target)) {
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
    const navigationElement = primaryNavigationRef.current;
    const browserWindow = resolveTopbarWindow();
    if (!navigationElement) {
      return;
    }

    const updatePrimaryShellWidth = () => {
      const nextWidth = Math.round(navigationElement.getBoundingClientRect().width);
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
      const nextWidth = Math.round(entries[0]?.contentRect.width || navigationElement.getBoundingClientRect().width);
      setPrimaryShellWidth((previousWidth) => (previousWidth === nextWidth ? previousWidth : nextWidth));
    });

    resizeObserver.observe(navigationElement);
    browserWindow.addEventListener("resize", updatePrimaryShellWidth);
    return () => {
      resizeObserver.disconnect();
      browserWindow.removeEventListener("resize", updatePrimaryShellWidth);
    };
  }, [model.entries.length]);

  return (
    <div ref={interactionScopeRef} className="workspace-topbar-interaction-scope" data-testid={dataTestId}>
      <div className="workspace-topbar-shell workspace-shell-topbar-shell">
        <div className="workspace-shell-topbar">
          <div className="workspace-shell-topbar-left-group">
            <Link href={brandHref} className="workspace-shell-topbar-brand">
              <span className="workspace-shell-topbar-brand-dot" aria-hidden="true" />
              <span className="workspace-shell-topbar-brand-copy">
                <strong>{brandTitle}</strong>
                <small>{brandSubtitle}</small>
              </span>
            </Link>

            <nav ref={primaryNavigationRef} className="workspace-shell-topbar-light-nav" aria-label={navigationAriaLabel}>
              <div className="workspace-topbar-primary-groups-shell">
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
                  <div className="workspace-topbar-primary-inline-toggle" role="group" aria-label="Protected navigation overflow controls">
                    <button
                      type="button"
                      data-testid={`${dataTestId}-more`}
                      className={cn("workspace-topbar-toggle-icon-button", overflowExpanded ? "is-expanded" : "is-collapsed")}
                      aria-label={overflowExpanded ? "Collapse protected navigation panel" : "Expand protected navigation panel"}
                      aria-expanded={overflowExpanded}
                      aria-controls={overflowPanelId}
                      aria-haspopup="menu"
                      title={overflowExpanded ? "Hide" : "More"}
                      onClick={() => {
                        setIsOverflowExpanded((previousValue) => !previousValue);
                      }}
                    >
                      <span className="workspace-topbar-toggle-button-content" aria-hidden="true">
                        <span className="workspace-topbar-toggle-glyph-shell">
                          <LayoutGrid className="workspace-topbar-toggle-panel-icon" />
                        </span>
                        <span className="workspace-topbar-toggle-label">{overflowExpanded ? "Hide" : "More"}</span>
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
          </div>

          <div className="workspace-shell-topbar-light-utility">
            {utilityLink ? (
              <Link href={utilityLink.href} className="workspace-shell-topbar-nav-button workspace-shell-topbar-utility-link">
                <span className="workspace-shell-topbar-action-label">{utilityLink.label}</span>
              </Link>
            ) : null}
            <span className="workspace-shell-topbar-status">
              {session.marketplacePublicAccess ? "Marketplace Public" : "Marketplace Restricted"}
            </span>
            <Link href="/account/profile" className="workspace-topbar-user-trigger" aria-label="Open account center">
              <span className="workspace-topbar-avatar">{userInitials}</span>
              <span className="workspace-topbar-user-meta">
                <strong>{userName}</strong>
                <small>{userSubtitle}</small>
              </span>
              <span className="workspace-topbar-user-chip">{session.marketplacePublicAccess ? "public" : "restricted"}</span>
              <ChevronDown className="workspace-topbar-user-icon" />
            </Link>
          </div>
        </div>
      </div>

      {hasOverflow ? (
        <div
          id={overflowPanelId}
          className={cn("workspace-topbar-overflow-wrapper", overflowExpanded ? "is-expanded" : "is-collapsed")}
          aria-hidden={!overflowExpanded}
        >
          <div
            className="workspace-shell-topbar-overflow-panel"
            role="region"
            aria-label="Expanded protected navigation panel"
            data-testid={`${dataTestId}-overflow-panel`}
          >
            <div className="workspace-topbar-overflow-header">
              <div className="workspace-topbar-overflow-title-block">
                <h3 className="workspace-topbar-overflow-title">{model.overflow.title}</h3>
                <p className="workspace-topbar-overflow-hint">{model.overflow.hint}</p>
              </div>
              <div className="workspace-topbar-overflow-metrics">
                {model.overflow.metrics.map((metric) => (
                  <span key={metric.id} className="workspace-topbar-overflow-metric">
                    <span className="workspace-topbar-overflow-metric-label">{metric.label}</span>
                    <span className="workspace-topbar-overflow-metric-value">{metric.value}</span>
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
                    <span className="workspace-topbar-overflow-group-count" aria-label={`${group.entries.length} actions`}>
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
