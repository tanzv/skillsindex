import AdminAccountRoleWorkbenchPage from "../adminAccountRoleWorkbench/AdminAccountRoleWorkbenchPage";
import { resolveOrganizationManagementMenuItemID } from "../workspace/WorkspaceCenterPage.navigation";
import OrganizationManagementSubpageShell from "./OrganizationManagementSubpageShell";
import { getOrganizationManagementRouteMeta } from "./OrganizationManagementRoutePage.helpers";
import type { OrganizationManagementRoutePageProps } from "./OrganizationManagementRoutePage.types";

export default function OrganizationManagementRoutePage({
  locale,
  route,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: OrganizationManagementRoutePageProps) {
  const meta = getOrganizationManagementRouteMeta(route);

  return (
    <OrganizationManagementSubpageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser || null}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      activeMenuID={resolveOrganizationManagementMenuItemID(currentPath)}
      eyebrow="Organization Management"
      title={meta.title}
      subtitle={meta.subtitle}
    >
      <AdminAccountRoleWorkbenchPage mode={meta.mode} />
    </OrganizationManagementSubpageShell>
  );
}
