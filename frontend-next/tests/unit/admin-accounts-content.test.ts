import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminAccountsContent } from "@/src/features/adminAccounts/AdminAccountsContent";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type { AdminAccountsRoute } from "@/src/features/adminAccounts/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createMessages() {
  return {
    ...createProtectedPageTestMessages({
      adminCommon: {
      adminEyebrow: "Admin",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      clear: "Clear"
      },
      adminAccounts: {
      routeAccountsTitle: "Accounts",
      routeAccountsDescription: "Inspect account inventory, update access state, force sign-out, and rotate credentials from a dedicated governance page.",
      routeProvisioningTitle: "Account Provisioning",
      routeProvisioningDescription: "Control registration posture and enabled login providers while monitoring recent account inventory.",
      routeRolesTitle: "Roles",
      routeRolesDescription: "Review role distribution across the account directory and apply targeted role changes.",
      routeRoleConfigurationTitle: "Role Configuration",
      routeRoleConfigurationDescription: "Stage targeted role changes while keeping directory-wide role distribution visible.",
      directoryTitle: "Account Directory",
      snapshotTitle: "Recent Account Snapshot",
      roleTargetsTitle: "Role Assignment Targets",
      searchLabel: "Search accounts",
      searchPlaceholder: "Search username, role, or status",
      statusFilterLabel: "Account status filter",
      statusOptionAll: "all",
      statusOptionActive: "active",
      statusOptionDisabled: "disabled",
      directoryEmpty: "No accounts matched the current filter.",
      selectedAction: "Selected",
      selectAction: "Select",
      forceSignOutAction: "Force Sign-out",
      forceSignOutBusy: "Applying...",
      closePanelAction: "Close Panel",
      selectedPanelTitle: "Selected Account",
      selectedPanelDescription: "All status and role actions should be anchored to a visible target account.",
      selectedPanelEmpty: "No account is currently selected.",
      actionsTitle: "Account Actions",
      actionsDescription: "Apply account state changes or rotate a credential for the selected directory entry.",
      targetUserIdLabel: "Target user ID",
      targetUserIdPlaceholder: "User ID",
      targetStatusLabel: "Target account status",
      targetPasswordLabel: "Target new password",
      targetPasswordPlaceholder: "New password",
      applyStatusAction: "Apply Status",
      applyStatusBusy: "Saving...",
      resetPasswordAction: "Reset Password",
      resetPasswordBusy: "Rotating...",
      currentTargetLabel: "Current target",
      currentTargetEmpty: "No account selected",
      roleAssignmentTitle: "Role Assignment",
      roleAssignmentDescription: "Reassign the selected user while keeping the directory and role distribution in view.",
      roleTargetUserIdLabel: "Role target user ID",
      roleTargetUserIdPlaceholder: "User ID",
      targetRoleLabel: "Target role",
      applyRoleAction: "Apply Role",
      applyRoleBusy: "Saving...",
      provisioningTitle: "Provisioning Policy",
      provisioningDescription: "Control registration posture and marketplace reach from a dedicated provisioning route.",
      allowRegistrationLabel: "Allow registration",
      marketplacePublicAccessLabel: "Marketplace public access",
      backendPostureLabel: "Current backend posture",
      registrationEnabled: "Registration enabled",
      registrationDisabled: "Registration disabled",
      marketplacePublic: "Marketplace public",
      marketplacePrivate: "Marketplace private",
      savePolicyAction: "Save Policy",
      savePolicyBusy: "Saving...",
      authProvidersTitle: "Authentication Providers",
      authProvidersDescription: "Keep sign-in providers visible and aligned with the current registration contract.",
      enabledProvidersLabel: "Enabled providers",
      enabledProvidersEmpty: "No providers enabled",
      rolePlaybookTitle: "Role Playbook",
      rolePlaybookDescription: "Use the built-in role definitions to keep assignment choices consistent across operators.",
      rolePlaybookBadge: "recommended use",
      roleSummaryTitle: "Role Summary",
      roleSummaryDescription: "Directory-wide role concentration for quick governance scanning.",
      roleGuidanceSuperAdmin: "Use only for platform owners who need full access across governance, operations, and security domains.",
      roleGuidanceAdmin: "Primary operator role for catalog, accounts, and daily platform administration.",
      roleGuidanceMember: "Standard signed-in operator without elevated administrative control.",
      roleGuidanceViewer: "Minimal visibility role for observers, demos, and non-operational stakeholders.",
      valueUnknownUser: "Unknown user",
      statusLabelActive: "Active",
      statusLabelDisabled: "Disabled",
      statusLabelUnknown: "Unknown",
      roleLabelSuperAdmin: "Super Admin",
      roleLabelAdmin: "Admin",
      roleLabelMember: "Member",
      roleLabelViewer: "Viewer",
      roleLabelUnknown: "Unknown",
      notAvailable: "n/a",
      createdPrefix: "created",
      updatedPrefix: "updated",
      forceSignOutPrefix: "force sign-out",
      noPendingSignOut: "no pending sign-out",
      loadError: "Failed to load account governance.",
      invalidUserIdError: "Valid user ID is required.",
      invalidPasswordError: "Valid user ID and new password are required.",
      applyStatusSuccess: "Account {userId} status updated.",
      applyStatusError: "Failed to update account status.",
      forceSignOutSuccess: "Force sign-out requested for user {userId}.",
      forceSignOutError: "Failed to force sign-out account.",
      resetPasswordSuccess: "Password rotated for user {userId}.",
      resetPasswordError: "Failed to reset account password.",
      applyRoleSuccess: "Role updated for user {userId}.",
      applyRoleError: "Failed to update role.",
      saveSettingsSuccess: "Provisioning policy updated.",
      saveSettingsError: "Failed to update provisioning policy."
      }
    })
  };
}

function renderAdminAccountsRoute(route: AdminAccountsRoute) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      { locale: "en", messages: createMessages() },
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
        detailPaneOpen: true,
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
        onCloseDetailPane: () => undefined,
        onSettingsDraftChange: () => undefined,
        onToggleProvider: () => undefined,
        onApplyAccountStatus: () => undefined,
        onForceSignout: () => undefined,
        onResetPassword: () => undefined,
        onApplyRole: () => undefined,
        onSaveSettings: () => undefined
      })
    )
  );
}

describe("admin accounts content", () => {
  it("renders accounts route as directory plus account actions", () => {
    const markup = renderAdminAccountsRoute("/admin/accounts");

    expect(markup).toContain("Account Directory");
    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain('data-testid="admin-accounts-work-pane"');
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

    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain('data-testid="admin-accounts-work-pane"');
    expect(markup).toContain("Role Assignment");
    expect(markup).toContain("Role Playbook");
    expect(markup).toContain("Role Summary");
  });
});
