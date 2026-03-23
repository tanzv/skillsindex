"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
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
  createDrawerOpen: boolean;
  memberDrawerOpen: boolean;
  onRefresh: () => void;
  onSelectOrganization: (organizationId: number) => void;
  onOpenCreateDrawer: () => void;
  onCloseCreateDrawer: () => void;
  onOpenMemberAssignmentDrawer: () => void;
  onOpenMemberDetailDrawer: (userId: number) => void;
  onCloseMemberDrawer: () => void;
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
  createDrawerOpen,
  memberDrawerOpen,
  onRefresh,
  onSelectOrganization,
  onOpenCreateDrawer,
  onCloseCreateDrawer,
  onOpenMemberAssignmentDrawer,
  onOpenMemberDetailDrawer,
  onCloseMemberDrawer,
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
            onOpenMemberDetail={onOpenMemberDetailDrawer}
          />
        </div>

        <div className="space-y-6">
          <CreateOrganizationTriggerPanel
            busyAction={busyAction}
            loading={loading}
            onOpen={onOpenCreateDrawer}
          />
          <MemberAssignmentTriggerPanel
            selectedOrgId={selectedOrgId}
            busyAction={busyAction}
            loading={loading}
            onOpen={onOpenMemberAssignmentDrawer}
          />
          <SelectedOrganizationPanel overview={overview} />
        </div>
      </div>

      <DetailFormSurface
        open={createDrawerOpen}
        variant="drawer"
        size="default"
        title={organizationMessages.createTitle}
        description={organizationMessages.createDescription}
        closeLabel={organizationMessages.closePanelAction}
        onClose={onCloseCreateDrawer}
      >
        <CreateOrganizationForm
          value={newOrganizationName}
          busyAction={busyAction}
          onChange={onNewOrganizationNameChange}
          onCreate={onCreateOrganization}
        />
      </DetailFormSurface>

      <DetailFormSurface
        open={memberDrawerOpen && Boolean(selectedOrgId)}
        variant="drawer"
        size="default"
        title={
          selectedMember ? `${selectedMember.username} #${selectedMember.userId}` : organizationMessages.assignmentTitle
        }
        description={
          selectedMember ? organizationMessages.memberDetailDescription : organizationMessages.assignmentDescription
        }
        closeLabel={organizationMessages.closePanelAction}
        onClose={onCloseMemberDrawer}
      >
        <div className="space-y-6">
          <SelectedOrganizationSummary overview={overview} />
          {selectedMember ? (
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
      </DetailFormSurface>
    </AdminPageScaffold>
  );
}
