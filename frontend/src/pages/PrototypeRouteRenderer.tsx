import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import { resolvePrototypeRoute } from "../lib/prototypeRouteResolver";
import type { PrototypeCatalogEntry } from "../lib/prototypeCatalog";
import { extractSkillID } from "../lib/appPathnameResolver";
import AdminAccountRoleWorkbenchPage, { AdminAccountRoleWorkbenchMode } from "./AdminAccountRoleWorkbenchPage";
import AdminIncidentWorkbenchPage, { AdminIncidentWorkbenchMode } from "./AdminIncidentWorkbenchPage";
import AdminIntegrationWorkbenchPage, { AdminIntegrationWorkbenchMode } from "./AdminIntegrationWorkbenchPage";
import AdminOpsMetricsPage from "./AdminOpsMetricsPage";
import AdminOverviewPage from "./AdminOverviewPage";
import AdminSecurityPage from "./AdminSecurityPage";
import AdminIntegrationsPage from "./AdminIntegrationsPage";
import GovernanceCenterPage from "./GovernanceCenterPage";
import LoginPage from "./LoginPage";
import MarketplaceHomePage from "./MarketplaceHomePage";
import OrganizationCenterPage from "./OrganizationCenterPage";
import OrganizationManagementSubpageShell from "./OrganizationManagementSubpageShell";
import PrototypeReplicaPage from "./PrototypeReplicaPage";
import PublicComparePage from "./PublicComparePage";
import PublicSkillDetailPage from "./PublicSkillDetailPage";
import RecordsSyncCenterPage from "./RecordsSyncCenterPage";
import RolloutWorkflowPage from "./RolloutWorkflowPage";
import SystemStatePage from "./SystemStatePage";
import WorkspaceCenterPage from "./WorkspaceCenterPage";
import { resolveOrganizationManagementMenuItemID } from "./WorkspaceCenterPage.navigation";

