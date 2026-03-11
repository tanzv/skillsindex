import type {
  OrganizationManagementRoute,
  OrganizationManagementRouteMeta
} from "./OrganizationManagementRoutePage.types";

export const organizationManagementRoutes: OrganizationManagementRoute[] = [
  "/admin/accounts",
  "/admin/accounts/new",
  "/admin/roles",
  "/admin/roles/new"
];

export function isOrganizationManagementRoute(route: string): route is OrganizationManagementRoute {
  return organizationManagementRoutes.includes(route as OrganizationManagementRoute);
}

export function getOrganizationManagementRouteMeta(route: OrganizationManagementRoute): OrganizationManagementRouteMeta {
  switch (route) {
    case "/admin/accounts":
      return {
        mode: "account_management_list",
        title: "Account Management List",
        subtitle: "Manage user records while keeping organization navigation anchored in the workspace shell."
      };
    case "/admin/accounts/new":
      return {
        mode: "account_configuration_form",
        title: "Account Configuration Form",
        subtitle: "Configure account onboarding and provisioning rules with organization navigation visible."
      };
    case "/admin/roles":
      return {
        mode: "role_management_list",
        title: "Role Management List",
        subtitle: "Review role assignments and usage with persistent organization side navigation."
      };
    case "/admin/roles/new":
      return {
        mode: "role_configuration_form",
        title: "Role Configuration Form",
        subtitle: "Edit role definitions while keeping workspace-level navigation and context."
      };
  }
}
