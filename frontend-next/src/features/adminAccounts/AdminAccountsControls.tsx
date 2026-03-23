import { AdminInsetBlock, AdminToggleField } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAccountRoleLabel, resolveAccountUsernameLabel } from "@/src/lib/accountDisplay";

import { type AdminAccountItem, type AuthProvidersPayload, type RegistrationPayload } from "./model";

const roleOptions = ["super_admin", "admin", "auditor", "member", "viewer"];

const roleGuidance = [
  { role: "super_admin" },
  { role: "admin" },
  { role: "auditor" },
  { role: "member" },
  { role: "viewer" }
] as const;

function CurrentTargetSummary({ selectedAccount }: { selectedAccount: AdminAccountItem | null }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;

  return (
    <AdminInsetBlock>
      {accountMessages.currentTargetLabel}
      <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
        {selectedAccount
          ? `${resolveAccountUsernameLabel(selectedAccount.username, accountMessages)} #${selectedAccount.id}`
          : accountMessages.currentTargetEmpty}
      </div>
    </AdminInsetBlock>
  );
}

interface AccountActionsPanelProps {
  accountEditor: {
    userId: string;
    status: string;
    newPassword: string;
  };
  busyAction: string;
  selectedAccount: AdminAccountItem | null;
  onAccountEditorChange: (patch: { userId?: string; status?: string; newPassword?: string }) => void;
  onApplyAccountStatus: () => void;
  onForceSignout: (userId: number) => void;
  onResetPassword: () => void;
}

export function AccountActionsPanel({
  accountEditor,
  busyAction,
  selectedAccount,
  onAccountEditorChange,
  onApplyAccountStatus,
  onForceSignout,
  onResetPassword
}: AccountActionsPanelProps) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountMessages.actionsTitle}</CardTitle>
        <CardDescription>{accountMessages.actionsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          aria-label={accountMessages.targetUserIdLabel}
          value={accountEditor.userId}
          placeholder={accountMessages.targetUserIdPlaceholder}
          onChange={(event) => onAccountEditorChange({ userId: event.target.value })}
        />
        <Select
          aria-label={accountMessages.targetStatusLabel}
          value={accountEditor.status}
          onChange={(event) => onAccountEditorChange({ status: event.target.value })}
        >
          <option value="active">{accountMessages.statusOptionActive}</option>
          <option value="disabled">{accountMessages.statusOptionDisabled}</option>
        </Select>
        <Button onClick={onApplyAccountStatus} disabled={Boolean(busyAction)}>
          {busyAction === "apply-status" ? accountMessages.applyStatusBusy : accountMessages.applyStatusAction}
        </Button>
        {selectedAccount ? (
          <Button variant="outline" onClick={() => onForceSignout(selectedAccount.id)} disabled={Boolean(busyAction)}>
            {busyAction === `force-signout-${selectedAccount.id}` ? accountMessages.forceSignOutBusy : accountMessages.forceSignOutAction}
          </Button>
        ) : null}
        <Input
          aria-label={accountMessages.targetPasswordLabel}
          value={accountEditor.newPassword}
          placeholder={accountMessages.targetPasswordPlaceholder}
          onChange={(event) => onAccountEditorChange({ newPassword: event.target.value })}
        />
        <Button variant="outline" onClick={onResetPassword} disabled={Boolean(busyAction)}>
          {busyAction === "reset-password" ? accountMessages.resetPasswordBusy : accountMessages.resetPasswordAction}
        </Button>
        <CurrentTargetSummary selectedAccount={selectedAccount} />
      </CardContent>
    </Card>
  );
}

interface RoleAssignmentPanelProps {
  roleEditor: {
    userId: string;
    role: string;
  };
  busyAction: string;
  selectedAccount: AdminAccountItem | null;
  onRoleEditorChange: (patch: { userId?: string; role?: string }) => void;
  onApplyRole: () => void;
}

export function RoleAssignmentPanel({
  roleEditor,
  busyAction,
  selectedAccount,
  onRoleEditorChange,
  onApplyRole
}: RoleAssignmentPanelProps) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountMessages.roleAssignmentTitle}</CardTitle>
        <CardDescription>{accountMessages.roleAssignmentDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          aria-label={accountMessages.roleTargetUserIdLabel}
          value={roleEditor.userId}
          placeholder={accountMessages.roleTargetUserIdPlaceholder}
          onChange={(event) => onRoleEditorChange({ userId: event.target.value })}
        />
        <Select
          aria-label={accountMessages.targetRoleLabel}
          value={roleEditor.role}
          onChange={(event) => onRoleEditorChange({ role: event.target.value })}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {resolveAccountRoleLabel(role, accountMessages)}
            </option>
          ))}
        </Select>
        <Button onClick={onApplyRole} disabled={Boolean(busyAction)}>
          {busyAction === "apply-role" ? accountMessages.applyRoleBusy : accountMessages.applyRoleAction}
        </Button>
        <CurrentTargetSummary selectedAccount={selectedAccount} />
      </CardContent>
    </Card>
  );
}

