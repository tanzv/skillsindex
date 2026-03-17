import { isAccountRoute, isAdminRoute, isWorkspaceRoute } from "../App.shared";
import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import AccountCenterPage from "../pages/accountCenter/AccountCenterPage";
import AdminAccessGovernancePage from "../pages/adminAccess/AdminAccessGovernancePage";
import AdminCatalogPage from "../pages/adminCatalog/AdminCatalogPage";
import AdminRepositoryCatalogPage, { isAdminRepositoryCatalogRoute } from "../pages/adminCatalog/AdminRepositoryCatalogPage";
import AdminOpsControlPage from "../pages/adminOps/AdminOpsControlPage";
import AdminOpsMetricsPage from "../pages/adminOps/AdminOpsMetricsPage";
import AdminOverviewPage from "../pages/adminOverview/AdminOverviewPage";
import AdminSecurityPage from "../pages/adminSecurity/AdminSecurityPage";
import AdminIntegrationsPage from "../pages/adminWorkbench/AdminIntegrationsPage";
import AdminWorkbenchPage from "../pages/adminWorkbench/AdminWorkbenchPage";
import OrganizationCenterPage from "../pages/organizationCenter/OrganizationCenterPage";
import OrganizationManagementRoutePage from "../pages/organizationCenter/OrganizationManagementRoutePage";
import { isOrganizationManagementRoute } from "../pages/organizationCenter/OrganizationManagementRoutePage.helpers";
import SkillOperationsPage from "../pages/skillOperations/SkillOperationsPage";
import { isSkillOperationsRoute } from "../pages/skillOperations/SkillOperationsPage.helpers";
import WorkspaceCenterRoutePage from "../pages/workspace/WorkspaceCenterRoutePage";
import {
  isAdminCatalogRoute,
  isAdminOpsControlRoute,
  isAdminSecurityRoute,
  type ProtectedRoute
} from "../appNavigationConfig";

interface AppProtectedRouteViewProps {
  route: ProtectedRoute;
  locale: AppLocale;
  sessionUser: SessionUser;
  onNavigate: (path: string) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLogout: () => void;
}

export default function AppProtectedRouteView({
  route,
  locale,
  sessionUser,
  onNavigate
}: AppProtectedRouteViewProps) {
  const pathname = window.location.pathname;

  if (isAdminRoute(route)) {
    if (route === "/admin/overview") {
      return <AdminOverviewPage currentPath={pathname} onNavigate={onNavigate} />;
    }
    if (route === "/admin/integrations") {
      return <AdminIntegrationsPage />;
    }
    if (route === "/admin/ops/metrics") {
      return <AdminOpsMetricsPage />;
    }
    if (route === "/admin/access") {
      return <AdminAccessGovernancePage />;
    }
    if (isOrganizationManagementRoute(route)) {
      return <OrganizationManagementRoutePage route={route} />;
    }
    if (route === "/admin/organizations") {
      return <OrganizationCenterPage locale={locale} currentPath={pathname} onNavigate={onNavigate} />;
    }
    if (isSkillOperationsRoute(route)) {
      return <SkillOperationsPage locale={locale} route={route} onNavigate={onNavigate} />;
    }
    if (isAdminCatalogRoute(route)) {
      return isAdminRepositoryCatalogRoute(route) ? (
        <AdminRepositoryCatalogPage locale={locale} route={route} onNavigate={onNavigate} />
      ) : (
        <AdminCatalogPage route={route} />
      );
    }
    if (isAdminSecurityRoute(route)) {
      return <AdminSecurityPage route={route} />;
    }
    if (isAdminOpsControlRoute(route)) {
      return <AdminOpsControlPage route={route} />;
    }
    return <AdminWorkbenchPage route={route} />;
  }

  if (isAccountRoute(route)) {
    return <AccountCenterPage locale={locale} route={route} onNavigate={onNavigate} />;
  }

  if (isWorkspaceRoute(route)) {
    return (
      <WorkspaceCenterRoutePage
        locale={locale}
        currentPath={pathname}
        onNavigate={onNavigate}
        sessionUser={sessionUser}
      />
    );
  }

  return null;
}
