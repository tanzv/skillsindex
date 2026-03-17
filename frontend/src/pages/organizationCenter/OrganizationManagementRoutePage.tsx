import AdminAccountRoleWorkbenchPage from "../adminAccountRoleWorkbench/AdminAccountRoleWorkbenchPage";
import { getOrganizationManagementRouteMeta } from "./OrganizationManagementRoutePage.helpers";
import type { OrganizationManagementRoutePageProps } from "./OrganizationManagementRoutePage.types";

export default function OrganizationManagementRoutePage({ route }: OrganizationManagementRoutePageProps) {
  const meta = getOrganizationManagementRouteMeta(route);

  return <AdminAccountRoleWorkbenchPage mode={meta.mode} />;
}