export interface PrototypeRouteRenderProps {
  locale: AppLocale;
  currentPath: string;
  entry: PrototypeCatalogEntry;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

export type PrototypeImplementationTarget =
  | "public-home"
  | "public-skill"
  | "public-compare"
  | "public-login"
  | "rollout"
  | "workspace"
  | "governance"
  | "state"
  | "records-sync"
  | "admin-integrations"
  | "admin-access"
  | "admin-incidents"
  | "organization"
  | "admin-overview"
  | "fallback";

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function stripPrototypePrefix(pathname: string): string {
  if (pathname === "/mobile/light" || pathname.startsWith("/mobile/light/")) {
    const stripped = pathname.slice("/mobile/light".length);
    return stripped || "/";
  }
  if (pathname === "/mobile" || pathname.startsWith("/mobile/")) {
    const stripped = pathname.slice("/mobile".length);
    return stripped || "/";
  }
  if (pathname === "/light" || pathname.startsWith("/light/")) {
    const stripped = pathname.slice("/light".length);
    return stripped || "/";
  }
  return pathname;
}

function toPrototypeCorePath(pathname: string): string {
  return normalizePath(stripPrototypePrefix(normalizePath(pathname)));
}

function resolveAdminIncidentMode(pathname: string): { mode: AdminIncidentWorkbenchMode; incidentID?: string } | null {
  const corePath = toPrototypeCorePath(pathname);
  if (corePath === "/admin/incidents") {
    return { mode: "incident_recovery" };
  }
  if (corePath === "/admin/incidents/list") {
    return { mode: "incident_management_list" };
  }
  const responseMatch = corePath.match(/^\/admin\/incidents\/([^/]+)\/response$/);
  if (responseMatch) {
    return { mode: "incident_response_console", incidentID: responseMatch[1] };
  }
  const postmortemMatch = corePath.match(/^\/admin\/incidents\/([^/]+)\/postmortem$/);
  if (postmortemMatch) {
    return { mode: "incident_postmortem_detail", incidentID: postmortemMatch[1] };
  }
  return null;
}

function resolveAdminAccountRoleMode(pathname: string): AdminAccountRoleWorkbenchMode | null {
  const corePath = toPrototypeCorePath(pathname);
  if (corePath === "/admin/accounts" || corePath === "/admin/permissions/accounts") {
    return "account_management_list";
  }
  if (corePath === "/admin/accounts/new" || corePath === "/admin/permissions/accounts/new") {
    return "account_configuration_form";
  }
  if (corePath === "/admin/roles") {
    return "role_management_list";
  }
  if (corePath === "/admin/roles/new") {
    return "role_configuration_form";
  }
  return null;
}

function resolveAdminIntegrationMode(pathname: string): AdminIntegrationWorkbenchMode | null {
  const corePath = toPrototypeCorePath(pathname);
  if (corePath === "/admin/integrations") {
    return "integration_settings";
  }
  if (corePath === "/admin/integrations/list") {
    return "integration_connector_list";
  }
  if (corePath === "/admin/integrations/new") {
    return "integration_configuration_form";
  }
  if (corePath === "/admin/integrations/webhooks/logs") {
    return "webhook_delivery_logs";
  }
  return null;
}

export function resolvePrototypeImplementationTarget(pathname: string): PrototypeImplementationTarget {
  const resolved = resolvePrototypeRoute(pathname);
  if (!resolved) {
    return "fallback";
  }
  return resolved.family;
}

export function renderPrototypeRouteContent(props: PrototypeRouteRenderProps) {
  const incidentMode = resolveAdminIncidentMode(props.currentPath);
  if (incidentMode) {
    return <AdminIncidentWorkbenchPage mode={incidentMode.mode} incidentID={incidentMode.incidentID} />;
  }

  const accountRoleMode = resolveAdminAccountRoleMode(props.currentPath);
  if (accountRoleMode) {
    const titleByMode: Record<AdminAccountRoleWorkbenchMode, string> = {
      account_management_list: "Account Management List",
      account_configuration_form: "Account Configuration Form",
      role_management_list: "Role Management List",
      role_configuration_form: "Role Configuration Form"
    };
    const subtitleByMode: Record<AdminAccountRoleWorkbenchMode, string> = {
      account_management_list: "Manage user records while keeping organization navigation anchored in the workspace shell.",
      account_configuration_form: "Configure account onboarding and provisioning rules with organization navigation visible.",
      role_management_list: "Review role assignments and usage with persistent organization side navigation.",
      role_configuration_form: "Edit role definitions while keeping workspace-level navigation and context."
    };

    return (
      <OrganizationManagementSubpageShell
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
        activeMenuID={resolveOrganizationManagementMenuItemID(props.currentPath)}
        eyebrow="Organization Management"
        title={titleByMode[accountRoleMode]}
        subtitle={subtitleByMode[accountRoleMode]}
      >
        <AdminAccountRoleWorkbenchPage mode={accountRoleMode} />
      </OrganizationManagementSubpageShell>
    );
  }

  const integrationMode = resolveAdminIntegrationMode(props.currentPath);
  if (integrationMode) {
    return <AdminIntegrationWorkbenchPage mode={integrationMode} />;
  }

  const resolved = resolvePrototypeRoute(props.currentPath);
  const target = resolvePrototypeImplementationTarget(props.currentPath);
  const skillID = extractSkillID(props.currentPath) || 0;

  if (target === "fallback" || !resolved) {
    return <PrototypeReplicaPage {...props} />;
  }

  if (target === "public-home") {
    return (
      <MarketplaceHomePage
        locale={props.locale}
        sessionUser={props.sessionUser}
        onNavigate={props.onNavigate}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        locationKey={props.currentPath}
      />
    );
  }

  if (target === "public-compare") {
    return (
      <PublicComparePage
        locale={props.locale}
        locationKey={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
      />
    );
  }

  if (target === "public-skill") {
    return <PublicSkillDetailPage locale={props.locale} skillID={skillID} onNavigate={props.onNavigate} sessionUser={props.sessionUser} />;
  }

  if (target === "public-login") {
    return <LoginPage loading={false} locale={props.locale} onLocaleChange={() => undefined} onSubmit={async () => undefined} />;
  }

  if (target === "rollout") {
    return (
      <RolloutWorkflowPage
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
      />
    );
  }

  if (target === "workspace") {
    return (
      <WorkspaceCenterPage
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
      />
    );
  }

  if (target === "governance") {
    return (
      <GovernanceCenterPage
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
      />
    );
  }

  if (target === "state") {
    return <SystemStatePage locale={props.locale} currentPath={props.currentPath} stateKind={resolved.stateKind || "loading"} onNavigate={props.onNavigate} />;
  }

  if (target === "records-sync") {
    return (
      <RecordsSyncCenterPage
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
      />
    );
  }

  if (target === "admin-integrations") {
    return <AdminIntegrationsPage />;
  }

  if (target === "admin-access") {
    return (
      <OrganizationManagementSubpageShell
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
        activeMenuID={resolveOrganizationManagementMenuItemID(props.currentPath)}
        eyebrow="Organization Management"
        title="Access Management"
        subtitle="Control access policies with organization-level secondary navigation kept in the workspace shell."
      >
        <AdminSecurityPage route="/admin/access" />
      </OrganizationManagementSubpageShell>
    );
  }

  if (target === "admin-incidents") {
    return <AdminOpsMetricsPage />;
  }

  if (target === "organization") {
    return (
      <OrganizationCenterPage
        locale={props.locale}
        currentPath={props.currentPath}
        onNavigate={props.onNavigate}
        sessionUser={props.sessionUser}
        onThemeModeChange={props.onThemeModeChange}
        onLocaleChange={props.onLocaleChange}
        onLogout={props.onLogout}
      />
    );
  }

  if (target === "admin-overview") {
    return <AdminOverviewPage currentPath={props.currentPath} onNavigate={props.onNavigate} />;
  }

  return <PrototypeReplicaPage {...props} />;
}

export default function PrototypeRouteRenderer(props: PrototypeRouteRenderProps) {
  return renderPrototypeRouteContent(props);
}
