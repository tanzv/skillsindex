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
  route: OrganizationManagementRoute;
}
