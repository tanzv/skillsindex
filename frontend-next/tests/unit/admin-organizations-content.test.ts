import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { AdminOrganizationsContent } from "@/src/features/adminGovernance/AdminOrganizationsContent";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createMessages() {
  return createProtectedPageTestMessages({
    adminCommon: {
      adminEyebrow: "Admin",
      refresh: "Refresh",
      refreshing: "Refreshing..."
    },
    adminOrganizations: {
      pageTitle: "Organizations",
      pageDescription: "Manage organization inventory.",
      loadError: "Failed to load organizations.",
      createRequiredNameError: "Organization name is required.",
      createSuccess: "Organization created.",
      createError: "Failed to create organization.",
      addMemberValidationError: "Valid organization and user ID are required.",
      addMemberSuccess: "Member assignment saved.",
      addMemberError: "Failed to save organization member.",
      updateRoleSuccess: "Role updated for user {userId}.",
      updateRoleError: "Failed to update member role.",
      removeMemberSuccess: "User {userId} removed.",
      removeMemberError: "Failed to remove organization member.",
      metricOrganizations: "Organizations",
      metricSelectedMembers: "Selected Members",
      metricActiveMembers: "Active Members",
      metricDistinctRoles: "Distinct Roles",
      directoryTitle: "Organization Directory",
      directoryDescription: "Directory description",
      directoryEmpty: "No organizations returned.",
      memberLedgerTitle: "Member Ledger",
      memberLedgerDescription: "Ledger description",
      memberLedgerLoading: "Loading",
      memberLedgerCount: "{count} members",
      memberRoleLabel: "Member role",
      workspaceRolePrefix: "workspace",
      organizationRolePrefix: "org",
      updatedPrefix: "updated",
      applyRole: "Apply Role",
      savingRole: "Saving...",
      removeMember: "Remove",
      removingMember: "Removing...",
      openMemberDetailAction: "Open Details",
      memberLedgerEmpty: "No members returned.",
      createTitle: "Create Organization",
      createDescription: "Create a new organization.",
      organizationNameLabel: "Organization name",
      organizationNamePlaceholder: "Platform Engineering",
      createAction: "Create Organization",
      creatingAction: "Creating...",
      assignmentTitle: "Member Assignment",
      assignmentDescription: "Assign a user to the selected organization.",
      memberUserIdLabel: "Organization member user ID",
      memberUserIdPlaceholder: "Target user ID",
      memberRoleFieldLabel: "Organization member role",
      openMemberAssignmentAction: "Assign Member",
      saveMemberAction: "Save Member",
      savingMemberAction: "Saving...",
      memberDetailDescription: "Update the selected member without leaving the ledger.",
      closePanelAction: "Close Panel",
      selectedTitle: "Selected Organization",
      selectedDescription: "Current organization summary.",
      noSelection: "No selection",
      slugLabel: "Slug",
      selectedUpdatedLabel: "Updated",
      valueUntitledOrganization: "Untitled organization",
      valueNotAvailable: "n/a",
      valueUnknownUser: "Unknown user",
      valueUnknownStatus: "unknown",
      defaultMemberRole: "member",
      roleOptionOwner: "Owner",
      roleOptionAdmin: "Admin",
      roleOptionMember: "Member",
      roleOptionViewer: "Viewer",
      statusActive: "Active",
      statusDisabled: "Disabled",
      statusInactive: "Inactive",
      statusUnknown: "Unknown"
    }
  });
}

