import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminAccountRoleWorkbenchPage from "./AdminAccountRoleWorkbenchPage";
import AdminIncidentWorkbenchPage from "./AdminIncidentWorkbenchPage";
import AdminIntegrationWorkbenchPage from "./AdminIntegrationWorkbenchPage";
import AdminSecurityPage from "./AdminSecurityPage";
import GovernanceCenterPage from "./GovernanceCenterPage";
import LoginPage from "./LoginPage";
import MarketplaceHomePage from "./MarketplaceHomePage";
import OrganizationCenterPage from "./OrganizationCenterPage";
import OrganizationManagementSubpageShell from "./OrganizationManagementSubpageShell";
import PrototypeReplicaPage from "./PrototypeReplicaPage";
import PublicComparePage from "./PublicComparePage";
import PublicSkillDetailPage from "./PublicSkillDetailPage";
import RecordsSyncCenterPage from "./RecordsSyncCenterPage";
import SystemStatePage from "./SystemStatePage";
import WorkspaceCenterPage from "./WorkspaceCenterPage";
import { renderPrototypeRouteContent } from "./PrototypeRouteRenderer";

const baseProps = {
  locale: "en" as const,
  currentPath: "/workspace",
  onNavigate: () => undefined,
  sessionUser: null,
  entry: {
    key: "team_workspace",
    name: "Team Workspace",
    path: "team_workspace",
    primaryRoute: "/workspace",
    previewURL: "/prototypes/previews/team_workspace.png"
  }
};

