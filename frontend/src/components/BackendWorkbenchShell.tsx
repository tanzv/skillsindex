import { Button } from "antd";
import { ReactNode, useMemo } from "react";

import { QuickJumpActions, QuickJumpLabel, QuickJumpSection } from "../App.shared";
import type { NavigationItem, ProtectedRoute } from "../appNavigationConfig";
import GlobalUserControlDropdown from "./GlobalUserControlDropdown";
import { createGlobalUserControlService } from "../lib/globalUserControlService";
import { createSystemUserControlRegistrations } from "../lib/systemUserControlRegistrations";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";

interface BackendWorkbenchText {
  brandName: string;
  brandTitle: string;
  home: string;
  homeSubtitle: string;
  signOut: string;
  quickJump: string;
}

interface BackendWorkbenchPrimarySection {
  id: "overview" | "catalog" | "operations" | "security" | "account";
  label: string;
  routes: ProtectedRoute[];
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

function buildPrimarySections(): BackendWorkbenchPrimarySection[] {
  return [
    {
      id: "overview",
      label: "Overview",
      routes: ["/admin/overview"]
    },
    {
      id: "catalog",
      label: "Catalog",
      routes: ["/admin/skills", "/admin/jobs", "/admin/sync-jobs", "/admin/sync-policy/repository"]
    },
    {
      id: "operations",
      label: "Operations",
      routes: [
        "/admin/integrations",
        "/admin/ops/metrics",
        "/admin/ops/alerts",
        "/admin/ops/audit-export",
        "/admin/ops/release-gates",
        "/admin/ops/recovery-drills",
        "/admin/ops/releases",
        "/admin/ops/change-approvals",
        "/admin/ops/backup/plans",
        "/admin/ops/backup/runs",
        "/admin/organizations"
      ]
    },
    {
      id: "security",
      label: "Security",
      routes: ["/admin/apikeys", "/admin/access", "/admin/moderation"]
    },
    {
      id: "account",
      label: "Account",
      routes: ["/account/profile", "/account/security", "/account/sessions"]
    }
  ];
}

function resolveActivePrimarySection(route: ProtectedRoute, sections: BackendWorkbenchPrimarySection[]): BackendWorkbenchPrimarySection {
  const matched = sections.find((section) => section.routes.includes(route));
  return matched || sections[0];
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
  const primarySections = useMemo(() => buildPrimarySections(), []);
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
  const activeSection = useMemo(() => resolveActivePrimarySection(route, primarySections), [route, primarySections]);
  const secondaryItems = useMemo(
    () => navItems.filter((item) => activeSection.routes.includes(item.path)),
    [activeSection.routes, navItems]
  );
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

  return (
    <div className="backend-shell">
      <header className="backend-topbar">
        <div className="backend-topbar-brand">
          <span className="brand-kicker">{text.brandName}</span>
          <h1>{text.brandTitle}</h1>
          <p>{text.homeSubtitle}</p>
        </div>

        <nav className="backend-primary-nav" aria-label="Backend primary navigation">
          {primarySections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={section.id === activeSection.id ? "backend-primary-nav-item active" : "backend-primary-nav-item"}
              onClick={() => onNavigate(section.routes[0])}
              aria-current={section.id === activeSection.id ? "page" : undefined}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="backend-topbar-actions">
          <button type="button" className="backend-marketplace-link" onClick={() => onNavigate("/")}>
            {text.home}
          </button>
          {userCenterTrigger}
        </div>
      </header>

      <div className="backend-shell-body">
        <aside className="backend-secondary-nav" aria-label="Backend secondary navigation">
          <p className="backend-secondary-title">{activeSection.label}</p>
          <div className="backend-secondary-list">
            {secondaryItems.map((item) => (
              <button
                key={item.path}
                className={item.path === route ? "backend-secondary-item active" : "backend-secondary-item"}
                onClick={() => onNavigate(item.path)}
                type="button"
              >
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </button>
            ))}
          </div>
        </aside>

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
