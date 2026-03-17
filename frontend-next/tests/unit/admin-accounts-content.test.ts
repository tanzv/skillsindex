import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminAccountsContent } from "@/src/features/adminAccounts/AdminAccountsContent";
import type { AdminAccountsRoute } from "@/src/features/adminAccounts/model";

function renderAdminAccountsRoute(route: AdminAccountsRoute) {
  return renderToStaticMarkup(
    createElement(AdminAccountsContent, {
      route,
      loading: false,
      busyAction: "",
      error: "",
      message: "",
      searchQuery: "",
      statusFilter: "all",
      metrics: [
        { label: "Total Accounts", value: "4" },
        { label: "Active Accounts", value: "3" }
      ],
      accounts: [
        {
          id: 2,
          username: "operator",
          role: "admin",
          status: "active",
          createdAt: "2026-03-12T10:00:00Z",
          updatedAt: "2026-03-16T10:00:00Z",
          forceLogoutAt: ""
        }
      ],
      selectedAccount: {
        id: 2,
        username: "operator",
        role: "admin",
        status: "active",
        createdAt: "2026-03-12T10:00:00Z",
        updatedAt: "2026-03-16T10:00:00Z",
        forceLogoutAt: ""
      },
      registration: {
        allowRegistration: true,
        marketplacePublicAccess: true
      },
      authProviders: {
        authProviders: ["password", "github"],
        availableAuthProviders: ["password", "github", "oidc"]
      },
      roleSummary: [
        { role: "admin", count: 2 },
        { role: "member", count: 1 }
      ],
      accountEditor: {
        userId: "2",
        status: "active",
        newPassword: ""
      },
      roleEditor: {
        userId: "2",
        role: "admin"
      },
      settingsDraft: {
        allowRegistration: true,
        marketplacePublicAccess: true,
        enabledProviders: ["password", "github"]
      },
      onRefresh: () => undefined,
      onSelectAccount: () => undefined,
      onSearchQueryChange: () => undefined,
      onStatusFilterChange: () => undefined,
      onAccountEditorChange: () => undefined,
      onRoleEditorChange: () => undefined,
      onSettingsDraftChange: () => undefined,
      onToggleProvider: () => undefined,
      onApplyAccountStatus: () => undefined,
      onForceSignout: () => undefined,
      onResetPassword: () => undefined,
      onApplyRole: () => undefined,
      onSaveSettings: () => undefined
    })
  );
}

describe("admin accounts content", () => {
  it("renders accounts route as directory plus account actions", () => {
    const markup = renderAdminAccountsRoute("/admin/accounts");

    expect(markup).toContain("Account Directory");
    expect(markup).toContain("Selected Account");
    expect(markup).toContain("Account Actions");
    expect(markup).not.toContain("Provisioning Policy");
  });

  it("renders provisioning route as policy workspace", () => {
    const markup = renderAdminAccountsRoute("/admin/accounts/new");

    expect(markup).toContain("Provisioning Policy");
    expect(markup).toContain("Authentication Providers");
    expect(markup).toContain("Registration enabled · Marketplace public");
    expect(markup).not.toContain("Account Actions");
  });

  it("renders role configuration route with playbook and assignment flow", () => {
    const markup = renderAdminAccountsRoute("/admin/roles/new");

    expect(markup).toContain("Role Assignment");
    expect(markup).toContain("Role Playbook");
    expect(markup).toContain("Role Summary");
  });
});
