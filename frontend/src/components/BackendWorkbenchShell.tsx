import { MoreOutlined } from "@ant-design/icons";
import { Button, Popover } from "antd";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { QuickJumpActions, QuickJumpLabel, QuickJumpSection } from "../App.shared";
import { protectedWorkbenchSections, resolveProtectedWorkbenchSecondaryItems, resolveProtectedWorkbenchSection } from "../app/protectedWorkbenchConfig";
import type { NavigationItem, ProtectedRoute } from "../appNavigationConfig";
import GlobalUserControlDropdown from "./GlobalUserControlDropdown";
import {
  splitPrimaryNavSections
} from "./BackendWorkbenchShell.helpers";
import { createGlobalUserControlService } from "../lib/globalUserControlService";
import { createSystemUserControlRegistrations } from "../lib/systemUserControlRegistrations";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import BackendSecondaryMenu from "./BackendSecondaryMenu";

const PRIMARY_NAV_OVERFLOW_PANEL_ID = "backend-primary-overflow-panel";
const DEFAULT_VIEWPORT_WIDTH = 1600;

interface BackendWorkbenchText {
  brandName: string;
  brandTitle: string;
  home: string;
  homeSubtitle: string;
  quickJump: string;
}

interface BackendWorkbenchShellProps {
  route: ProtectedRoute;
  locale: AppLocale;
  themeMode: ThemeMode;
  submitLoading: boolean;
  sessionUser: {
    username: string;
    role: string;
  };
  navItems: NavigationItem[];
  navByPath: Map<ProtectedRoute, NavigationItem>;
  quickRoutes: ProtectedRoute[];
  text: BackendWorkbenchText;
  onNavigate: (path: string) => void;
  onLocaleChange: (locale: AppLocale) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function BackendWorkbenchShell({
  route,
  locale,
  themeMode,
  submitLoading,
  sessionUser,
  navItems,
  navByPath,
  quickRoutes,
  text,
  onNavigate,
  onLocaleChange,
  onThemeModeChange,
  onLogout,
  children
}: BackendWorkbenchShellProps) {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth
  );
  const [primaryOverflowOpen, setPrimaryOverflowOpen] = useState(false);
  const [secondaryCollapsed, setSecondaryCollapsed] = useState(false);
  const userControlRegistrations = useMemo(
    () =>
      createSystemUserControlRegistrations({
        onNavigate,
        currentPath: route
      }),
    [onNavigate, route]
  );
  const globalUserControlService = useMemo(
    () =>
      createGlobalUserControlService({
        locale,
        themeMode,
        onThemeModeChange,
        onLocaleChange,
        onLogout,
        logoutDisabled: submitLoading,
        registrations: userControlRegistrations
    }),
    [locale, onLocaleChange, onLogout, onThemeModeChange, submitLoading, themeMode, userControlRegistrations]
  );
  const activeSection = useMemo(() => resolveProtectedWorkbenchSection(route), [route]);
  const secondaryItems = useMemo(
    () => resolveProtectedWorkbenchSecondaryItems(route, navItems),
    [navItems, route]
  );
  const { visibleSections, hiddenSections } = useMemo(
    () => splitPrimaryNavSections(protectedWorkbenchSections, activeSection.id, viewportWidth),
    [activeSection.id, viewportWidth]
  );
  const canCollapseSecondaryNav = viewportWidth >= 1120;
  const userCenterTrigger = useMemo(
    () => (
      <GlobalUserControlDropdown
        service={globalUserControlService}
        displayName={sessionUser.username}
        subtitle={sessionUser.role}
        avatarFallback="BU"
        triggerDataTestId="backend-user-center-trigger"
        overlayClassName="workspace-topbar-user-dropdown backend-user-dropdown"
      />
    ),
    [globalUserControlService, sessionUser.role, sessionUser.username]
  );
  const handleNavigate = useCallback(
    (path: ProtectedRoute | "/") => {
      setPrimaryOverflowOpen(false);
      onNavigate(path);
    },
    [onNavigate]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canCollapseSecondaryNav && secondaryCollapsed) {
      setSecondaryCollapsed(false);
    }
  }, [canCollapseSecondaryNav, secondaryCollapsed]);

  useEffect(() => {
    if (hiddenSections.length === 0 && primaryOverflowOpen) {
      setPrimaryOverflowOpen(false);
    }
  }, [hiddenSections.length, primaryOverflowOpen]);

  const overflowPanel = useMemo(
    () => (
      <div
        className="backend-primary-overflow-panel"
        data-testid="backend-primary-overflow-panel"
        id={PRIMARY_NAV_OVERFLOW_PANEL_ID}
        role="dialog"
        aria-label="Additional control sections"
      >
        <div className="backend-primary-overflow-header">
          <strong>More Sections</strong>
          <span>{`${hiddenSections.length} hidden`}</span>
        </div>
        <div className="backend-primary-overflow-list">
          {hiddenSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={section.id === activeSection.id ? "backend-primary-overflow-item active" : "backend-primary-overflow-item"}
              onClick={() => handleNavigate(section.landingRoute)}
              aria-current={section.id === activeSection.id ? "page" : undefined}
              aria-pressed={section.id === activeSection.id}
            >
              <strong>{section.label}</strong>
              <span>{section.landingRoute}</span>
            </button>
          ))}
        </div>
      </div>
    ),
    [activeSection.id, handleNavigate, hiddenSections]
  );

  return (
    <div className="backend-shell">
      <header className="backend-topbar">
        <div className="backend-topbar-brand">
          <span className="brand-kicker">{text.brandName}</span>
          <div className="backend-topbar-brand-copy">
            <h1>{text.brandTitle}</h1>
            <p>{text.homeSubtitle}</p>
          </div>
        </div>

        <nav className="backend-primary-nav" aria-label="Backend primary navigation">
          <span className="backend-primary-nav-label">Control Sections</span>
          <div className="backend-primary-nav-list">
            {visibleSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={section.id === activeSection.id ? "backend-primary-nav-item active" : "backend-primary-nav-item"}
                onClick={() => handleNavigate(section.landingRoute)}
                aria-current={section.id === activeSection.id ? "page" : undefined}
                aria-pressed={section.id === activeSection.id}
              >
                {section.label}
              </button>
            ))}
            {hiddenSections.length > 0 ? (
              <Popover
                content={overflowPanel}
                trigger={["click"]}
                placement="bottom"
                classNames={{ root: "backend-primary-overflow-popover" }}
                open={primaryOverflowOpen}
                onOpenChange={setPrimaryOverflowOpen}
              >
                <button
                  type="button"
                  className={`backend-primary-overflow-trigger${primaryOverflowOpen ? " active" : ""}`}
                  aria-controls={PRIMARY_NAV_OVERFLOW_PANEL_ID}
                  aria-expanded={primaryOverflowOpen}
                  aria-haspopup="dialog"
                  data-testid="backend-primary-overflow-trigger"
                >
                  <MoreOutlined />
                  <span>{`More (${hiddenSections.length})`}</span>
                </button>
              </Popover>
            ) : null}
          </div>
        </nav>

        <div className="backend-topbar-actions">
          <button type="button" className="backend-marketplace-link" onClick={() => handleNavigate("/")}>
            {text.home}
          </button>
          {userCenterTrigger}
        </div>
      </header>

      <div className={`backend-shell-body${secondaryCollapsed ? " is-sidebar-collapsed" : ""}`}>
        <BackendSecondaryMenu
          activeRoute={route}
          sectionLabel={activeSection.label}
          items={secondaryItems}
          collapsed={secondaryCollapsed}
          canCollapse={canCollapseSecondaryNav}
          onNavigate={handleNavigate}
          onToggleCollapse={() => setSecondaryCollapsed((previous) => !previous)}
        />

        <main className="backend-main-panel">
          {quickRoutes.length > 0 ? (
            <QuickJumpSection aria-label="quick route jump">
              <QuickJumpLabel>{text.quickJump}</QuickJumpLabel>
              <QuickJumpActions>
                {quickRoutes.map((path) => (
                  <Button key={path} type={path === route ? "primary" : "default"} size="small" onClick={() => onNavigate(path)}>
                    {navByPath.get(path)?.title || path}
                  </Button>
                ))}
              </QuickJumpActions>
            </QuickJumpSection>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
