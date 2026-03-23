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
      marketplaceRankingTitle: "Marketplace Top",
      marketplaceRankingDescription: "Manage public ranking defaults.",
      rankingDefaultSortLabel: "Default sort",
      rankingDefaultSortStars: "Stars",
      rankingDefaultSortQuality: "Quality",
      rankingLimitLabel: "Ranking limit",
      highlightLimitLabel: "Highlight limit",
      categoryLeaderLimitLabel: "Category leader limit",
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

function renderAccessContent(options: { policyDrawerOpen?: boolean; accountDrawerOpen?: boolean } = {}) {
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
          rankingDefaultSort: "quality",
          rankingLimit: 18,
          highlightLimit: 4,
          categoryLeaderLimit: 2,
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
        policyDrawerOpen: options.policyDrawerOpen ?? false,
        accountDrawerOpen: options.accountDrawerOpen ?? false,
        settingsDraft: {
          allowRegistration: true,
          marketplacePublicAccess: true,
          rankingDefaultSort: "quality",
          rankingLimit: 18,
          highlightLimit: 4,
          categoryLeaderLimit: 2,
          enabledProviders: ["password"]
        },
        onRefresh: () => undefined,
        onKeywordChange: () => undefined,
        onClearKeyword: () => undefined,
        onOpenPolicyDrawer: () => undefined,
        onClosePolicyDrawer: () => undefined,
        onOpenAccountDrawer: (accountId: number) => {
          void accountId;
        },
        onCloseAccountDrawer: () => undefined,
        onToggleProvider: () => undefined,
        onSettingsDraftChange: () => undefined,
        onSavePolicy: () => undefined
      })
    )
  );
}

describe("admin access content", () => {
  it("renders marketplace ranking settings in the policy drawer", () => {
    const markup = renderAccessContent({ policyDrawerOpen: true });

    expect(markup).toContain("Marketplace Top");
    expect(markup).toContain("Manage public ranking defaults.");
    expect(markup).toContain("Default sort");
    expect(markup).toContain("Ranking limit");
    expect(markup).toContain("Highlight limit");
    expect(markup).toContain("Category leader limit");
    expect(markup).toContain("Policy Snapshot");
    expect(markup).toContain("Available providers");
  });

  it("renders snapshot values for marketplace ranking policy", () => {
    const markup = renderAccessContent();

    expect(markup).toContain("Quality");
    expect(markup).toContain(">18<");
    expect(markup).toContain(">4<");
    expect(markup).toContain(">2<");
  });
});
