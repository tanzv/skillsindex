import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { AdminAccessContent } from "@/src/features/adminAccess/AdminAccessContent";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createMessages() {
  return createProtectedPageTestMessages({
    adminCommon: {
      adminEyebrow: "Admin",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      clear: "Clear"
    },
    adminAccess: {
      pageTitle: "Access",
      pageDescription: "Access governance page",
      loadError: "Failed to load access governance.",
      saveSuccess: "Access policy updated.",
      saveError: "Failed to update access policy.",
      metricAccounts: "Accounts",
      metricDisabled: "Disabled",
      metricEnabledProviders: "Enabled Providers",
      metricPendingSignOut: "Pending Sign-out",
      directoryTitle: "Account Directory",
      directoryDescription: "Directory description",
      searchLabel: "Search accounts",
      searchPlaceholder: "Search accounts",
      directoryEmpty: "No accounts matched the current filter.",
      createdPrefix: "created",
      updatedPrefix: "updated",
      forceSignOutPrefix: "force sign-out",
      openAccountDetailAction: "Open Details",
      policyTitle: "Access Policy",
      policyDescription: "Policy description",
      allowRegistrationLabel: "Allow registration",
      marketplacePublicAccessLabel: "Marketplace public access",
      openPolicyPanelAction: "Open Policy Panel",
      saveAction: "Save Access Policy",
      savingAction: "Saving...",
      providersTitle: "Auth Providers",
      providersDescription: "Providers description",
      providerAriaLabel: "Provider {provider}",
      snapshotTitle: "Policy Snapshot",
      snapshotDescription: "Snapshot description",
      registrationEnabled: "Registration enabled",
      registrationDisabled: "Registration disabled",
      marketplacePublic: "Marketplace public",
      marketplacePrivate: "Marketplace private",
      availableProvidersLabel: "Available providers",
      notAvailable: "n/a",
      valueUnknownUser: "Unknown user",
      statusLabelActive: "Active",
      statusLabelDisabled: "Disabled",
      statusLabelUnknown: "Unknown",
      roleLabelSuperAdmin: "Super Admin",
      roleLabelAdmin: "Admin",
      roleLabelAuditor: "Auditor",
      roleLabelMember: "Member",
      roleLabelViewer: "Viewer",
      roleLabelUnknown: "Unknown",
      selectedAccountTitle: "Selected Account",
      selectedAccountDescription: "Selected account description",
      noSelection: "No selection",
      accountStatusLabel: "Status",
      accountRoleLabel: "Role",
      closePanelAction: "Close Panel",
      roleSummaryTitle: "Role Distribution",
      roleSummaryDescription: "Role summary description"
    }
  });
}

function renderAccessContent(options: { activePane?: "idle" | "policy" | "account" } = {}) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      { locale: "en", messages: createMessages() },
      createElement(AdminAccessContent, {
        loading: false,
        busyAction: "",
        error: "",
        message: "",
        keyword: "",
        data: {
          accounts: [
            {
              id: 3,
              username: "reviewer",
              role: "auditor",
              status: "active",
              createdAt: "2026-03-16T10:00:00Z",
              updatedAt: "2026-03-16T11:00:00Z",
              forceLogoutAt: ""
            }
          ],
          accountsTotal: 1,
          allowRegistration: true,
          marketplacePublicAccess: true,
          enabledProviders: ["password"],
          availableProviders: ["password", "github"]
        },
        overview: {
          metrics: [
            { label: "Accounts", value: "1" },
            { label: "Enabled Providers", value: "1" }
          ],
          roleSummary: [{ role: "auditor", count: 1 }]
        },
        filteredAccounts: [
          {
            id: 3,
            username: "reviewer",
            role: "auditor",
            status: "active",
            createdAt: "2026-03-16T10:00:00Z",
            updatedAt: "2026-03-16T11:00:00Z",
            forceLogoutAt: ""
          }
        ],
        selectedAccount: {
          id: 3,
          username: "reviewer",
          role: "auditor",
          status: "active",
          createdAt: "2026-03-16T10:00:00Z",
          updatedAt: "2026-03-16T11:00:00Z",
          forceLogoutAt: ""
        },
        activePane: options.activePane ?? "idle",
        settingsDraft: {
          allowRegistration: true,
          marketplacePublicAccess: true,
          enabledProviders: ["password"]
        },
        onRefresh: () => undefined,
        onKeywordChange: () => undefined,
        onClearKeyword: () => undefined,
        onOpenPolicyDrawer: () => undefined,
        onOpenAccountDrawer: () => undefined,
        onClosePane: () => undefined,
        onToggleProvider: () => undefined,
        onSettingsDraftChange: () => undefined,
        onSavePolicy: () => undefined
      })
    )
  );
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function expectMarkupToExcludeAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).not.toContain(fragment);
  }
}

describe("admin access content", () => {
  it("renders the inline policy pane with access settings and provider toggles", () => {
    const markup = renderAccessContent({ activePane: "policy" });

    expectMarkupToContainAll(markup, [
      "Account Directory",
      "Access Policy",
      "Policy Snapshot",
      'data-testid="admin-access-account-3"',
      "Close Panel",
      "Allow registration",
      "Marketplace public access",
      'aria-label="Provider password"',
      'aria-label="Provider github"',
      "Save Access Policy",
      "Available providers",
      "password, github"
    ]);
    expectMarkupToExcludeAll(markup, ['role="dialog"', "Open Policy Panel", "Role Distribution"]);
  });

  it("renders the selected account summary as an inline pane with stable fields", () => {
    const markup = renderAccessContent({ activePane: "account" });

    expectMarkupToContainAll(markup, [
      "Account Directory",
      'data-testid="admin-access-account-3"',
      "Open Details",
      "Close Panel",
      "reviewer #3",
      "Status: Active",
      "Role: Auditor"
    ]);
    expectMarkupToExcludeAll(markup, ['role="dialog"', "No selection", "Open Policy Panel"]);
  });
});
