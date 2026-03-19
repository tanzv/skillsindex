"use client";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveApiKeyStatusLabel, resolveApiKeyStatusTone } from "@/src/lib/apiKeyDisplay";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { AccountAPIKeyItem } from "./model";
import { formatAccountDate } from "./model";
import { joinScopes, type AccountCredentialsSectionProps } from "./AccountCenterSectionProps";

function CredentialInventoryCard({
  credential,
  loading,
  saving,
  credentialScopeDrafts,
  onCredentialScopeDraftChange,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: {
  credential: AccountAPIKeyItem;
  loading: boolean;
  saving: boolean;
  credentialScopeDrafts: Record<number, string[]>;
  onCredentialScopeDraftChange: (keyId: number, rawValue: string) => void;
  onRotateCredential: (keyId: number) => void;
  onRevokeCredential: (keyId: number) => void;
  onApplyCredentialScopes: (keyId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
    <div data-testid={`account-credential-card-${credential.id}`} className="account-center-credential-card">
      <div className="account-center-section-stack">
        <div className="account-center-credential-row">
          <div className="account-center-section-stack">
            <div className="account-center-panel-title-row">
              <h3>{credential.name}</h3>
              <div className="account-center-section-badges">
                <span className={`account-center-badge ${resolveApiKeyStatusTone(credential.status) === "soft" ? "is-soft" : ""}`}>
                  {resolveApiKeyStatusLabel(credential.status, accountMessages)}
                </span>
              </div>
            </div>
            <p className="account-center-surface-copy">{credential.purpose || accountMessages.credentialNoPurpose}</p>
            <div className="account-center-credential-meta">
              <span className="account-center-badge">{credential.prefix}</span>
              <span className="account-center-badge">
                {formatProtectedMessage(accountMessages.credentialCreatedTemplate, {
                  value: formatAccountDate(credential.created_at, locale, accountMessages.valueNotAvailable)
                })}
              </span>
              <span className="account-center-badge">
                {formatProtectedMessage(accountMessages.credentialLastUsedTemplate, {
                  value: formatAccountDate(credential.last_used_at, locale, accountMessages.valueNotAvailable)
                })}
              </span>
            </div>
          </div>

          <div className="account-center-action-row">
            <button
              type="button"
              className="account-center-action"
              onClick={() => onRotateCredential(credential.id)}
              disabled={saving || loading}
            >
              {accountMessages.rotateCredentialAction}
            </button>
            <button
              type="button"
              className="account-center-action"
              onClick={() => onRevokeCredential(credential.id)}
              disabled={saving || loading}
            >
              {accountMessages.revokeCredentialAction}
            </button>
          </div>
        </div>

        <input
          className="account-center-field"
          value={joinScopes(credentialScopeDrafts[credential.id] || credential.scopes)}
          placeholder={accountMessages.updateScopesPlaceholder}
          disabled={loading || saving}
          onChange={(event) => onCredentialScopeDraftChange(credential.id, event.target.value)}
        />

        <div className="account-center-action-row">
          <button
            type="button"
            className="account-center-action is-primary"
            onClick={() => onApplyCredentialScopes(credential.id)}
            disabled={saving || loading}
          >
            {accountMessages.applyScopesAction}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AccountCredentialsSection({
  loading,
  saving,
  credentialDraft,
  credentialScopeDrafts,
  credentialsPayload,
  onCredentialDraftChange,
  onCredentialScopeDraftChange,
  onCreateCredential,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: AccountCredentialsSectionProps) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
    <>
      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>{accountMessages.credentialsFactoryTitle}</h2>
          <p className="account-center-panel-description">{accountMessages.credentialsFactoryDescription}</p>
        </div>

        <div className="account-center-form-grid">
          <input
            className="account-center-field"
            value={credentialDraft.name}
            placeholder={accountMessages.credentialNamePlaceholder}
            disabled={loading || saving}
            onChange={(event) => onCredentialDraftChange({ name: event.target.value })}
          />
          <input
            className="account-center-field"
            value={credentialDraft.purpose}
            placeholder={accountMessages.credentialPurposePlaceholder}
            disabled={loading || saving}
            onChange={(event) => onCredentialDraftChange({ purpose: event.target.value })}
          />
          <input
            className="account-center-field"
            type="number"
            value={String(credentialDraft.expiresInDays)}
            placeholder={accountMessages.credentialExpiresInDaysPlaceholder}
            disabled={loading || saving}
            onChange={(event) => onCredentialDraftChange({ expiresInDays: Number(event.target.value || 0) })}
          />
          <input
            className="account-center-field"
            value={joinScopes(credentialDraft.scopes)}
            placeholder={accountMessages.credentialScopesPlaceholder}
            disabled={loading || saving}
            onChange={(event) =>
              onCredentialDraftChange({ scopes: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })
            }
          />
        </div>

        <div className="account-center-action-row">
          <button type="button" className="account-center-action is-primary" onClick={onCreateCredential} disabled={saving || loading}>
            {accountMessages.createCredentialAction}
          </button>
        </div>
      </section>

      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>{accountMessages.credentialsInventoryTitle}</h2>
          <p className="account-center-panel-description">{accountMessages.credentialsInventoryDescription}</p>
        </div>

        <div className="account-center-section-stack">
          {(credentialsPayload?.items || []).map((credential) => (
            <CredentialInventoryCard
              key={credential.id}
              credential={credential}
              loading={loading}
              saving={saving}
              credentialScopeDrafts={credentialScopeDrafts}
              onCredentialScopeDraftChange={onCredentialScopeDraftChange}
              onRotateCredential={onRotateCredential}
              onRevokeCredential={onRevokeCredential}
              onApplyCredentialScopes={onApplyCredentialScopes}
            />
          ))}
        </div>
      </section>
    </>
  );
}
