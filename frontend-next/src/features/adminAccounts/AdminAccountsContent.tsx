import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";

import {
  type AdminAccountItem,
  type AdminAccountsRoute,
  type AuthProvidersPayload,
  type RegistrationPayload,
  adminAccountRouteMeta,
  buildAccountTableMeta,
  normalizeAccountStatus
} from "./model";

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
  onSettingsDraftChange: (patch: Partial<AdminAccountsContentProps["settingsDraft"]>) => void;
  onToggleProvider: (provider: string) => void;
  onApplyAccountStatus: () => void;
  onForceSignout: (userId: number) => void;
  onResetPassword: () => void;
  onApplyRole: () => void;
  onSaveSettings: () => void;
}

const roleOptions = ["super_admin", "admin", "auditor", "member", "viewer"];

const roleGuidance = [
  {
    role: "super_admin",
    description: "Use only for platform owners who need full access across governance, operations, and security domains."
  },
  {
    role: "admin",
    description: "Primary operator role for catalog, accounts, and daily platform administration."
  },
  {
    role: "auditor",
    description: "Read-oriented access for compliance, evidence review, and historical inspection."
  },
  {
    role: "member",
    description: "Standard signed-in operator without elevated administrative control."
  },
  {
    role: "viewer",
    description: "Minimal visibility role for observers, demos, and non-operational stakeholders."
  }
] as const;

