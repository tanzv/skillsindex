import { Button } from "antd";
import { GlobalOutlined, TranslationOutlined } from "@ant-design/icons";
import { ReactNode, useMemo } from "react";

import { LocaleSwitchButton, QuickJumpActions, QuickJumpLabel, QuickJumpSection, SideLocaleSwitch } from "../App.shared";
import type { NavigationItem, ProtectedRoute } from "../appNavigationConfig";
import type { AppLocale } from "../lib/i18n";

interface BackendWorkbenchText {
  brandName: string;
  brandTitle: string;
  home: string;
  homeSubtitle: string;
  signOut: string;
  quickJump: string;
  controlCenter: string;
  architecture: string;
}

interface BackendWorkbenchPrimarySection {
  id: "overview" | "catalog" | "operations" | "security" | "account";
  label: string;
  routes: ProtectedRoute[];
}

interface BackendWorkbenchShellProps {
  route: ProtectedRoute;
  locale: AppLocale;
  submitLoading: boolean;
  sessionUser: {
    username: string;
    role: string;
  };
  currentNavItem?: NavigationItem;
  navItems: NavigationItem[];
  navByPath: Map<ProtectedRoute, NavigationItem>;
  quickRoutes: ProtectedRoute[];
  text: BackendWorkbenchText;
  onNavigate: (path: string) => void;
  onLocaleChange: (locale: AppLocale) => void;
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
  submitLoading,
  sessionUser,
  currentNavItem,
  navItems,
  navByPath,
  quickRoutes,
  text,
  onNavigate,
  onLocaleChange,
  onLogout,
  children
}: BackendWorkbenchShellProps) {
  const primarySections = useMemo(() => buildPrimarySections(), []);
  const activeSection = useMemo(() => resolveActivePrimarySection(route, primarySections), [route, primarySections]);
  const secondaryItems = useMemo(
    () => navItems.filter((item) => activeSection.routes.includes(item.path)),
    [activeSection.routes, navItems]
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

          <SideLocaleSwitch role="group" aria-label="Backend locale switch">
            <LocaleSwitchButton
              type="button"
              data-testid="backend-locale-switch-en"
              onClick={() => {
                onLocaleChange("en");
              }}
              $active={locale === "en"}
              disabled={locale === "en"}
              aria-label="Switch to English locale"
              title="English locale"
            >
              <GlobalOutlined />
            </LocaleSwitchButton>
            <LocaleSwitchButton
              type="button"
              data-testid="backend-locale-switch-zh"
              onClick={() => {
                onLocaleChange("zh");
              }}
              $active={locale === "zh"}
              disabled={locale === "zh"}
              aria-label="Switch to Chinese locale"
              title="Chinese locale"
            >
              <TranslationOutlined />
            </LocaleSwitchButton>
          </SideLocaleSwitch>

          <div className="backend-user-inline">
            <strong>{sessionUser.username}</strong>
            <span>{sessionUser.role}</span>
          </div>

          <button className="ghost" onClick={onLogout} disabled={submitLoading} type="button">
            {text.signOut}
          </button>
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
          <header className="main-header">
            <h2>{currentNavItem?.title || text.controlCenter}</h2>
            <p>{currentNavItem?.subtitle || text.architecture}</p>
          </header>

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