function renderOrganizationsContent(options: {
  activePane?: "idle" | "create" | "memberAssign" | "memberDetail";
  selectedMember?: {
    organizationId: number;
    userId: number;
    username: string;
    userRole: string;
    userStatus: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  } | null;
} = {}) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      { locale: "en", messages: createMessages() },
      createElement(AdminOrganizationsContent, {
        loading: false,
        membersLoading: false,
        busyAction: "",
        error: "",
        message: "",
        metrics: [
          { label: "Organizations", value: "2" },
          { label: "Selected Members", value: "1" }
        ],
        organizations: [
          {
            id: 7,
            name: "Platform Engineering",
            slug: "platform",
            createdAt: "2026-03-01T08:00:00Z",
            updatedAt: "2026-03-16T08:00:00Z"
          }
        ],
        members: [
          {
            organizationId: 7,
            userId: 3,
            username: "reviewer",
            userRole: "member",
            userStatus: "active",
            role: "admin",
            createdAt: "2026-03-01T08:00:00Z",
            updatedAt: "2026-03-16T08:00:00Z"
          }
        ],
        totalMembers: 1,
        overview: {
          metrics: [
            { label: "Organizations", value: "2" },
            { label: "Selected Members", value: "1" }
          ],
          selectedOrganization: {
            id: 7,
            name: "Platform Engineering",
            slug: "platform",
            createdAt: "2026-03-01T08:00:00Z",
            updatedAt: "2026-03-16T08:00:00Z"
          },
          roleDistribution: [{ role: "admin", count: 1 }]
        },
        selectedOrgId: 7,
        selectedMember: options.selectedMember === undefined ? null : options.selectedMember,
        rowRoleDrafts: { 3: "viewer" },
        newOrganizationName: "Reliability Guild",
        targetUserId: "3",
        targetRole: "admin",
        activePane: options.activePane ?? "idle",
        onRefresh: () => undefined,
        onSelectOrganization: () => undefined,
        onOpenCreatePane: () => undefined,
        onOpenMemberAssignmentPane: () => undefined,
        onOpenMemberDetailPane: () => undefined,
        onClosePane: () => undefined,
        onNewOrganizationNameChange: () => undefined,
        onTargetUserIdChange: () => undefined,
        onTargetRoleChange: () => undefined,
        onRoleDraftChange: () => undefined,
        onCreateOrganization: () => undefined,
        onSaveMember: () => undefined,
        onUpdateMemberRole: () => undefined,
        onRemoveMember: () => undefined
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

function countOccurrences(markup: string, text: string) {
  return markup.split(text).length - 1;
}

describe("admin organizations content", () => {
  it("renders top-level organization actions without a duplicated create trigger card", () => {
    const markup = renderOrganizationsContent();

    expectMarkupToContainAll(markup, ["Create Organization", "Assign Member", "Refresh"]);
    expect(countOccurrences(markup, "Create a new organization.")).toBe(0);
    expect(countOccurrences(markup, "Assign a user to the selected organization.")).toBe(0);
  });

  it("renders the member assignment drawer with organization summary and form controls", () => {
    const markup = renderOrganizationsContent({ activePane: "memberAssign", selectedMember: null });

    expectMarkupToContainAll(markup, [
      "Organization Directory",
      "Member Ledger",
      "Platform Engineering",
      'data-testid="organization-member-card-3"',
      'data-testid="admin-organizations-member-pane"',
      "Member Assignment",
      "Assign a user to the selected organization.",
      "Close Panel",
      "Slug: platform",
      'aria-label="Organization member user ID"',
      'aria-label="Organization member role"',
      "Save Member"
    ]);
    expect(markup).toContain('role="dialog"');
  });

  it("renders the selected member detail drawer with stable member actions", () => {
    const markup = renderOrganizationsContent({
      activePane: "memberDetail",
      selectedMember: {
        organizationId: 7,
        userId: 3,
        username: "reviewer",
        userRole: "member",
        userStatus: "active",
        role: "admin",
        createdAt: "2026-03-01T08:00:00Z",
        updatedAt: "2026-03-16T08:00:00Z"
      }
    });

    expectMarkupToContainAll(markup, [
      "Organization Directory",
      "Member Ledger",
      'data-testid="organization-member-card-3"',
      'data-testid="admin-organizations-member-pane"',
      'data-testid="organization-member-detail-3"',
      "reviewer #3",
      "Close Panel",
      'aria-label="Member role"',
      "Apply Role",
      "Remove"
    ]);
    expectMarkupToExcludeAll(markup, ["No selection"]);
    expect(markup).toContain('role="dialog"');
  });
});
