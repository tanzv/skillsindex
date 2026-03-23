import { AdminEmptyBlock, AdminFilterBar, AdminPageScaffold, AdminSectionCard } from "@/src/components/admin/AdminPrimitives";
import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAdminAccountsPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";

import {
  type AdminAccountItem,
  type AdminAccountsRoute,
  type AuthProvidersPayload,
  type RegistrationPayload
} from "./model";
import {
  AccountActionsPanel,
  AccountDirectoryCard,
  ProvisioningPolicyPanel,
  RoleAssignmentPanel,
  RolePlaybookPanel,
  RoleSummaryPanel,
  SelectedAccountSnapshot
} from "./AdminAccountsPanels";

interface AdminAccountsContentProps {
  route: AdminAccountsRoute;
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  searchQuery: string;
  statusFilter: string;
  metrics: Array<{ label: string; value: string }>;
  accounts: AdminAccountItem[];
  selectedAccount: AdminAccountItem | null;
  registration: RegistrationPayload;
  authProviders: AuthProvidersPayload;
  roleSummary: Array<{ role: string; count: number }>;
  accountEditor: {
    userId: string;
    status: string;
    newPassword: string;
  };
  roleEditor: {
    userId: string;
    role: string;
  };
  detailDrawerOpen: boolean;
  settingsDraft: {
    allowRegistration: boolean;
    marketplacePublicAccess: boolean;
    enabledProviders: string[];
  };
  onRefresh: () => void;
  onSelectAccount: (accountId: number) => void;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAccountEditorChange: (patch: Partial<AdminAccountsContentProps["accountEditor"]>) => void;
  onRoleEditorChange: (patch: Partial<AdminAccountsContentProps["roleEditor"]>) => void;
  onCloseDetailDrawer: () => void;
  onSettingsDraftChange: (patch: Partial<AdminAccountsContentProps["settingsDraft"]>) => void;
  onToggleProvider: (provider: string) => void;
  onApplyAccountStatus: () => void;
  onForceSignout: (userId: number) => void;
  onResetPassword: () => void;
  onApplyRole: () => void;
  onSaveSettings: () => void;
}

export function AdminAccountsContent({
  route,
  loading,
  busyAction,
  error,
  message,
  searchQuery,
  statusFilter,
  metrics,
  accounts,
  selectedAccount,
  registration,
  authProviders,
  roleSummary,
  accountEditor,
  roleEditor,
  detailDrawerOpen,
  settingsDraft,
  onRefresh,
  onSelectAccount,
  onSearchQueryChange,
  onStatusFilterChange,
  onAccountEditorChange,
  onRoleEditorChange,
  onCloseDetailDrawer,
  onSettingsDraftChange,
  onToggleProvider,
  onApplyAccountStatus,
  onForceSignout,
  onResetPassword,
  onApplyRole,
  onSaveSettings
}: AdminAccountsContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const accountMessages = messages.adminAccounts;
  const meta = resolveAdminAccountsPageRouteMeta(route, accountMessages);
  const showRolePanel = route === "/admin/roles" || route === "/admin/roles/new";
  const showSettingsPanel = route === "/admin/accounts/new";
  const showAccountActionsPanel = route === "/admin/accounts";
  const showDetailDrawer = showAccountActionsPanel || showRolePanel;
  const showDirectoryControls = route !== "/admin/accounts/new";

  const directoryTitle = showSettingsPanel
    ? accountMessages.snapshotTitle
    : showRolePanel
      ? accountMessages.roleTargetsTitle
      : accountMessages.directoryTitle;
  const directoryDescription = showSettingsPanel
    ? accountMessages.snapshotDescription
    : showRolePanel
      ? accountMessages.roleTargetsDescription
      : accountMessages.directoryDescription;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={meta.title}
      description={meta.description}
      actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      metrics={metrics}
      error={error}
      message={message}
    >
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <AdminSectionCard
            className="rounded-3xl shadow-[var(--ui-card-shadow)]"
            title={directoryTitle}
            description={directoryDescription}
            contentClassName="space-y-4"
          >
              {showDirectoryControls ? (
                <AdminFilterBar className="md:grid-cols-[1fr_180px_auto]">
                  <Input
                    aria-label={accountMessages.searchLabel}
                    value={searchQuery}
                    placeholder={accountMessages.searchPlaceholder}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                  />
                  <Select
                    aria-label={accountMessages.statusFilterLabel}
                    value={statusFilter}
                    onChange={(event) => onStatusFilterChange(event.target.value)}
                  >
                    <option value="all">{accountMessages.statusOptionAll}</option>
                    <option value="active">{accountMessages.statusOptionActive}</option>
                    <option value="disabled">{accountMessages.statusOptionDisabled}</option>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSearchQueryChange("");
                      onStatusFilterChange("all");
                    }}
                  >
                      {commonMessages.clear}
                  </Button>
                </AdminFilterBar>
              ) : null}

              <div className="space-y-3">
                {accounts.map((account) => (
                  <AccountDirectoryCard
                    key={account.id}
                    account={account}
                    selected={selectedAccount?.id === account.id}
                    route={route}
                    busyAction={busyAction}
                    onSelectAccount={onSelectAccount}
                    onForceSignout={onForceSignout}
                  />
                ))}
                {!accounts.length && !loading ? (
                  <AdminEmptyBlock>{accountMessages.directoryEmpty}</AdminEmptyBlock>
                ) : null}
              </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          {showSettingsPanel ? (
            <ProvisioningPolicyPanel
              registration={registration}
              authProviders={authProviders}
              settingsDraft={settingsDraft}
              busyAction={busyAction}
              onSettingsDraftChange={onSettingsDraftChange}
              onToggleProvider={onToggleProvider}
              onSaveSettings={onSaveSettings}
            />
          ) : null}
          {showRolePanel ? (
            route === "/admin/roles/new" ? <RolePlaybookPanel /> : null
          ) : null}
          <RoleSummaryPanel roleSummary={roleSummary} />
        </div>
      </div>

      <DetailFormSurface
        open={showDetailDrawer && detailDrawerOpen && Boolean(selectedAccount)}
        variant="drawer"
        size="default"
        title={showAccountActionsPanel ? accountMessages.actionsTitle : accountMessages.roleAssignmentTitle}
        description={showAccountActionsPanel ? accountMessages.actionsDescription : accountMessages.roleAssignmentDescription}
        closeLabel={accountMessages.closePanelAction}
        onClose={onCloseDetailDrawer}
      >
        <div className="space-y-6">
          <SelectedAccountSnapshot account={selectedAccount} />
          {showAccountActionsPanel ? (
            <AccountActionsPanel
              accountEditor={accountEditor}
              busyAction={busyAction}
              selectedAccount={selectedAccount}
              onAccountEditorChange={onAccountEditorChange}
              onApplyAccountStatus={onApplyAccountStatus}
              onForceSignout={onForceSignout}
              onResetPassword={onResetPassword}
            />
          ) : null}
          {showRolePanel ? (
            <RoleAssignmentPanel
              roleEditor={roleEditor}
              busyAction={busyAction}
              selectedAccount={selectedAccount}
              onRoleEditorChange={onRoleEditorChange}
              onApplyRole={onApplyRole}
            />
          ) : null}
        </div>
      </DetailFormSurface>
    </AdminPageScaffold>
  );
}
