import { AdminEmptyBlock, AdminInsetBlock, AdminMessageBanner, AdminRecordCard, AdminSectionCard } from "@/src/components/admin/AdminPrimitives";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { OrganizationItem, OrganizationMemberItem, OrganizationsOverview } from "./organizationsModel";
import { formatDateTime } from "./shared";

export const organizationRoleOptions = ["owner", "admin", "member", "viewer"] as const;

function resolveOrganizationRoleLabel(
  role: string,
  messages: ReturnType<typeof useProtectedI18n>["messages"]["adminOrganizations"]
) {
  switch (role.toLowerCase()) {
    case "owner":
      return messages.roleOptionOwner;
    case "admin":
      return messages.roleOptionAdmin;
    case "viewer":
      return messages.roleOptionViewer;
    case "member":
      return messages.roleOptionMember;
    default:
      return role || messages.defaultMemberRole;
  }
}

function resolveOrganizationStatusLabel(
  status: string,
  messages: ReturnType<typeof useProtectedI18n>["messages"]["adminOrganizations"]
) {
  switch (status.toLowerCase()) {
    case "active":
      return messages.statusActive;
    case "disabled":
      return messages.statusDisabled;
    case "inactive":
      return messages.statusInactive;
    case "unknown":
      return messages.statusUnknown;
    default:
      return status || messages.statusUnknown;
  }
}

export function OrganizationDirectoryPanel({
  organizations,
  selectedOrgId,
  loading,
  error,
  message,
  onSelectOrganization
}: {
  organizations: OrganizationItem[];
  selectedOrgId: number;
  loading: boolean;
  error: string;
  message: string;
  onSelectOrganization: (organizationId: number) => void;
}) {
  const { messages } = useProtectedI18n();
  const organizationMessages = messages.adminOrganizations;

  return (
    <AdminSectionCard title={organizationMessages.directoryTitle} description={organizationMessages.directoryDescription}>
      {error ? <ErrorState description={error} /> : null}
      {message ? <AdminMessageBanner message={message} /> : null}

      <div className="flex flex-wrap gap-3">
        {organizations.map((item) => (
          <Button key={item.id} variant={item.id === selectedOrgId ? "default" : "outline"} onClick={() => onSelectOrganization(item.id)}>
            {item.name}
          </Button>
        ))}
      </div>

      {!organizations.length && !loading ? <AdminEmptyBlock>{organizationMessages.directoryEmpty}</AdminEmptyBlock> : null}
    </AdminSectionCard>
  );
}

