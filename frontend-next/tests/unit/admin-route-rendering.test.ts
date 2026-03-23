import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { renderAdminRoute } from "@/src/features/admin/renderAdminRoute";
import { AdminAccountsPage } from "@/src/features/adminAccounts/AdminAccountsPage";
import { AdminIngestionPage } from "@/src/features/adminIngestion/AdminIngestionPage";
import { AdminOverviewPage } from "@/src/features/adminOverview/AdminOverviewPage";

describe("admin route rendering", () => {
  it("routes dedicated overview page without falling back to workbench metadata", async () => {
    const element = await renderAdminRoute("/admin/overview");

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe(AdminOverviewPage);
  });

  it("routes dedicated ingestion pages through the ingestion feature", async () => {
    const manualPage = await renderAdminRoute("/admin/ingestion/manual");
    const repositoryPage = await renderAdminRoute("/admin/ingestion/repository");
    const importsPage = await renderAdminRoute("/admin/records/imports");

    expect(isValidElement(manualPage)).toBe(true);
    expect(manualPage.type).toBe(AdminIngestionPage);
    expect(manualPage.props.route).toBe("/admin/ingestion/manual");

    expect(isValidElement(repositoryPage)).toBe(true);
    expect(repositoryPage.type).toBe(AdminIngestionPage);
    expect(repositoryPage.props.route).toBe("/admin/ingestion/repository");

    expect(isValidElement(importsPage)).toBe(true);
    expect(importsPage.type).toBe(AdminIngestionPage);
    expect(importsPage.props.route).toBe("/admin/records/imports");
  });

  it("routes account management paths through the dedicated accounts feature", async () => {
    const accountsPage = await renderAdminRoute("/admin/accounts");
    const provisioningPage = await renderAdminRoute("/admin/accounts/new");
    const rolesPage = await renderAdminRoute("/admin/roles");
    const roleConfigurationPage = await renderAdminRoute("/admin/roles/new");

    expect(isValidElement(accountsPage)).toBe(true);
    expect(accountsPage.type).toBe(AdminAccountsPage);
    expect(accountsPage.props.route).toBe("/admin/accounts");

    expect(isValidElement(provisioningPage)).toBe(true);
    expect(provisioningPage.type).toBe(AdminAccountsPage);
    expect(provisioningPage.props.route).toBe("/admin/accounts/new");

    expect(isValidElement(rolesPage)).toBe(true);
    expect(rolesPage.type).toBe(AdminAccountsPage);
    expect(rolesPage.props.route).toBe("/admin/roles");

    expect(isValidElement(roleConfigurationPage)).toBe(true);
    expect(roleConfigurationPage.type).toBe(AdminAccountsPage);
    expect(roleConfigurationPage.props.route).toBe("/admin/roles/new");
  });
});