describe("renderPrototypeRouteContent", () => {
  it("renders mapped route page component", () => {
    const element = renderPrototypeRouteContent(baseProps);
    expect(element.type).toBe(WorkspaceCenterPage);
  });

  it("maps public routes to concrete pages", () => {
    const homeElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/",
      entry: { ...baseProps.entry, key: "marketplace_home", primaryRoute: "/" }
    });
    const compareElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/compare",
      entry: { ...baseProps.entry, key: "skill_compare", primaryRoute: "/compare" }
    });
    const skillElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/skills/8",
      entry: { ...baseProps.entry, key: "skill_detail", primaryRoute: "/skills/{skillID}" }
    });
    const loginElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/login",
      entry: { ...baseProps.entry, key: "login_page_prototype", primaryRoute: "/login" }
    });

    expect(homeElement.type).toBe(MarketplaceHomePage);
    expect(compareElement.type).toBe(PublicComparePage);
    expect(skillElement.type).toBe(PublicSkillDetailPage);
    expect(skillElement.props.skillID).toBe(8);
    expect(loginElement.type).toBe(LoginPage);
  });

  it("maps state route with the expected state kind", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/states/error",
      entry: {
        ...baseProps.entry,
        key: "state_error",
        primaryRoute: "/states/error"
      }
    });

    expect(element.type).toBe(SystemStatePage);
    expect(element.props.stateKind).toBe("error");
  });

  it("forwards global control handlers to workspace route", () => {
    const onThemeModeChange = () => undefined;
    const onLocaleChange = () => undefined;
    const onLogout = async () => undefined;
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/workspace",
      onThemeModeChange,
      onLocaleChange,
      onLogout,
      entry: {
        ...baseProps.entry,
        key: "team_workspace_light",
        primaryRoute: "/light/workspace"
      }
    });

    expect(element.type).toBe(WorkspaceCenterPage);
    expect(element.props.onThemeModeChange).toBe(onThemeModeChange);
    expect(element.props.onLocaleChange).toBe(onLocaleChange);
    expect(element.props.onLogout).toBe(onLogout);
  });

  it("forwards global control handlers to workspace subpages", () => {
    const onThemeModeChange = () => undefined;
    const onLocaleChange = () => undefined;
    const onLogout = async () => undefined;
    const workspaceAliasElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/rollout",
      onThemeModeChange,
      onLocaleChange,
      onLogout,
      entry: {
        ...baseProps.entry,
        key: "team_workspace_light",
        primaryRoute: "/light/workspace"
      }
    });
    const governanceElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/governance",
      onThemeModeChange,
      onLocaleChange,
      onLogout,
      entry: {
        ...baseProps.entry,
        key: "governance_center_light",
        primaryRoute: "/light/governance"
      }
    });
    const recordsElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/admin/records/sync-jobs",
      onThemeModeChange,
      onLocaleChange,
      onLogout,
      entry: {
        ...baseProps.entry,
        key: "records_sync_center_light",
        primaryRoute: "/light/admin/records/sync-jobs"
      }
    });
    const organizationElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/admin/accounts/overview",
      onThemeModeChange,
      onLocaleChange,
      onLogout,
      entry: {
        ...baseProps.entry,
        key: "organization_management_light",
        primaryRoute: "/light/admin/accounts/overview"
      }
    });

    expect(workspaceAliasElement.type).toBe(WorkspaceCenterPage);
    expect(workspaceAliasElement.props.onThemeModeChange).toBe(onThemeModeChange);
    expect(workspaceAliasElement.props.onLocaleChange).toBe(onLocaleChange);
    expect(workspaceAliasElement.props.onLogout).toBe(onLogout);

    expect(governanceElement.type).toBe(GovernanceCenterPage);
    expect(governanceElement.props.onThemeModeChange).toBe(onThemeModeChange);
    expect(governanceElement.props.onLocaleChange).toBe(onLocaleChange);
    expect(governanceElement.props.onLogout).toBe(onLogout);

    expect(recordsElement.type).toBe(RecordsSyncCenterPage);
    expect(recordsElement.props.onThemeModeChange).toBe(onThemeModeChange);
    expect(recordsElement.props.onLocaleChange).toBe(onLocaleChange);
    expect(recordsElement.props.onLogout).toBe(onLogout);

    expect(organizationElement.type).toBe(OrganizationCenterPage);
    expect(organizationElement.props.onThemeModeChange).toBe(onThemeModeChange);
    expect(organizationElement.props.onLocaleChange).toBe(onLocaleChange);
    expect(organizationElement.props.onLogout).toBe(onLogout);
  });

  it("maps records export alias to records sync center page", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/records/exports",
      entry: {
        ...baseProps.entry,
        key: "sync_export_center",
        primaryRoute: "/admin/records/exports"
      }
    });

    expect(element.type).toBe(RecordsSyncCenterPage);
  });

  it("maps integration list alias to integration workbench list mode", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/integrations/list",
      entry: {
        ...baseProps.entry,
        key: "integration_connector_list",
        primaryRoute: "/admin/integrations/list"
      }
    });

    expect(element.type).toBe(AdminIntegrationWorkbenchPage);
    expect(element.props.mode).toBe("integration_connector_list");
  });

  it("maps incident response alias to incident workbench response mode", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/incidents/42/response",
      entry: {
        ...baseProps.entry,
        key: "incident_response_console",
        primaryRoute: "/admin/incidents/{incidentID}/response"
      }
    });

    expect(element.type).toBe(AdminIncidentWorkbenchPage);
    expect(element.props.mode).toBe("incident_response_console");
    expect(element.props.incidentID).toBe("42");
  });

  it("maps account and role admin routes to account-role workbench modes", () => {
    const accountsElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/accounts/new",
      entry: {
        ...baseProps.entry,
        key: "account_configuration_form",
        primaryRoute: "/admin/accounts/new"
      }
    });
    const rolesElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/roles/new",
      entry: {
        ...baseProps.entry,
        key: "role_configuration_form",
        primaryRoute: "/admin/roles/new"
      }
    });

    expect(accountsElement.type).toBe(OrganizationManagementSubpageShell);
    expect(accountsElement.props.activeMenuID).toBe("org-personnel");
    expect(accountsElement.props.children.type).toBe(AdminAccountRoleWorkbenchPage);
    expect(accountsElement.props.children.props.mode).toBe("account_configuration_form");
    expect(rolesElement.type).toBe(OrganizationManagementSubpageShell);
    expect(rolesElement.props.activeMenuID).toBe("org-role");
    expect(rolesElement.props.children.type).toBe(AdminAccountRoleWorkbenchPage);
    expect(rolesElement.props.children.props.mode).toBe("role_configuration_form");
  });

  it("maps permissions account alias route to account management list mode", () => {
    const accountsElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/permissions/accounts",
      entry: {
        ...baseProps.entry,
        key: "account_management_list",
        primaryRoute: "/admin/accounts"
      }
    });

    expect(accountsElement.type).toBe(OrganizationManagementSubpageShell);
    expect(accountsElement.props.activeMenuID).toBe("org-personnel");
    expect(accountsElement.props.children.type).toBe(AdminAccountRoleWorkbenchPage);
    expect(accountsElement.props.children.props.mode).toBe("account_management_list");
  });

  it("hides organization shell summary subtitle for role management routes", () => {
    const rolesElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/roles",
      entry: {
        ...baseProps.entry,
        key: "role_management_list",
        primaryRoute: "/admin/roles"
      }
    });

    const html = renderToStaticMarkup(React.createElement(React.Fragment, null, rolesElement));
    expect(html).not.toContain("Review role assignments and usage with persistent organization side navigation.");
  });

  it("maps light incident list route to incident workbench list mode", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/admin/incidents/list",
      entry: {
        ...baseProps.entry,
        key: "incident_management_list_light",
        primaryRoute: "/light/admin/incidents/list"
      }
    });

    expect(element.type).toBe(AdminIncidentWorkbenchPage);
    expect(element.props.mode).toBe("incident_management_list");
  });

  it("maps access route to admin access page", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/light/admin/access",
      entry: {
        ...baseProps.entry,
        key: "access_management_light",
        primaryRoute: "/light/admin/access"
      }
    });

    expect(element.type).toBe(OrganizationManagementSubpageShell);
    expect(element.props.activeMenuID).toBe("org-permission");
    expect(element.props.children.type).toBe(AdminSecurityPage);
    expect(element.props.children.props.route).toBe("/admin/access");
  });

  it("falls back to prototype replica when mapping is missing", () => {
    const element = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/unknown-prototype",
      entry: {
        ...baseProps.entry,
        key: "unknown_prototype",
        primaryRoute: "/unknown-prototype"
      }
    });

    expect(element.type).toBe(PrototypeReplicaPage);
  });
});