export function MemberLedgerPanel({
  members,
  totalMembers,
  membersLoading,
  loading,
  busyAction,
  rowRoleDrafts,
  onRoleDraftChange,
  onUpdateMemberRole,
  onRemoveMember
}: {
  members: OrganizationMemberItem[];
  totalMembers: number;
  membersLoading: boolean;
  loading: boolean;
  busyAction: string;
  rowRoleDrafts: Record<number, string>;
  onRoleDraftChange: (userId: number, role: string) => void;
  onUpdateMemberRole: (userId: number) => void;
  onRemoveMember: (userId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const organizationMessages = messages.adminOrganizations;

  return (
    <AdminSectionCard
      title={organizationMessages.memberLedgerTitle}
      description={organizationMessages.memberLedgerDescription}
      actions={
        membersLoading ? (
          <Badge variant="outline">{organizationMessages.memberLedgerLoading}</Badge>
        ) : (
          <Badge variant="outline">{formatProtectedMessage(organizationMessages.memberLedgerCount, { count: totalMembers })}</Badge>
        )
      }
      contentClassName="space-y-3"
    >
      {members.map((member) => (
        <AdminRecordCard key={`${member.organizationId}-${member.userId}`} data-testid={`organization-member-card-${member.userId}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                  {member.username} #{member.userId}
                </span>
                <Badge variant={member.userStatus.toLowerCase() === "active" ? "soft" : "outline"}>
                  {resolveOrganizationStatusLabel(member.userStatus, organizationMessages)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-muted)]">
                <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                  {organizationMessages.workspaceRolePrefix} {resolveOrganizationRoleLabel(member.userRole, organizationMessages)}
                </span>
                <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                  {organizationMessages.organizationRolePrefix} {resolveOrganizationRoleLabel(member.role, organizationMessages)}
                </span>
                <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                  {organizationMessages.updatedPrefix} {formatDateTime(member.updatedAt, locale)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                aria-label={organizationMessages.memberRoleLabel}
                className="h-9"
                value={rowRoleDrafts[member.userId] || member.role}
                onChange={(event) => onRoleDraftChange(member.userId, event.target.value)}
              >
                {organizationRoleOptions.map((role) => (
                  <option key={role} value={role}>
                    {resolveOrganizationRoleLabel(role, organizationMessages)}
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="outline" onClick={() => onUpdateMemberRole(member.userId)} disabled={Boolean(busyAction)}>
                {busyAction === `update-role-${member.userId}` ? organizationMessages.savingRole : organizationMessages.applyRole}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRemoveMember(member.userId)} disabled={Boolean(busyAction)}>
                {busyAction === `remove-member-${member.userId}` ? organizationMessages.removingMember : organizationMessages.removeMember}
              </Button>
            </div>
          </div>
        </AdminRecordCard>
      ))}

      {!members.length && !membersLoading && !loading ? <AdminEmptyBlock>{organizationMessages.memberLedgerEmpty}</AdminEmptyBlock> : null}
    </AdminSectionCard>
  );
}

export function CreateOrganizationPanel({
  value,
  busyAction,
  onChange,
  onCreate
}: {
  value: string;
  busyAction: string;
  onChange: (value: string) => void;
  onCreate: () => void;
}) {
  const { messages } = useProtectedI18n();
  const organizationMessages = messages.adminOrganizations;

  return (
    <AdminSectionCard
      title={organizationMessages.createTitle}
      description={organizationMessages.createDescription}
      contentClassName="space-y-3"
    >
      <Input
        aria-label={organizationMessages.organizationNameLabel}
        value={value}
        placeholder={organizationMessages.organizationNamePlaceholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button onClick={onCreate} disabled={Boolean(busyAction)}>
        {busyAction === "create-organization" ? organizationMessages.creatingAction : organizationMessages.createAction}
      </Button>
    </AdminSectionCard>
  );
}

export function MemberAssignmentPanel({
  selectedOrgId,
  targetUserId,
  targetRole,
  busyAction,
  onTargetUserIdChange,
  onTargetRoleChange,
  onSave
}: {
  selectedOrgId: number;
  targetUserId: string;
  targetRole: string;
  busyAction: string;
  onTargetUserIdChange: (value: string) => void;
  onTargetRoleChange: (value: string) => void;
  onSave: () => void;
}) {
  const { messages } = useProtectedI18n();
  const organizationMessages = messages.adminOrganizations;

  return (
    <AdminSectionCard
      title={organizationMessages.assignmentTitle}
      description={organizationMessages.assignmentDescription}
      contentClassName="space-y-3"
    >
      <Input
        aria-label={organizationMessages.memberUserIdLabel}
        value={targetUserId}
        placeholder={organizationMessages.memberUserIdPlaceholder}
        onChange={(event) => onTargetUserIdChange(event.target.value)}
      />
      <Select
        aria-label={organizationMessages.memberRoleFieldLabel}
        value={targetRole}
        onChange={(event) => onTargetRoleChange(event.target.value)}
      >
        {organizationRoleOptions.map((role) => (
          <option key={role} value={role}>
            {resolveOrganizationRoleLabel(role, organizationMessages)}
          </option>
        ))}
      </Select>
      <Button onClick={onSave} disabled={Boolean(busyAction) || !selectedOrgId}>
        {busyAction === "add-member" ? organizationMessages.savingMemberAction : organizationMessages.saveMemberAction}
      </Button>
    </AdminSectionCard>
  );
}

export function SelectedOrganizationPanel({
  overview
}: {
  overview: OrganizationsOverview;
}) {
  const { locale, messages } = useProtectedI18n();
  const organizationMessages = messages.adminOrganizations;

  return (
    <AdminSectionCard
      title={organizationMessages.selectedTitle}
      description={organizationMessages.selectedDescription}
      contentClassName="space-y-3 text-sm text-[color:var(--ui-text-secondary)]"
    >
      <AdminInsetBlock>
        <div className="font-semibold text-[color:var(--ui-text-primary)]">
          {overview.selectedOrganization?.name || organizationMessages.noSelection}
        </div>
        <div className="mt-1">
          {organizationMessages.slugLabel}: {overview.selectedOrganization?.slug || organizationMessages.valueNotAvailable}
        </div>
        <div className="mt-1">
          {organizationMessages.selectedUpdatedLabel}:{" "}
          {overview.selectedOrganization
            ? formatDateTime(overview.selectedOrganization.updatedAt, locale)
            : organizationMessages.valueNotAvailable}
        </div>
      </AdminInsetBlock>
      {overview.roleDistribution.map((item) => (
        <AdminInsetBlock key={item.role} className="flex items-center justify-between">
          <span>{resolveOrganizationRoleLabel(item.role, organizationMessages)}</span>
          <span className="font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
        </AdminInsetBlock>
      ))}
    </AdminSectionCard>
  );
}
