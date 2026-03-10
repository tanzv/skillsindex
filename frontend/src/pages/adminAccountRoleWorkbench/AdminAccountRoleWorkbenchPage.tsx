import AdminAccountEditorModal from "./AdminAccountEditorModal";
import AdminAccountRoleWorkbenchTable from "./AdminAccountRoleWorkbenchTable";
import { AccountConfigurationPanel, RoleAssignmentPanel } from "./AdminAccountRoleWorkbenchPanels";
import type { AdminAccountRoleWorkbenchMode } from "./AdminAccountRoleWorkbenchPage.types";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";
import { accountStatusFilters, modeTitle } from "./adminAccountRoleWorkbench.config";
import { useAdminAccountRoleWorkbenchController } from "./useAdminAccountRoleWorkbenchController";
import { normalizeAccountStatus } from "./AdminAccountRoleWorkbenchPage.helpers";

export type { AdminAccountRoleWorkbenchMode } from "./AdminAccountRoleWorkbenchPage.types";

interface AdminAccountRoleWorkbenchPageProps {
  mode: AdminAccountRoleWorkbenchMode;
}

export default function AdminAccountRoleWorkbenchPage({ mode }: AdminAccountRoleWorkbenchPageProps) {
  const controller = useAdminAccountRoleWorkbenchController(mode);

  const roleAssignmentPanel = (
    <RoleAssignmentPanel
      heading={controller.isRoleConfigurationMode ? "Role Configuration Form" : "Role Assignment"}
      roleAssignmentUserID={controller.roleAssignmentUserID}
      roleAssignmentRole={controller.roleAssignmentRole}
      roleOptions={controller.roleOptions}
      roleAssignmentSubmitting={controller.roleAssignmentSubmitting}
      roleAssignmentError={controller.roleAssignmentError}
      roleAssignmentSuccess={controller.roleAssignmentSuccess}
      roleAssignmentPreview={controller.roleAssignmentPreview}
      onRoleAssignmentUserIDChange={controller.setRoleAssignmentUserID}
      onRoleAssignmentRoleChange={controller.setRoleAssignmentRole}
      onSubmit={controller.submitRoleAssignment}
    />
  );

  if (controller.loading) {
    return (
      <div className="page-grid account-workbench">
        <section className="panel panel-hero loading">Loading account and role workbench...</section>
      </div>
    );
  }

  return (
    <div className="page-grid account-workbench">
      <AdminSubpageSummaryPanel
        title={modeTitle[mode]}
        status={
          <div className="account-workbench-status-strip">
            <span className={controller.degraded || controller.dataMode === "prototype" ? "pill muted" : "pill active"}>
              {controller.dataMode === "prototype"
                ? "Prototype dataset"
                : controller.degraded
                  ? "Fallback prototype data"
                  : "Live backend data"}
            </span>
            <span className={controller.data?.registration.allow_registration ? "pill active" : "pill muted"}>
              Registration {controller.data?.registration.allow_registration ? "enabled" : "disabled"}
            </span>
            {controller.data?.authProviders?.auth_providers?.length ? (
              <span className="pill muted">Auth providers: {controller.data.authProviders.auth_providers.join(", ")}</span>
            ) : null}
          </div>
        }
        actions={
          <button type="button" onClick={controller.refresh} className="panel-action-button">
            Refresh
          </button>
        }
        controls={
          controller.isAccountManagementMode ? (
            <div className="account-workbench-filter-panel">
              <div className="account-workbench-filter-row">
                <label className="account-workbench-field">
                  <span className="account-workbench-field-label">Search</span>
                  <input
                    type="search"
                    value={controller.searchQuery}
                    onChange={(event) => controller.setSearchQuery(event.target.value)}
                    placeholder="Search by username, role, or status"
                    className="account-workbench-search-input"
                  />
                </label>
                <div className="account-workbench-field">
                  <span className="account-workbench-field-label">Status</span>
                  <div className="account-workbench-filter-group">
                    {accountStatusFilters.map((filter) => {
                      const selected = controller.statusFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => controller.setStatusFilter(filter.value)}
                          className={`account-workbench-filter-button${selected ? " is-active" : ""}`}
                          aria-pressed={selected}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="account-workbench-filter-summary">
                Showing {controller.filteredAccounts.length} of {controller.loadedAccounts} loaded accounts
                {controller.total !== controller.loadedAccounts ? ` (total directory size: ${controller.total})` : ""}.
              </p>
            </div>
          ) : null
        }
        notice={controller.degraded && controller.error ? `Degraded mode: ${controller.error}` : undefined}
        metrics={[
          { id: "total-accounts", label: "Total Accounts", value: controller.total },
          { id: "loaded-accounts", label: "Loaded Accounts", value: controller.loadedAccounts },
          { id: "active-accounts", label: "Active Accounts", value: controller.activeAccounts },
          { id: "disabled-accounts", label: "Disabled Accounts", value: controller.disabledAccounts },
          { id: "distinct-roles", label: "Distinct Roles", value: controller.roleSummary.length }
        ]}
      />

      <div className="account-workbench-mode-layout">
        <div className="account-workbench-mode-main">
          {controller.isAccountConfigurationMode ? (
            <AccountConfigurationPanel
              allowRegistrationDraft={controller.allowRegistrationDraft}
              availableAuthProviders={controller.availableAuthProviders}
              enabledAuthProvidersDraft={controller.enabledAuthProvidersDraft}
              settingsSubmitting={controller.settingsSubmitting}
              settingsError={controller.settingsError}
              settingsSuccess={controller.settingsSuccess}
              onAllowRegistrationChange={controller.setAllowRegistrationDraft}
              onToggleAuthProvider={controller.toggleAuthProvider}
              onSubmit={controller.submitAccessPolicySettings}
              onReset={controller.resetAccessPolicyDraft}
            />
          ) : null}

          {controller.isRoleConfigurationMode ? roleAssignmentPanel : null}

          <AdminAccountRoleWorkbenchTable
            roleMode={controller.roleMode}
            rows={controller.topRows}
            onEditAccount={controller.openEditor}
            onForceSignout={controller.roleMode ? undefined : controller.handleForceSignout}
            forceSignoutPendingID={controller.forceSignoutPendingID}
          />
          {controller.tableActionError ? <p className="account-workbench-inline-feedback is-error">{controller.tableActionError}</p> : null}
          {controller.tableActionSuccess ? (
            <p className="account-workbench-inline-feedback is-success">{controller.tableActionSuccess}</p>
          ) : null}
        </div>

        {controller.isRoleManagementMode ? <div className="account-workbench-mode-side">{roleAssignmentPanel}</div> : null}
      </div>

      <AdminAccountEditorModal
        open={!controller.roleMode && controller.editorOpen}
        submitting={controller.editorSubmitting}
        errorMessage={controller.editorError}
        account={
          controller.editingAccount
            ? {
                id: controller.editingAccount.id,
                username: controller.editingAccount.username,
                role: controller.editingAccount.role,
                status: normalizeAccountStatus(controller.editingAccount.status)
              }
            : null
        }
        onCancel={controller.closeEditor}
        onSubmit={controller.submitEditor}
      />
    </div>
  );
}
