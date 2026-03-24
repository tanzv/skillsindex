"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { InlineWorkPaneSurface } from "@/src/components/shared/InlineWorkPaneSurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { OrganizationItem, OrganizationMemberItem, OrganizationsOverview } from "./organizationsModel";
import {
  CreateOrganizationForm,
  CreateOrganizationTriggerPanel,
  MemberAssignmentForm,
  MemberAssignmentTriggerPanel,
  MemberLedgerPanel,
  OrganizationDirectoryPanel,
  OrganizationMemberDetailForm,
  SelectedOrganizationPanel,
  SelectedOrganizationSummary
} from "./AdminOrganizationsPanels";

interface AdminOrganizationsContentProps {
  loading: boolean;
  membersLoading: boolean;
  busyAction: string;
  error: string;
  message: string;
  metrics: Array<{ label: string; value: string }>;
  organizations: OrganizationItem[];
  members: OrganizationMemberItem[];
  totalMembers: number;
  overview: OrganizationsOverview;
  selectedOrgId: number;
  selectedMember: OrganizationMemberItem | null;
  rowRoleDrafts: Record<number, string>;
  newOrganizationName: string;
  targetUserId: string;
  targetRole: string;
  activePane: "idle" | "create" | "memberAssign" | "memberDetail";
  onRefresh: () => void;
  onSelectOrganization: (organizationId: number) => void;
  onOpenCreatePane: () => void;
  onOpenMemberAssignmentPane: () => void;
  onOpenMemberDetailPane: (userId: number) => void;
  onClosePane: () => void;
  onNewOrganizationNameChange: (value: string) => void;
  onTargetUserIdChange: (value: string) => void;
  onTargetRoleChange: (value: string) => void;
  onRoleDraftChange: (userId: number, role: string) => void;
  onCreateOrganization: () => void;
  onSaveMember: () => void;
  onUpdateMemberRole: (userId: number) => void;
  onRemoveMember: (userId: number) => void;
}

export function AdminOrganizationsContent({
  loading,
  membersLoading,
  busyAction,
  error,
  message,
  metrics,
  organizations,
  members,
  totalMembers,
  overview,
  selectedOrgId,
  selectedMember,
  rowRoleDrafts,
  newOrganizationName,
  targetUserId,
  targetRole,
  activePane,
  onRefresh,
  onSelectOrganization,
  onOpenCreatePane,
  onOpenMemberAssignmentPane,
  onOpenMemberDetailPane,
  onClosePane,
  onNewOrganizationNameChange,
  onTargetUserIdChange,
  onTargetRoleChange,
  onRoleDraftChange,
  onCreateOrganization,
  onSaveMember,
  onUpdateMemberRole,
  onRemoveMember
}: AdminOrganizationsContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const organizationMessages = messages.adminOrganizations;
  const activePaneTitle =
    activePane === "memberDetail" && selectedMember
      ? `${selectedMember.username} #${selectedMember.userId}`
      : activePane === "create"
        ? organizationMessages.createTitle
        : organizationMessages.assignmentTitle;
  const activePaneDescription =
    activePane === "memberDetail" && selectedMember
      ? organizationMessages.memberDetailDescription
      : activePane === "create"
        ? organizationMessages.createDescription
        : organizationMessages.assignmentDescription;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={organizationMessages.pageTitle}
      description={organizationMessages.pageDescription}
      actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      metrics={metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <OrganizationDirectoryPanel
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            loading={loading}
            error={error}
            message={message}
            onSelectOrganization={onSelectOrganization}
          />
          <MemberLedgerPanel
            members={members}
            totalMembers={totalMembers}
            membersLoading={membersLoading}
            loading={loading}
            onOpenMemberDetail={onOpenMemberDetailPane}
          />
        </div>

        <div className="space-y-6">
          <CreateOrganizationTriggerPanel
            busyAction={busyAction}
            loading={loading}
            onOpen={onOpenCreatePane}
          />
          <MemberAssignmentTriggerPanel
            selectedOrgId={selectedOrgId}
            busyAction={busyAction}
            loading={loading}
            onOpen={onOpenMemberAssignmentPane}
          />
          {activePane !== "idle" ? (
            <InlineWorkPaneSurface
              title={activePaneTitle}
              description={activePaneDescription}
              closeLabel={organizationMessages.closePanelAction}
              onClose={onClosePane}
              dataTestId={activePane === "create" ? "admin-organizations-create-pane" : "admin-organizations-member-pane"}
            >
              {activePane === "create" ? (
                <div data-testid="organization-create-pane">
                  <CreateOrganizationForm
                    value={newOrganizationName}
                    busyAction={busyAction}
                    onChange={onNewOrganizationNameChange}
                    onCreate={onCreateOrganization}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <SelectedOrganizationSummary overview={overview} />
                  {activePane === "memberDetail" && selectedMember ? (
                    <OrganizationMemberDetailForm
                      member={selectedMember}
                      busyAction={busyAction}
                      rowRoleDrafts={rowRoleDrafts}
                      onRoleDraftChange={onRoleDraftChange}
                      onUpdateMemberRole={onUpdateMemberRole}
                      onRemoveMember={onRemoveMember}
                    />
                  ) : (
                    <MemberAssignmentForm
                      selectedOrgId={selectedOrgId}
                      targetUserId={targetUserId}
                      targetRole={targetRole}
                      busyAction={busyAction}
                      onTargetUserIdChange={onTargetUserIdChange}
                      onTargetRoleChange={onTargetRoleChange}
                      onSave={onSaveMember}
                    />
                  )}
                </div>
              )}
            </InlineWorkPaneSurface>
          ) : null}
          <SelectedOrganizationPanel overview={overview} />
        </div>
      </div>
    </AdminPageScaffold>
  );
}
