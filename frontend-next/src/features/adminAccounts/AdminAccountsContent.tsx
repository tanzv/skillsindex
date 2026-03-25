import { AdminEmptyBlock, AdminFilterBar, AdminPageScaffold, AdminSectionCard } from "@/src/components/admin/AdminPrimitives";
import { AdminDetailDrawer } from "@/src/components/admin/AdminOverlaySurface";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAccountUsernameLabel } from "@/src/lib/accountDisplay";
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
  detailPaneOpen: boolean;
  settingsDraft: {
    allowRegistration: boolean;
    marketplacePublicAccess: boolean;
    rankingDefaultSort: "stars" | "quality";
    rankingLimit: number;
    highlightLimit: number;
    categoryLeaderLimit: number;
    enabledProviders: string[];
  };
  onRefresh: () => void;
  onSelectAccount: (accountId: number) => void;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAccountEditorChange: (patch: Partial<AdminAccountsContentProps["accountEditor"]>) => void;
  onRoleEditorChange: (patch: Partial<AdminAccountsContentProps["roleEditor"]>) => void;
  onCloseDetailPane: () => void;
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
  detailPaneOpen,
  settingsDraft,
  onRefresh,
  onSelectAccount,
  onSearchQueryChange,
  onStatusFilterChange,
  onAccountEditorChange,
  onRoleEditorChange,
  onCloseDetailPane,
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
  const showDetailPane = showAccountActionsPanel || showRolePanel;
  const showDirectoryControls = route !== "/admin/accounts/new";
  const detailPaneTitle = selectedAccount
    ? `${resolveAccountUsernameLabel(selectedAccount.username, accountMessages)} #${selectedAccount.id}`
    : showAccountActionsPanel
      ? accountMessages.actionsTitle
      : accountMessages.roleAssignmentTitle;
  const detailPaneDescription = showAccountActionsPanel
    ? accountMessages.actionsDescription
    : accountMessages.roleAssignmentDescription;

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
          {showDetailPane && detailPaneOpen && selectedAccount ? (
            <AdminDetailDrawer
              open
              title={detailPaneTitle}
              description={detailPaneDescription}
              closeLabel={accountMessages.closePanelAction}
              onClose={onCloseDetailPane}
              dataTestId="admin-accounts-work-pane"
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
            </AdminDetailDrawer>
          ) : null}
          {showRolePanel ? (
            route === "/admin/roles/new" ? <RolePlaybookPanel /> : null
          ) : null}
          <RoleSummaryPanel roleSummary={roleSummary} />
        </div>
      </div>
    </AdminPageScaffold>
  );
}
