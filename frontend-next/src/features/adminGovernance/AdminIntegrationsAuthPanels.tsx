import { AdminRecordCard, AdminSectionCard } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type {
  ManagedAuthProviderDraft,
  ManagedAuthProviderInventoryItem
} from "./adminAuthProvidersModel";
import { formatDateTime } from "./shared";

function AuthProviderTextField({
  label,
  name,
  value,
  onChange,
  secret = false
}: {
  label: string;
  name: keyof ManagedAuthProviderDraft;
  value: string;
  onChange: (name: keyof ManagedAuthProviderDraft, value: string) => void;
  secret?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-[color:var(--ui-text-secondary)]">
      <span>{label}</span>
      <Input type={secret ? "password" : "text"} value={value} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  );
}

function AuthProviderSelectField({
  label,
  name,
  value,
  options,
  onChange
}: {
  label: string;
  name: keyof ManagedAuthProviderDraft;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (name: keyof ManagedAuthProviderDraft, value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-[color:var(--ui-text-secondary)]">
      <span>{label}</span>
      <Select value={value} onChange={(event) => onChange(name, event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function AuthProviderInventoryPanel({
  items,
  loading,
  error,
  busyProviderKey,
  onReload,
  onOpen,
  onDisable
}: {
  items: ManagedAuthProviderInventoryItem[];
  loading: boolean;
  error: string;
  busyProviderKey: string | null;
  onReload: () => void;
  onOpen: (provider: string) => void;
  onDisable: (provider: string) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  return (
    <AdminSectionCard
      title={integrationMessages.authProviderInventoryTitle}
      description={integrationMessages.authProviderInventoryDescription}
      actions={
        <Button variant="outline" onClick={onReload} disabled={loading}>
          {integrationMessages.reloadAction}
        </Button>
      }
      contentClassName="space-y-3"
    >
      {error ? <div className="text-sm text-[color:var(--ui-danger-text)]">{error}</div> : null}

      {items.map((item) => {
        const busy = busyProviderKey === item.key;

        return (
          <AdminRecordCard key={item.key} data-testid={`admin-auth-provider-${item.key}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.displayName}</span>
                  <Badge variant={item.connected ? "soft" : "outline"}>
                    {item.connected ? integrationMessages.authProviderConnectedLabel : integrationMessages.authProviderDisconnectedLabel}
                  </Badge>
                  <Badge variant={item.enabled ? "soft" : "outline"}>
                    {item.enabled ? integrationMessages.enabledLabel : integrationMessages.disabledLabel}
                  </Badge>
                  <Badge variant={item.available ? "soft" : "outline"}>
                    {item.available ? integrationMessages.authProviderAvailableLabel : integrationMessages.authProviderUnavailableLabel}
                  </Badge>
                </div>
                <p className="text-sm text-[color:var(--ui-text-secondary)]">
                  {item.description || integrationMessages.authProviderInventoryDescription}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-muted)]">
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">{item.key}</span>
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {item.baseUrl || integrationMessages.notAvailable}
                  </span>
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {formatDateTime(item.updatedAt, locale, integrationMessages.notAvailable)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onOpen(item.key)} disabled={busy}>
                  {item.connected ? integrationMessages.authProviderEditAction : integrationMessages.authProviderConfigureAction}
                </Button>
                {(item.connected || item.enabled) && (
                  <Button size="sm" variant="outline" onClick={() => onDisable(item.key)} disabled={busy}>
                    {integrationMessages.authProviderDisableAction}
                  </Button>
                )}
              </div>
            </div>
          </AdminRecordCard>
        );
      })}
    </AdminSectionCard>
  );
}

export function ManagedAuthProviderForm({
  providerDisplayName,
  draft,
  busy,
  onChange,
  onSubmit
}: {
  providerDisplayName: string;
  draft: ManagedAuthProviderDraft | null;
  busy: boolean;
  onChange: (name: keyof ManagedAuthProviderDraft, value: string) => void;
  onSubmit: () => void;
}) {
  const { messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;

  if (!draft) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[color:var(--ui-text-secondary)]">{integrationMessages.authProviderFormDescription}</p>

      <div className="grid gap-3 md:grid-cols-2">
        <AuthProviderTextField
          label={integrationMessages.authProviderFormNameLabel}
          name="name"
          value={draft.name}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormDescriptionLabel}
          name="description"
          value={draft.description}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormIssuerLabel}
          name="issuer"
          value={draft.issuer}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormScopeLabel}
          name="scope"
          value={draft.scope}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormAuthorizationUrlLabel}
          name="authorizationUrl"
          value={draft.authorizationUrl}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormTokenUrlLabel}
          name="tokenUrl"
          value={draft.tokenUrl}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormUserInfoUrlLabel}
          name="userInfoUrl"
          value={draft.userInfoUrl}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClientIdLabel}
          name="clientId"
          value={draft.clientId}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClientSecretLabel}
          name="clientSecret"
          value={draft.clientSecret}
          onChange={onChange}
          secret
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClaimExternalIdLabel}
          name="claimExternalId"
          value={draft.claimExternalId}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClaimUsernameLabel}
          name="claimUsername"
          value={draft.claimUsername}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClaimEmailLabel}
          name="claimEmail"
          value={draft.claimEmail}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClaimEmailVerifiedLabel}
          name="claimEmailVerified"
          value={draft.claimEmailVerified}
          onChange={onChange}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormClaimGroupsLabel}
          name="claimGroups"
          value={draft.claimGroups}
          onChange={onChange}
        />
        <AuthProviderSelectField
          label={integrationMessages.authProviderFormOffboardingModeLabel}
          name="offboardingMode"
          value={draft.offboardingMode}
          onChange={onChange}
          options={[
            { value: "disable_only", label: "disable_only" },
            { value: "disable_and_sign_out", label: "disable_and_sign_out" }
          ]}
        />
        <AuthProviderSelectField
          label={integrationMessages.authProviderFormMappingModeLabel}
          name="mappingMode"
          value={draft.mappingMode}
          onChange={onChange}
          options={[
            { value: "external_email_username", label: "external_email_username" },
            { value: "external_only", label: "external_only" }
          ]}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormDefaultOrgIdLabel}
          name="defaultOrgId"
          value={draft.defaultOrgId}
          onChange={onChange}
        />
        <AuthProviderSelectField
          label={integrationMessages.authProviderFormDefaultOrgRoleLabel}
          name="defaultOrgRole"
          value={draft.defaultOrgRole}
          onChange={onChange}
          options={[
            { value: "member", label: "member" },
            { value: "admin", label: "admin" }
          ]}
        />
        <AuthProviderSelectField
          label={integrationMessages.authProviderFormDefaultUserRoleLabel}
          name="defaultUserRole"
          value={draft.defaultUserRole}
          onChange={onChange}
          options={[
            { value: "member", label: "member" },
            { value: "admin", label: "admin" },
            { value: "viewer", label: "viewer" }
          ]}
        />
        <AuthProviderTextField
          label={integrationMessages.authProviderFormDefaultOrgEmailDomainsLabel}
          name="defaultOrgEmailDomains"
          value={draft.defaultOrgEmailDomains}
          onChange={onChange}
        />
      </div>

      <label className="grid gap-2 text-sm text-[color:var(--ui-text-secondary)]">
        <span>{integrationMessages.authProviderFormDefaultOrgGroupRulesLabel}</span>
        <Textarea value={draft.defaultOrgGroupRules} onChange={(event) => onChange("defaultOrgGroupRules", event.target.value)} />
      </label>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={busy} aria-label={providerDisplayName}>
          {busy ? integrationMessages.authProviderSavingAction : integrationMessages.authProviderSaveAction}
        </Button>
      </div>
    </div>
  );
}
