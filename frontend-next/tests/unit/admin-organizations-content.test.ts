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
  createDrawerOpen?: boolean;
  memberDrawerOpen?: boolean;
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
        createDrawerOpen: options.createDrawerOpen ?? false,
        memberDrawerOpen: options.memberDrawerOpen ?? false,
        onRefresh: () => undefined,
        onSelectOrganization: () => undefined,
        onOpenCreateDrawer: () => undefined,
        onCloseCreateDrawer: () => undefined,
        onOpenMemberAssignmentDrawer: () => undefined,
        onOpenMemberDetailDrawer: () => undefined,
        onCloseMemberDrawer: () => undefined,
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

describe("admin organizations content", () => {
  it("renders drawer-based member assignment flow", () => {
    const markup = renderOrganizationsContent({ memberDrawerOpen: true, selectedMember: null });

    expect(markup).toContain("Organization Directory");
    expect(markup).toContain("Member Ledger");
    expect(markup).toContain("Assign Member");
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("Organization member user ID");
  });

  it("renders selected member details inside the drawer", () => {
    const markup = renderOrganizationsContent({
      memberDrawerOpen: true,
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

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("reviewer #3");
    expect(markup).toContain("Apply Role");
    expect(markup).toContain("Remove");
  });
});
