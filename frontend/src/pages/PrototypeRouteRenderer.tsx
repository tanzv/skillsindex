import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
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
import PrototypeReplicaPage from "./PrototypeReplicaPage";
import PublicComparePage from "./PublicComparePage";
import PublicSkillDetailPage from "./PublicSkillDetailPage";
import RecordsSyncCenterPage from "./RecordsSyncCenterPage";
import RolloutWorkflowPage from "./RolloutWorkflowPage";
import SystemStatePage from "./SystemStatePage";
import WorkspaceCenterPage from "./WorkspaceCenterPage";

export interface PrototypeRouteRenderProps {
  locale: AppLocale;
  currentPath: string;
  entry: PrototypeCatalogEntry;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
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
  if (corePath === "/admin/accounts") {
    return "account_management_list";
  }
  if (corePath === "/admin/accounts/new") {
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
    return <AdminAccountRoleWorkbenchPage mode={accountRoleMode} />;
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
    return <RolloutWorkflowPage locale={props.locale} currentPath={props.currentPath} onNavigate={props.onNavigate} sessionUser={props.sessionUser} />;
  }

  if (target === "workspace") {
    return <WorkspaceCenterPage locale={props.locale} currentPath={props.currentPath} onNavigate={props.onNavigate} sessionUser={props.sessionUser} />;
  }

  if (target === "governance") {
    return <GovernanceCenterPage locale={props.locale} currentPath={props.currentPath} onNavigate={props.onNavigate} sessionUser={props.sessionUser} />;
  }

  if (target === "state") {
    return <SystemStatePage locale={props.locale} currentPath={props.currentPath} stateKind={resolved.stateKind || "loading"} onNavigate={props.onNavigate} />;
  }

  if (target === "records-sync") {
    return <RecordsSyncCenterPage locale={props.locale} currentPath={props.currentPath} onNavigate={props.onNavigate} />;
  }

  if (target === "admin-integrations") {
    return <AdminIntegrationsPage />;
  }

  if (target === "admin-access") {
    return <AdminSecurityPage route="/admin/access" />;
  }

  if (target === "admin-incidents") {
    return <AdminOpsMetricsPage />;
  }

  if (target === "organization") {
    return <OrganizationCenterPage locale={props.locale} onNavigate={props.onNavigate} />;
  }

  if (target === "admin-overview") {
    return <AdminOverviewPage currentPath={props.currentPath} onNavigate={props.onNavigate} />;
  }

  return <PrototypeReplicaPage {...props} />;
}

export default function PrototypeRouteRenderer(props: PrototypeRouteRenderProps) {
  return renderPrototypeRouteContent(props);
}