function AccountDirectoryCard({
  account,
  selected,
  route,
  busyAction,
  onSelectAccount,
  onForceSignout
}: {
  account: AdminAccountItem;
  selected: boolean;
  route: AdminAccountsRoute;
  busyAction: string;
  onSelectAccount: (accountId: number) => void;
  onForceSignout: (userId: number) => void;
}) {
  const canForceSignout = route === "/admin/accounts";

  return (
    <div
      data-testid={`admin-account-card-${account.id}`}
      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
        selected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-950">
              {account.username} #{account.id}
            </span>
            <Badge variant={normalizeAccountStatus(account.status) === "active" ? "soft" : "outline"}>{account.status}</Badge>
            <Badge variant="outline">{account.role}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {buildAccountTableMeta(account).map((item) => (
              <span key={`${account.id}-${item}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={selected ? "soft" : "outline"} onClick={() => onSelectAccount(account.id)}>
            {selected ? "Selected" : "Select"}
          </Button>
          {canForceSignout ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onForceSignout(account.id)}
              disabled={Boolean(busyAction)}
            >
              {busyAction === `force-signout-${account.id}` ? "Applying..." : "Force Sign-out"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SelectedAccountSnapshot({ account }: { account: AdminAccountItem | null }) {
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selected Account</CardTitle>
          <CardDescription>Pick a directory entry to anchor the current action panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No account is currently selected.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Account</CardTitle>
        <CardDescription>All status and role actions should be anchored to a visible target account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-slate-950">
              {account.username} #{account.id}
            </span>
            <Badge variant={normalizeAccountStatus(account.status) === "active" ? "soft" : "outline"}>{account.status}</Badge>
            <Badge variant="outline">{account.role}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {buildAccountTableMeta(account).map((item) => (
              <span key={`${account.id}-snapshot-${item}`} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">
                {item}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountActionsPanel({
  accountEditor,
  busyAction,
  selectedAccount,
  onAccountEditorChange,
  onApplyAccountStatus,
  onResetPassword
}: Pick<
  AdminAccountsContentProps,
  "accountEditor" | "busyAction" | "selectedAccount" | "onAccountEditorChange" | "onApplyAccountStatus" | "onResetPassword"
>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>Apply account state changes or rotate a credential for the selected directory entry.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          aria-label="Target user ID"
          value={accountEditor.userId}
          placeholder="User ID"
          onChange={(event) => onAccountEditorChange({ userId: event.target.value })}
        />
        <select
          aria-label="Target account status"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
          value={accountEditor.status}
          onChange={(event) => onAccountEditorChange({ status: event.target.value })}
        >
          <option value="active">active</option>
          <option value="disabled">disabled</option>
        </select>
        <Button onClick={onApplyAccountStatus} disabled={Boolean(busyAction)}>
          {busyAction === "apply-status" ? "Saving..." : "Apply Status"}
        </Button>
        <Input
          aria-label="Target new password"
          value={accountEditor.newPassword}
          placeholder="New password"
          onChange={(event) => onAccountEditorChange({ newPassword: event.target.value })}
        />
        <Button variant="outline" onClick={onResetPassword} disabled={Boolean(busyAction)}>
          {busyAction === "reset-password" ? "Rotating..." : "Reset Password"}
        </Button>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Current target
          <div className="mt-1 font-semibold text-slate-950">
            {selectedAccount ? `${selectedAccount.username} #${selectedAccount.id}` : "No account selected"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleAssignmentPanel({
  roleEditor,
  busyAction,
  selectedAccount,
  onRoleEditorChange,
  onApplyRole
}: Pick<
  AdminAccountsContentProps,
  "roleEditor" | "busyAction" | "selectedAccount" | "onRoleEditorChange" | "onApplyRole"
>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Assignment</CardTitle>
        <CardDescription>Reassign the selected user while keeping the directory and role distribution in view.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          aria-label="Role target user ID"
          value={roleEditor.userId}
          placeholder="User ID"
          onChange={(event) => onRoleEditorChange({ userId: event.target.value })}
        />
        <select
          aria-label="Target role"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
          value={roleEditor.role}
          onChange={(event) => onRoleEditorChange({ role: event.target.value })}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <Button onClick={onApplyRole} disabled={Boolean(busyAction)}>
          {busyAction === "apply-role" ? "Saving..." : "Apply Role"}
        </Button>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Current target
          <div className="mt-1 font-semibold text-slate-950">
            {selectedAccount ? `${selectedAccount.username} #${selectedAccount.id}` : "No account selected"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProvisioningPolicyPanel({
  registration,
  authProviders,
  settingsDraft,
  busyAction,
  onSettingsDraftChange,
  onToggleProvider,
  onSaveSettings
}: Pick<
  AdminAccountsContentProps,
  "registration" | "authProviders" | "settingsDraft" | "busyAction" | "onSettingsDraftChange" | "onToggleProvider" | "onSaveSettings"
>) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Provisioning Policy</CardTitle>
          <CardDescription>Control registration posture and marketplace reach from a dedicated provisioning route.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              aria-label="Allow registration"
              type="checkbox"
              checked={settingsDraft.allowRegistration}
              onChange={(event) => onSettingsDraftChange({ allowRegistration: event.target.checked })}
            />
            Allow registration
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              aria-label="Marketplace public access"
              type="checkbox"
              checked={settingsDraft.marketplacePublicAccess}
              onChange={(event) => onSettingsDraftChange({ marketplacePublicAccess: event.target.checked })}
            />
            Marketplace public access
          </label>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Current backend posture
            <div className="mt-1 font-semibold text-slate-950">
              Registration {registration.allowRegistration ? "enabled" : "disabled"} · Marketplace{" "}
              {registration.marketplacePublicAccess ? "public" : "private"}
            </div>
          </div>
          <Button onClick={onSaveSettings} disabled={Boolean(busyAction)}>
            {busyAction === "save-settings" ? "Saving..." : "Save Policy"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Providers</CardTitle>
          <CardDescription>Keep sign-in providers visible and aligned with the current registration contract.</CardDescription>
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
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Enabled providers
            <div className="mt-1 font-semibold text-slate-950">
              {settingsDraft.enabledProviders.length ? settingsDraft.enabledProviders.join(", ") : "No providers enabled"}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function RolePlaybookPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Playbook</CardTitle>
        <CardDescription>Use the built-in role definitions to keep assignment choices consistent across operators.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roleGuidance.map((item) => (
          <div key={item.role} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-950">{item.role}</span>
              <Badge variant="outline">recommended use</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RoleSummaryPanel({ roleSummary }: Pick<AdminAccountsContentProps, "roleSummary">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Summary</CardTitle>
        <CardDescription>Directory-wide role concentration for quick governance scanning.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roleSummary.map((item) => (
          <div key={item.role} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-700">{item.role}</span>
            <span className="text-sm font-semibold text-slate-950">{item.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
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
  settingsDraft,
  onRefresh,
  onSelectAccount,
  onSearchQueryChange,
  onStatusFilterChange,
  onAccountEditorChange,
  onRoleEditorChange,
  onSettingsDraftChange,
  onToggleProvider,
  onApplyAccountStatus,
  onForceSignout,
  onResetPassword,
  onApplyRole,
  onSaveSettings
}: AdminAccountsContentProps) {
  const meta = adminAccountRouteMeta[route];
  const showRolePanel = route === "/admin/roles" || route === "/admin/roles/new";
  const showSettingsPanel = route === "/admin/accounts/new";
  const showAccountActionsPanel = route === "/admin/accounts";
  const showDirectoryControls = route !== "/admin/accounts/new";

  const directoryTitle = showSettingsPanel
    ? "Recent Account Snapshot"
    : showRolePanel
      ? "Role Assignment Targets"
      : "Account Directory";
  const directoryDescription = showSettingsPanel
    ? "Keep a visible roster beside provisioning policy changes so that access decisions remain grounded in current operator inventory."
    : showRolePanel
      ? "Select a user from the directory before applying a role reassignment or reviewing the role playbook."
      : "Inspect the loaded account roster with state, role, and update recency before taking action.";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title={meta.title}
        description={meta.description}
        actions={<Button onClick={onRefresh}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {error ? <ErrorState description={error} /> : null}
      {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{directoryTitle}</CardTitle>
              <CardDescription>{directoryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showDirectoryControls ? (
                <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                  <Input
                    aria-label="Search accounts"
                    value={searchQuery}
                    placeholder="Search username, role, or status"
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                  />
                  <select
                    aria-label="Account status filter"
                    className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                    value={statusFilter}
                    onChange={(event) => onStatusFilterChange(event.target.value)}
                  >
                    <option value="all">all</option>
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSearchQueryChange("");
                      onStatusFilterChange("all");
                    }}
                  >
                    Clear
                  </Button>
                </div>
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
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    No accounts matched the current filter.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {(showAccountActionsPanel || showRolePanel) ? <SelectedAccountSnapshot account={selectedAccount} /> : null}
          {showAccountActionsPanel ? (
            <AccountActionsPanel
              accountEditor={accountEditor}
              busyAction={busyAction}
              selectedAccount={selectedAccount}
              onAccountEditorChange={onAccountEditorChange}
              onApplyAccountStatus={onApplyAccountStatus}
              onResetPassword={onResetPassword}
            />
          ) : null}
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
            <RoleAssignmentPanel
              roleEditor={roleEditor}
              busyAction={busyAction}
              selectedAccount={selectedAccount}
              onRoleEditorChange={onRoleEditorChange}
              onApplyRole={onApplyRole}
            />
          ) : null}
          {route === "/admin/roles/new" ? <RolePlaybookPanel /> : null}
          <RoleSummaryPanel roleSummary={roleSummary} />
        </div>
      </div>
    </div>
  );
}
