import { resolvePrototypeCatalogFallbackRoute } from "./prototypeCatalogRouteFallback";

export interface PrototypeCatalogEntry {
  key: string;
  name: string;
  path: string;
  primaryRoute: string;
  previewURL: string | null;
}

export const prototypeCatalog: PrototypeCatalogEntry[] = [
  {
    "key": "marketplace_home",
    "name": "Marketplace Command Deck",
    "path": "marketplace_home",
    "primaryRoute": "/",
    "previewURL": "/prototypes/previews/marketplace_home.png"
  },
  {
    "key": "skill_detail",
    "name": "Skill Detail Intelligence View",
    "path": "skill_detail",
    "primaryRoute": "/skills/{skillID}",
    "previewURL": "/prototypes/previews/skill_detail.png"
  },
  {
    "key": "admin_dashboard",
    "name": "Admin Navigation Dashboard",
    "path": "admin_dashboard",
    "primaryRoute": "/admin",
    "previewURL": "/prototypes/previews/admin_dashboard.png"
  },
  {
    "key": "skill_compare",
    "name": "Skill Comparison Center",
    "path": "skill_compare",
    "primaryRoute": "/compare",
    "previewURL": "/prototypes/previews/skill_compare.png"
  },
  {
    "key": "install_rollout",
    "name": "Install and Rollout Workflow",
    "path": "install_rollout",
    "primaryRoute": "/rollout",
    "previewURL": "/prototypes/previews/install_rollout.png"
  },
  {
    "key": "team_workspace",
    "name": "Team Workspace",
    "path": "team_workspace",
    "primaryRoute": "/workspace",
    "previewURL": "/prototypes/previews/team_workspace.png"
  },
  {
    "key": "governance_center",
    "name": "Governance Center",
    "path": "governance_center",
    "primaryRoute": "/governance",
    "previewURL": "/prototypes/previews/governance_center.png"
  },
  {
    "key": "login_page_prototype",
    "name": "Login Page Prototype",
    "path": "login_page_prototype",
    "primaryRoute": "/login",
    "previewURL": "/prototypes/previews/login_page_prototype.png"
  },
  {
    "key": "marketplace_home_light",
    "name": "Marketplace Command Deck Light",
    "path": "marketplace_home_light",
    "primaryRoute": "/light",
    "previewURL": "/prototypes/previews/marketplace_home_light.png"
  },
  {
    "key": "skill_detail_light",
    "name": "Skill Detail Intelligence View Light",
    "path": "skill_detail_light",
    "primaryRoute": "/light/skills/{skillID}",
    "previewURL": "/prototypes/previews/skill_detail_light.png"
  },
  {
    "key": "admin_dashboard_light",
    "name": "Admin Navigation Dashboard Light",
    "path": "admin_dashboard_light",
    "primaryRoute": "/light/admin",
    "previewURL": "/prototypes/previews/admin_dashboard_light.png"
  },
  {
    "key": "skill_compare_light",
    "name": "Skill Comparison Center Light",
    "path": "skill_compare_light",
    "primaryRoute": "/light/compare",
    "previewURL": "/prototypes/previews/skill_compare_light.png"
  },
  {
    "key": "install_rollout_light",
    "name": "Install and Rollout Workflow Light",
    "path": "install_rollout_light",
    "primaryRoute": "/light/rollout",
    "previewURL": "/prototypes/previews/install_rollout_light.png"
  },
  {
    "key": "team_workspace_light",
    "name": "Team Workspace Light",
    "path": "team_workspace_light",
    "primaryRoute": "/light/workspace",
    "previewURL": "/prototypes/previews/team_workspace_light.png"
  },
  {
    "key": "governance_center_light",
    "name": "Governance Center Light",
    "path": "governance_center_light",
    "primaryRoute": "/light/governance",
    "previewURL": "/prototypes/previews/governance_center_light.png"
  },
  {
    "key": "login_page_prototype_light",
    "name": "Login Page Prototype Light",
    "path": "login_page_prototype_light",
    "primaryRoute": "/light/login",
    "previewURL": "/prototypes/previews/login_page_prototype_light.png"
  },
  {
    "key": "login_page_prototype_mobile",
    "name": "Login Page Prototype Mobile",
    "path": "login_page_prototype_mobile",
    "primaryRoute": "/mobile/login",
    "previewURL": "/prototypes/previews/login_page_prototype_mobile.png"
  },
  {
    "key": "login_page_prototype_mobile_light",
    "name": "Login Page Prototype Mobile Light",
    "path": "login_page_prototype_mobile_light",
    "primaryRoute": "/mobile/light/login",
    "previewURL": "/prototypes/previews/login_page_prototype_mobile_light.png"
  },
  {
    "key": "access_management",
    "name": "Access and Identity Gateway",
    "path": "access_management",
    "primaryRoute": "/admin/access",
    "previewURL": "/prototypes/previews/access_management.png"
  },
  {
    "key": "integration_settings",
    "name": "Integration Gateway",
    "path": "integration_settings",
    "primaryRoute": "/admin/integrations",
    "previewURL": "/prototypes/previews/integration_settings.png"
  },
  {
    "key": "incident_recovery",
    "name": "Incident Gateway",
    "path": "incident_recovery",
    "primaryRoute": "/admin/incidents",
    "previewURL": "/prototypes/previews/incident_recovery.png"
  },
  {
    "key": "access_management_light",
    "name": "Access and Identity Gateway Light",
    "path": "access_management_light",
    "primaryRoute": "/light/admin/access",
    "previewURL": "/prototypes/previews/access_management_light.png"
  },
  {
    "key": "account_management_list",
    "name": "Account Management List",
    "path": "account_management_list",
    "primaryRoute": "/admin/accounts",
    "previewURL": "/prototypes/previews/account_management_list.png"
  },
  {
    "key": "account_configuration_form",
    "name": "Account Configuration Form",
    "path": "account_configuration_form",
    "primaryRoute": "/admin/accounts/new",
    "previewURL": "/prototypes/previews/account_configuration_form.png"
  },
  {
    "key": "role_management_list",
    "name": "Role Management List",
    "path": "role_management_list",
    "primaryRoute": "/admin/roles",
    "previewURL": "/prototypes/previews/role_management_list.png"
  },
  {
    "key": "role_configuration_form",
    "name": "Role Configuration Form",
    "path": "role_configuration_form",
    "primaryRoute": "/admin/roles/new",
    "previewURL": "/prototypes/previews/role_configuration_form.png"
  },
  {
    "key": "account_management_list_light",
    "name": "Account Management List Light",
    "path": "account_management_list_light",
    "primaryRoute": "/light/admin/accounts",
    "previewURL": "/prototypes/previews/account_management_list_light.png"
  },
  {
    "key": "account_configuration_form_light",
    "name": "Account Configuration Form Light",
    "path": "account_configuration_form_light",
    "primaryRoute": "/light/admin/accounts/new",
    "previewURL": "/prototypes/previews/account_configuration_form_light.png"
  },
  {
    "key": "role_management_list_light",
    "name": "Role Management List Light",
    "path": "role_management_list_light",
    "primaryRoute": "/light/admin/roles",
    "previewURL": "/prototypes/previews/role_management_list_light.png"
  },
  {
    "key": "role_configuration_form_light",
    "name": "Role Configuration Form Light",
    "path": "role_configuration_form_light",
    "primaryRoute": "/light/admin/roles/new",
    "previewURL": "/prototypes/previews/role_configuration_form_light.png"
  },
  {
    "key": "integration_connector_list",
    "name": "Integration Connector List",
    "path": "integration_connector_list",
    "primaryRoute": "/admin/integrations/list",
    "previewURL": "/prototypes/previews/integration_connector_list.png"
  },
  {
    "key": "integration_configuration_form",
    "name": "Integration Configuration Form",
    "path": "integration_configuration_form",
    "primaryRoute": "/admin/integrations/new",
    "previewURL": "/prototypes/previews/integration_configuration_form.png"
  },
  {
    "key": "webhook_delivery_logs",
    "name": "Webhook Delivery Logs",
    "path": "webhook_delivery_logs",
    "primaryRoute": "/admin/integrations/webhooks/logs",
    "previewURL": "/prototypes/previews/webhook_delivery_logs.png"
  },
  {
    "key": "incident_management_list",
    "name": "Incident Management List",
    "path": "incident_management_list",
    "primaryRoute": "/admin/incidents/list",
    "previewURL": "/prototypes/previews/incident_management_list.png"
  },
  {
    "key": "incident_response_console",
    "name": "Incident Response Console",
    "path": "incident_response_console",
    "primaryRoute": "/admin/incidents/{incidentID}/response",
    "previewURL": "/prototypes/previews/incident_response_console.png"
  },
  {
    "key": "incident_postmortem_detail",
    "name": "Incident Postmortem Detail",
    "path": "incident_postmortem_detail",
    "primaryRoute": "/admin/incidents/{incidentID}/postmortem",
    "previewURL": "/prototypes/previews/incident_postmortem_detail.png"
  },
  {
    "key": "integration_settings_light",
    "name": "Integration Gateway Light",
    "path": "integration_settings_light",
    "primaryRoute": "/light/admin/integrations",
    "previewURL": "/prototypes/previews/integration_settings_light.png"
  },
  {
    "key": "incident_recovery_light",
    "name": "Incident Gateway Light",
    "path": "incident_recovery_light",
    "primaryRoute": "/light/admin/incidents",
    "previewURL": "/prototypes/previews/incident_recovery_light.png"
  },
  {
    "key": "integration_connector_list_light",
    "name": "Integration Connector List Light",
    "path": "integration_connector_list_light",
    "primaryRoute": "/light/admin/integrations/list",
    "previewURL": "/prototypes/previews/integration_connector_list_light.png"
  },
  {
    "key": "integration_configuration_form_light",
    "name": "Integration Configuration Form Light",
    "path": "integration_configuration_form_light",
    "primaryRoute": "/light/admin/integrations/new",
    "previewURL": "/prototypes/previews/integration_configuration_form_light.png"
  },
  {
    "key": "webhook_delivery_logs_light",
    "name": "Webhook Delivery Logs Light",
    "path": "webhook_delivery_logs_light",
    "primaryRoute": "/light/admin/integrations/webhooks/logs",
    "previewURL": "/prototypes/previews/webhook_delivery_logs_light.png"
  },
  {
    "key": "incident_management_list_light",
    "name": "Incident Management List Light",
    "path": "incident_management_list_light",
    "primaryRoute": "/light/admin/incidents/list",
    "previewURL": "/prototypes/previews/incident_management_list_light.png"
  },
  {
    "key": "incident_response_console_light",
    "name": "Incident Response Console Light",
    "path": "incident_response_console_light",
    "primaryRoute": "/light/admin/incidents/{incidentID}/response",
    "previewURL": "/prototypes/previews/incident_response_console_light.png"
  },
  {
    "key": "incident_postmortem_detail_light",
    "name": "Incident Postmortem Detail Light",
    "path": "incident_postmortem_detail_light",
    "primaryRoute": "/light/admin/incidents/{incidentID}/postmortem",
    "previewURL": "/prototypes/previews/incident_postmortem_detail_light.png"
  },
  {
    "key": "sync_export_center",
    "name": "Sync and Export Command Center",
    "path": "sync_export_center",
    "primaryRoute": "/admin/records/exports",
    "previewURL": "/prototypes/previews/sync_export_center.png"
  },
  {
    "key": "sync_export_center_light",
    "name": "Sync and Export Command Center Light",
    "path": "sync_export_center_light",
    "primaryRoute": "/light/admin/records/exports",
    "previewURL": "/prototypes/previews/sync_export_center_light.png"
  },
  {
    "key": "ingestion_manual",
    "name": "Ingestion Manual",
    "path": "ingestion_manual",
    "primaryRoute": "/admin/ingestion/manual",
    "previewURL": "/prototypes/previews/ingestion_manual.png"
  },
  {
    "key": "ingestion_zip",
    "name": "Ingestion Zip",
    "path": "ingestion_zip",
    "primaryRoute": "/admin/ingestion/upload",
    "previewURL": "/prototypes/previews/ingestion_zip.png"
  },
  {
    "key": "ingestion_repository",
    "name": "Ingestion Repository",
    "path": "ingestion_repository",
    "primaryRoute": "/admin/ingestion/repository",
    "previewURL": "/prototypes/previews/ingestion_repository.png"
  },
  {
    "key": "ingestion_skillmp",
    "name": "Ingestion SkillMP",
    "path": "ingestion_skillmp",
    "primaryRoute": "/admin/ingestion/skillmp",
    "previewURL": "/prototypes/previews/ingestion_skillmp.png"
  },
  {
    "key": "import_operation_records",
    "name": "Import Operation Records",
    "path": "import_operation_records",
    "primaryRoute": "/admin/records/imports",
    "previewURL": "/prototypes/previews/import_operation_records.png"
  },
  {
    "key": "sync_operation_records",
    "name": "Sync Operation Records",
    "path": "sync_operation_records",
    "primaryRoute": "/admin/records/sync-jobs",
    "previewURL": "/prototypes/previews/sync_operation_records.png"
  },
  {
    "key": "ingestion_manual_light",
    "name": "Ingestion Manual Light",
    "path": "ingestion_manual_light",
    "primaryRoute": "/light/admin/ingestion/manual",
    "previewURL": "/prototypes/previews/ingestion_manual_light.png"
  },
  {
    "key": "ingestion_zip_light",
    "name": "Ingestion Zip Light",
    "path": "ingestion_zip_light",
    "primaryRoute": "/light/admin/ingestion/upload",
    "previewURL": "/prototypes/previews/ingestion_zip_light.png"
  },
  {
    "key": "ingestion_repository_light",
    "name": "Ingestion Repository Light",
    "path": "ingestion_repository_light",
    "primaryRoute": "/light/admin/ingestion/repository",
    "previewURL": "/prototypes/previews/ingestion_repository_light.png"
  },
  {
    "key": "ingestion_skillmp_light",
    "name": "Ingestion SkillMP Light",
    "path": "ingestion_skillmp_light",
    "primaryRoute": "/light/admin/ingestion/skillmp",
    "previewURL": "/prototypes/previews/ingestion_skillmp_light.png"
  },
  {
    "key": "import_operation_records_light",
    "name": "Import Operation Records Light",
    "path": "import_operation_records_light",
    "primaryRoute": "/light/admin/records/imports",
    "previewURL": "/prototypes/previews/import_operation_records_light.png"
  },
  {
    "key": "sync_operation_records_light",
    "name": "Sync Operation Records Light",
    "path": "sync_operation_records_light",
    "primaryRoute": "/light/admin/records/sync-jobs",
    "previewURL": "/prototypes/previews/sync_operation_records_light.png"
  },
  {
    "key": "state_loading",
    "name": "State Loading",
    "path": "state_loading",
    "primaryRoute": "/states/loading",
    "previewURL": "/prototypes/previews/state_loading.png"
  },
  {
    "key": "state_empty",
    "name": "State Empty Result",
    "path": "state_empty",
    "primaryRoute": "/states/empty",
    "previewURL": "/prototypes/previews/state_empty.png"
  },
  {
    "key": "state_error",
    "name": "State Error and Retry",
    "path": "state_error",
    "primaryRoute": "/states/error",
    "previewURL": "/prototypes/previews/state_error.png"
  },
  {
    "key": "state_permission",
    "name": "State Permission Denied",
    "path": "state_permission",
    "primaryRoute": "/states/permission-denied",
    "previewURL": "/prototypes/previews/state_permission.png"
  },
  {
    "key": "state_loading_light",
    "name": "State Loading Light",
    "path": "state_loading_light",
    "primaryRoute": "/light/states/loading",
    "previewURL": "/prototypes/previews/state_loading_light.png"
  },
  {
    "key": "state_empty_light",
    "name": "State Empty Result Light",
    "path": "state_empty_light",
    "primaryRoute": "/light/states/empty",
    "previewURL": "/prototypes/previews/state_empty_light.png"
  },
  {
    "key": "state_error_light",
    "name": "State Error and Retry Light",
    "path": "state_error_light",
    "primaryRoute": "/light/states/error",
    "previewURL": "/prototypes/previews/state_error_light.png"
  },
  {
    "key": "state_permission_light",
    "name": "State Permission Denied Light",
    "path": "state_permission_light",
    "primaryRoute": "/light/states/permission-denied",
    "previewURL": "/prototypes/previews/state_permission_light.png"
  }
];

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function toPatternRegExp(routePattern: string): RegExp {
  const normalized = normalizePath(routePattern);
  const segments = normalized.split("/").filter((segment) => segment.length > 0);
  const encoded = segments.map((segment) => {
    const isParam = segment.startsWith("{") && segment.endsWith("}");
    if (isParam) {
      return "[^/]+";
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  const body = encoded.length > 0 ? "/" + encoded.join("/") : "/";
  return new RegExp("^" + body + "$");
}

export function instantiatePrototypeRoute(routePattern: string): string {
  return routePattern.replace(/\{[^}]+\}/g, "1");
}

export function matchPrototypeCatalog(pathname: string): PrototypeCatalogEntry | null {
  const normalized = normalizePath(pathname);
  const fallbackRoute = resolvePrototypeCatalogFallbackRoute(normalized);

  if (fallbackRoute) {
    return prototypeCatalog.find((entry) => entry.primaryRoute === fallbackRoute) || null;
  }

  for (const entry of prototypeCatalog) {
    if (toPatternRegExp(entry.primaryRoute).test(normalized)) {
      return entry;
    }
  }
  return null;
}

export function routeNeedsAuth(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (/^\/admin(\/|$)/.test(normalized) || /^\/account(\/|$)/.test(normalized) || /^\/light\/admin(\/|$)/.test(normalized) || /^\/mobile\/admin(\/|$)/.test(normalized) || /^\/mobile\/light\/admin(\/|$)/.test(normalized));
}

export function groupPrototypeEntriesByRoutePrefix(prefix: string): PrototypeCatalogEntry[] {
  const normalizedPrefix = prefix === "/" ? "/" : normalizePath(prefix);
  if (normalizedPrefix === "/") {
    return prototypeCatalog.filter((entry) => !entry.primaryRoute.startsWith("/admin") && !entry.primaryRoute.startsWith("/light/admin")).slice(0, 16);
  }
  return prototypeCatalog.filter((entry) => entry.primaryRoute.startsWith(normalizedPrefix)).slice(0, 24);
}
