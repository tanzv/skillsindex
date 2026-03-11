import type { SessionUser } from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import type { AdminAccountRoleWorkbenchMode } from "../adminAccountRoleWorkbench/AdminAccountRoleWorkbenchPage";

export type OrganizationManagementRoute =
  | "/admin/accounts"
  | "/admin/accounts/new"
  | "/admin/roles"
  | "/admin/roles/new";

export interface OrganizationManagementRouteMeta {
  mode: AdminAccountRoleWorkbenchMode;
  title: string;
  subtitle: string;
}

export interface OrganizationManagementRoutePageProps {
  locale: AppLocale;
  route: OrganizationManagementRoute;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser?: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}
