import { describe, expect, it } from "vitest";

import AdminAccountRoleWorkbenchPage from "./AdminAccountRoleWorkbenchPage";
import AdminIncidentWorkbenchPage from "./AdminIncidentWorkbenchPage";
import AdminIntegrationWorkbenchPage from "./AdminIntegrationWorkbenchPage";
import AdminSecurityPage from "./AdminSecurityPage";
import LoginPage from "./LoginPage";
import MarketplaceHomePage from "./MarketplaceHomePage";
import PrototypeReplicaPage from "./PrototypeReplicaPage";
import PublicComparePage from "./PublicComparePage";
import PublicSkillDetailPage from "./PublicSkillDetailPage";
import RecordsSyncCenterPage from "./RecordsSyncCenterPage";
import RolloutWorkflowPage from "./RolloutWorkflowPage";
import SystemStatePage from "./SystemStatePage";
import { renderPrototypeRouteContent } from "./PrototypeRouteRenderer";

const baseProps = {
  locale: "en" as const,
  currentPath: "/rollout",
  onNavigate: () => undefined,
  sessionUser: null,
  entry: {
    key: "install_rollout",
    name: "Install and Rollout Workflow",
    path: "install_rollout",
    primaryRoute: "/rollout",
    previewURL: "/prototypes/previews/install_rollout.png"
  }
};

describe("renderPrototypeRouteContent", () => {
  it("renders mapped route page component", () => {
    const element = renderPrototypeRouteContent(baseProps);
    expect(element.type).toBe(RolloutWorkflowPage);
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

    expect(accountsElement.type).toBe(AdminAccountRoleWorkbenchPage);
    expect(accountsElement.props.mode).toBe("account_configuration_form");
    expect(rolesElement.type).toBe(AdminAccountRoleWorkbenchPage);
    expect(rolesElement.props.mode).toBe("role_configuration_form");
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

    expect(element.type).toBe(AdminSecurityPage);
    expect(element.props.route).toBe("/admin/access");
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
