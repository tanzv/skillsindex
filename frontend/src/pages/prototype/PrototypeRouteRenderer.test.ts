import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminIncidentWorkbenchPage from "../adminWorkbench/AdminIncidentWorkbenchPage";
import AdminIntegrationWorkbenchPage from "../adminWorkbench/AdminIntegrationWorkbenchPage";
import AdminSecurityPage from "../adminSecurity/AdminSecurityPage";
import GovernanceCenterPage from "../governanceCenter/GovernanceCenterPage";
import LoginPage from "../login/LoginPage";
import MarketplaceHomePage from "../marketplaceHome/MarketplaceHomePage";
import OrganizationManagementSubpageShell from "../organizationCenter/OrganizationManagementSubpageShell";
import PrototypeReplicaPage from "./PrototypeReplicaPage";
import PublicComparePage from "../publicCompare/PublicComparePage";
import PublicSkillDetailPage from "../publicSkillDetail/PublicSkillDetailPage";
import RecordsSyncCenterPage from "../recordsSyncCenter/RecordsSyncCenterPage";
import SystemStatePage from "../systemState/SystemStatePage";
import WorkspaceCenterPage from "../workspace/WorkspaceCenterPage";
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
      currentPath: "/light/admin/records/exports",
      onThemeModeChange,
      onLocaleChange,
      onLogout,
      entry: {
        ...baseProps.entry,
        key: "sync_export_center_light",
        primaryRoute: "/light/admin/records/exports"
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

  it("falls back for organization management routes it no longer owns", () => {
    const accountsElement = renderPrototypeRouteContent({
      ...baseProps,
      currentPath: "/admin/accounts/new",
      entry: {
        ...baseProps.entry,
        key: "account_configuration_form",
        primaryRoute: "/admin/accounts/new"
      }
    });
    const html = renderToStaticMarkup(React.createElement(React.Fragment, null, accountsElement));
    expect(accountsElement.type).toBe(PrototypeReplicaPage);
    expect(html).toContain("Prototype Replica");
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
