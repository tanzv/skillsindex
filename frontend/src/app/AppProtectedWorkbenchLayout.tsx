import type { ReactNode } from "react";

import { isAdminRoute, isWorkspaceRoute } from "../App.shared";
import {
  accountQuickRoutes,
  adminQuickRoutes,
  navItems,
  type NavigationItem,
  type ProtectedRoute
} from "../appNavigationConfig";
import BackendWorkbenchShell from "../components/BackendWorkbenchShell";
import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";

import type { AppTextDictionary } from "./AppRoot.shared";

interface AppProtectedWorkbenchLayoutProps {
  route: ProtectedRoute;
  locale: AppLocale;
  themeMode: ThemeMode;
  submitLoading: boolean;
  sessionUser: SessionUser;
  text: AppTextDictionary;
  onNavigate: (path: string) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLogout: () => void;
  children: ReactNode;
}

const navByPath = new Map<ProtectedRoute, NavigationItem>(navItems.map((item) => [item.path, item]));

function resolveQuickRoutes(route: ProtectedRoute): ProtectedRoute[] {
  if (isWorkspaceRoute(route)) {
    return [];
  }
  return isAdminRoute(route) ? adminQuickRoutes : accountQuickRoutes;
}

export default function AppProtectedWorkbenchLayout({
  route,
  locale,
  themeMode,
  submitLoading,
  sessionUser,
  text,
  onNavigate,
  onLocaleChange,
  onThemeModeChange,
  onLogout,
  children
}: AppProtectedWorkbenchLayoutProps) {
  return (
    <BackendWorkbenchShell
      route={route}
      locale={locale}
      themeMode={themeMode}
      submitLoading={submitLoading}
      sessionUser={sessionUser}
      navItems={navItems}
      navByPath={navByPath}
      quickRoutes={resolveQuickRoutes(route)}
      text={text}
      onNavigate={onNavigate}
      onLocaleChange={onLocaleChange}
      onThemeModeChange={onThemeModeChange}
      onLogout={onLogout}
    >
      {children}
    </BackendWorkbenchShell>
  );
}
