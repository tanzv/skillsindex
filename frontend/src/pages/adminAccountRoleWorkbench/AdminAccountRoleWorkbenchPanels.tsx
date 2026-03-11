import { FormEvent } from "react";

import { normalizeAccountStatus, normalizeRoleName } from "./AdminAccountRoleWorkbenchPage.helpers";

interface AccountConfigurationPanelProps {
  allowRegistrationDraft: boolean;
  marketplacePublicAccessDraft: boolean;
  availableAuthProviders: string[];
  enabledAuthProvidersDraft: string[];
  settingsSubmitting: boolean;
  settingsError: string;
  settingsSuccess: string;
  onAllowRegistrationChange: (enabled: boolean) => void;
  onMarketplacePublicAccessChange: (enabled: boolean) => void;
  onToggleAuthProvider: (provider: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

interface RoleAssignmentPreview {
  username: string;
  role: string;
  status: string;
}

interface RoleAssignmentPanelProps {
  heading: string;
  roleAssignmentUserID: string;
  roleAssignmentRole: string;
  roleOptions: string[];
  roleAssignmentSubmitting: boolean;
  roleAssignmentError: string;
  roleAssignmentSuccess: string;
  roleAssignmentPreview: RoleAssignmentPreview | null;
  onRoleAssignmentUserIDChange: (value: string) => void;
  onRoleAssignmentRoleChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AccountConfigurationPanel({
  allowRegistrationDraft,
  marketplacePublicAccessDraft,
  availableAuthProviders,
  enabledAuthProvidersDraft,
  settingsSubmitting,
  settingsError,
  settingsSuccess,
  onAllowRegistrationChange,
  onMarketplacePublicAccessChange,
  onToggleAuthProvider,
  onSubmit,
  onReset
}: AccountConfigurationPanelProps): JSX.Element {
  return (
    <section className="panel account-workbench-settings-panel">
      <h3>Account Configuration Form</h3>
      <p className="account-workbench-filter-summary">
        Manage registration policy and visible authentication providers for onboarding.
      </p>
      <form onSubmit={onSubmit} className="account-workbench-setting-form" data-testid="account-config-form">
        <div className="account-workbench-setting-grid">
          <label className="account-workbench-toggle-row">
            <input
              type="checkbox"
              checked={allowRegistrationDraft}
              onChange={(event) => onAllowRegistrationChange(event.target.checked)}
            />
            <span>Allow self-registration</span>
          </label>

          <label className="account-workbench-toggle-row">
            <input
              type="checkbox"
              checked={marketplacePublicAccessDraft}
              onChange={(event) => onMarketplacePublicAccessChange(event.target.checked)}
            />
            <span>Allow anonymous marketplace access</span>
          </label>

          <fieldset className="account-workbench-provider-fieldset">
            <legend className="account-workbench-field-label">Enabled Auth Providers</legend>
            <div className="account-workbench-provider-list">
              {availableAuthProviders.map((provider) => {
                const selected = enabledAuthProvidersDraft.includes(provider);
                return (
                  <label key={provider} className={`account-workbench-provider-option${selected ? " is-active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleAuthProvider(provider)}
                      data-testid={`account-provider-toggle-${provider}`}
                    />
                    <span>{provider}</span>
                  </label>
                );
              })}
            </div>
            {availableAuthProviders.length === 0 ? (
              <p className="account-workbench-provider-hint">No provider metadata returned from the backend.</p>
            ) : null}
          </fieldset>
        </div>
        <div className="account-workbench-inline-actions">
          <button
            type="submit"
            className="panel-action-button"
            disabled={settingsSubmitting}
            data-testid="account-config-save-button"
          >
            {settingsSubmitting ? "Saving..." : "Save Settings"}
          </button>
          <button type="button" className="account-workbench-action-button" onClick={onReset} disabled={settingsSubmitting}>
            Reset Draft
          </button>
        </div>
      </form>
      {settingsError ? <p className="account-workbench-inline-feedback is-error">{settingsError}</p> : null}
      {settingsSuccess ? <p className="account-workbench-inline-feedback is-success">{settingsSuccess}</p> : null}
    </section>
  );
}

export function RoleAssignmentPanel({
  heading,
  roleAssignmentUserID,
  roleAssignmentRole,
  roleOptions,
  roleAssignmentSubmitting,
  roleAssignmentError,
  roleAssignmentSuccess,
  roleAssignmentPreview,
  onRoleAssignmentUserIDChange,
  onRoleAssignmentRoleChange,
  onSubmit
}: RoleAssignmentPanelProps): JSX.Element {
  return (
    <section className="panel account-workbench-role-panel" data-testid="role-assignment-panel">
      <h3>{heading}</h3>
      <p className="account-workbench-filter-summary">
        Assign a role to a specific user ID. This updates the role directory endpoint directly.
      </p>
      <form className="account-workbench-role-form" onSubmit={onSubmit} data-testid="role-assignment-form">
        <label className="account-workbench-field">
          <span className="account-workbench-field-label">User ID</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={roleAssignmentUserID}
            onChange={(event) => onRoleAssignmentUserIDChange(event.target.value)}
            placeholder="Enter user ID"
            className="account-workbench-search-input"
          />
        </label>
        <label className="account-workbench-field">
          <span className="account-workbench-field-label">Role</span>
          <select
            value={roleAssignmentRole}
            onChange={(event) => onRoleAssignmentRoleChange(event.target.value)}
            className="account-workbench-select-input"
          >
            {roleOptions.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </label>
        <div className="account-workbench-inline-actions">
          <button
            type="submit"
            className="panel-action-button"
            disabled={roleAssignmentSubmitting}
            data-testid="role-assignment-submit-button"
          >
            {roleAssignmentSubmitting ? "Assigning..." : "Apply Role"}
          </button>
        </div>
      </form>
      {roleAssignmentPreview ? (
        <div className="account-workbench-role-preview">
          <strong>{roleAssignmentPreview.username}</strong>
          <span>
            Current role: {normalizeRoleName(roleAssignmentPreview.role)} | Status:{" "}
            {normalizeAccountStatus(roleAssignmentPreview.status)}
          </span>
        </div>
      ) : null}
      {roleAssignmentError ? <p className="account-workbench-inline-feedback is-error">{roleAssignmentError}</p> : null}
      {roleAssignmentSuccess ? <p className="account-workbench-inline-feedback is-success">{roleAssignmentSuccess}</p> : null}
    </section>
  );
}