interface ProvisioningPolicyPanelProps {
  registration: RegistrationPayload;
  authProviders: AuthProvidersPayload;
  settingsDraft: {
    allowRegistration: boolean;
    marketplacePublicAccess: boolean;
    enabledProviders: string[];
  };
  busyAction: string;
  onSettingsDraftChange: (patch: {
    allowRegistration?: boolean;
    marketplacePublicAccess?: boolean;
    enabledProviders?: string[];
  }) => void;
  onToggleProvider: (provider: string) => void;
  onSaveSettings: () => void;
}

export function ProvisioningPolicyPanel({
  registration,
  authProviders,
  settingsDraft,
  busyAction,
  onSettingsDraftChange,
  onToggleProvider,
  onSaveSettings
}: ProvisioningPolicyPanelProps) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{accountMessages.provisioningTitle}</CardTitle>
          <CardDescription>{accountMessages.provisioningDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminToggleField
            ariaLabel={accountMessages.allowRegistrationLabel}
            label={accountMessages.allowRegistrationLabel}
            checked={settingsDraft.allowRegistration}
            onChange={(checked) => onSettingsDraftChange({ allowRegistration: checked })}
          />
          <AdminToggleField
            ariaLabel={accountMessages.marketplacePublicAccessLabel}
            label={accountMessages.marketplacePublicAccessLabel}
            checked={settingsDraft.marketplacePublicAccess}
            onChange={(checked) => onSettingsDraftChange({ marketplacePublicAccess: checked })}
          />
          <AdminInsetBlock>
            {accountMessages.backendPostureLabel}
            <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
              {registration.allowRegistration ? accountMessages.registrationEnabled : accountMessages.registrationDisabled} ·{" "}
              {registration.marketplacePublicAccess ? accountMessages.marketplacePublic : accountMessages.marketplacePrivate}
            </div>
          </AdminInsetBlock>
          <Button onClick={onSaveSettings} disabled={Boolean(busyAction)}>
            {busyAction === "save-settings" ? accountMessages.savePolicyBusy : accountMessages.savePolicyAction}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{accountMessages.authProvidersTitle}</CardTitle>
          <CardDescription>{accountMessages.authProvidersDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {authProviders.availableAuthProviders.map((provider) => {
              const selected = settingsDraft.enabledProviders.includes(provider);

              return (
                <Button key={provider} size="sm" variant={selected ? "default" : "outline"} onClick={() => onToggleProvider(provider)}>
                  {provider}
                </Button>
              );
            })}
          </div>
          <AdminInsetBlock>
            {accountMessages.enabledProvidersLabel}
            <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
              {settingsDraft.enabledProviders.length ? settingsDraft.enabledProviders.join(", ") : accountMessages.enabledProvidersEmpty}
            </div>
          </AdminInsetBlock>
        </CardContent>
      </Card>
    </>
  );
}

export function RolePlaybookPanel() {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountMessages.rolePlaybookTitle}</CardTitle>
        <CardDescription>{accountMessages.rolePlaybookDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roleGuidance.map((item) => (
          <div
            key={item.role}
            className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                {resolveAccountRoleLabel(item.role, accountMessages)}
              </span>
              <Badge variant="outline">{accountMessages.rolePlaybookBadge}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ui-text-secondary)]">
              {item.role === "super_admin"
                ? accountMessages.roleGuidanceSuperAdmin
                : item.role === "admin"
                  ? accountMessages.roleGuidanceAdmin
                  : item.role === "auditor"
                    ? accountMessages.roleGuidanceAuditor
                    : item.role === "member"
                      ? accountMessages.roleGuidanceMember
                      : accountMessages.roleGuidanceViewer}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RoleSummaryPanel({ roleSummary }: { roleSummary: Array<{ role: string; count: number }> }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountMessages.roleSummaryTitle}</CardTitle>
        <CardDescription>{accountMessages.roleSummaryDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roleSummary.map((item) => (
          <AdminInsetBlock key={item.role} className="flex items-center justify-between">
            <span className="text-sm text-[color:var(--ui-text-secondary)]">{resolveAccountRoleLabel(item.role, accountMessages)}</span>
            <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
          </AdminInsetBlock>
        ))}
      </CardContent>
    </Card>
  );
}
