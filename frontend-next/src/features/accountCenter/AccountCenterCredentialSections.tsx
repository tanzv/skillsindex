"use client";

import { useMemo, useState } from "react";

import { InlineWorkPaneSurface } from "@/src/components/shared/InlineWorkPaneSurface";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveApiKeyStatusLabel, resolveApiKeyStatusTone } from "@/src/lib/apiKeyDisplay";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { AccountAPIKeyItem } from "./model";
import { formatAccountDate, shouldCloseCredentialCreatePaneAfterSubmit } from "./model";
import { joinScopes, type AccountCredentialsSectionProps } from "./AccountCenterSectionProps";

function resolveSelectedCredential(items: AccountAPIKeyItem[], selectedCredentialId: number | null): AccountAPIKeyItem | null {
  if (selectedCredentialId === null) {
    return null;
  }

  return items.find((credential) => credential.id === selectedCredentialId) || null;
}

function CredentialMeta({ credential }: { credential: AccountAPIKeyItem }) {
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
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
  );
}

function CredentialInventoryCard({
  credential,
  onOpenDetail
}: {
  credential: AccountAPIKeyItem;
  onOpenDetail: (credentialId: number) => void;
}) {
  const { messages } = useProtectedI18n();
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
            <CredentialMeta credential={credential} />
          </div>

          <div className="account-center-action-row">
            <button type="button" className="account-center-action" onClick={() => onOpenDetail(credential.id)}>
              {accountMessages.openCredentialDetailAction}
            </button>
          </div>
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
  const credentials = useMemo(() => credentialsPayload?.items || [], [credentialsPayload]);
  const [createPaneOpen, setCreatePaneOpen] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | null>(null);
  const selectedCredential = useMemo(
    () => resolveSelectedCredential(credentials, selectedCredentialId),
    [credentials, selectedCredentialId]
  );
  const activePane = createPaneOpen ? "create" : selectedCredential ? "detail" : null;

  function closeWorkPane() {
    setCreatePaneOpen(false);
    setSelectedCredentialId(null);
  }

  return (
    <div className={`account-center-credentials-layout ${activePane ? "has-work-pane" : ""}`}>
      <div className="account-center-credentials-main">
        <section className="account-center-stage-panel account-center-section-stack">
          <div className="account-center-panel-title-row">
            <h2>{accountMessages.credentialsFactoryTitle}</h2>
            <p className="account-center-panel-description">{accountMessages.credentialsFactoryDescription}</p>
          </div>

          <div className="account-center-action-row">
            <button
              type="button"
              className="account-center-action is-primary"
              onClick={() => {
                setSelectedCredentialId(null);
                setCreatePaneOpen(true);
              }}
              disabled={saving || loading}
            >
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
            {credentials.map((credential) => (
              <CredentialInventoryCard
                key={credential.id}
                credential={credential}
                onOpenDetail={(credentialId) => {
                  setCreatePaneOpen(false);
                  setSelectedCredentialId(credentialId);
                }}
              />
            ))}
          </div>
        </section>
      </div>

      {activePane ? (
        <InlineWorkPaneSurface
          title={createPaneOpen ? accountMessages.credentialsFactoryTitle : selectedCredential?.name || accountMessages.credentialsInventoryTitle}
          description={
            createPaneOpen
              ? accountMessages.credentialsFactoryDescription
              : selectedCredential?.purpose || accountMessages.credentialNoPurpose
          }
          closeLabel={accountMessages.closePanelAction}
          onClose={closeWorkPane}
          dataTestId="account-credentials-work-pane"
          className="account-center-credentials-work-pane"
        >
          {createPaneOpen ? (
            <div className="account-center-section-stack" data-testid="account-credentials-create-pane">
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
                <button
                  type="button"
                  className="account-center-action is-primary"
                  onClick={async () => {
                    const createSucceeded = await onCreateCredential();
                    if (shouldCloseCredentialCreatePaneAfterSubmit(createSucceeded)) {
                      closeWorkPane();
                    }
                  }}
                  disabled={saving || loading}
                >
                  {accountMessages.createCredentialAction}
                </button>
              </div>
            </div>
          ) : selectedCredential ? (
            <div className="account-center-section-stack" data-testid="account-credentials-detail-pane">
              <div className="account-center-panel-title-row">
                <div className="account-center-section-badges">
                  <span
                    className={`account-center-badge ${resolveApiKeyStatusTone(selectedCredential.status) === "soft" ? "is-soft" : ""}`}
                  >
                    {resolveApiKeyStatusLabel(selectedCredential.status, accountMessages)}
                  </span>
                </div>
              </div>

              <CredentialMeta credential={selectedCredential} />

              <input
                className="account-center-field"
                value={joinScopes(credentialScopeDrafts[selectedCredential.id] || selectedCredential.scopes)}
                placeholder={accountMessages.updateScopesPlaceholder}
                disabled={loading || saving}
                onChange={(event) => onCredentialScopeDraftChange(selectedCredential.id, event.target.value)}
              />

              <div className="account-center-action-row">
                <button
                  type="button"
                  className="account-center-action is-primary"
                  onClick={() => onApplyCredentialScopes(selectedCredential.id)}
                  disabled={saving || loading}
                >
                  {accountMessages.applyScopesAction}
                </button>
              </div>

              <div className="account-center-action-row">
                <button
                  type="button"
                  className="account-center-action"
                  onClick={() => onRotateCredential(selectedCredential.id)}
                  disabled={saving || loading}
                >
                  {accountMessages.rotateCredentialAction}
                </button>
                <button
                  type="button"
                  className="account-center-action"
                  onClick={() => onRevokeCredential(selectedCredential.id)}
                  disabled={saving || loading}
                >
                  {accountMessages.revokeCredentialAction}
                </button>
              </div>
            </div>
          ) : null}
        </InlineWorkPaneSurface>
      ) : null}
    </div>
  );
}
