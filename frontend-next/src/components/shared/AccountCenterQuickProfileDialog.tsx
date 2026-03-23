"use client";

import { useId } from "react";

import type { AccountProfileDraft } from "@/src/lib/account/accountProfile";

import { DetailFormSurface } from "./DetailFormSurface";
import styles from "./AccountCenterQuickProfileDialog.module.scss";

interface AccountCenterQuickProfileDialogProps {
  open: boolean;
  closeLabel: string;
  title: string;
  description: string;
  displayNameLabel: string;
  avatarURLLabel: string;
  bioLabel: string;
  displayNamePlaceholder: string;
  avatarURLPlaceholder: string;
  bioPlaceholder: string;
  saveLabel: string;
  cancelLabel: string;
  statusMessage: string;
  errorMessage: string;
  loading: boolean;
  saving: boolean;
  avatarInitials: string;
  draft: AccountProfileDraft;
  onDraftChange: (patch: Partial<AccountProfileDraft>) => void;
  onClose: () => void;
  onSave: () => void;
}

export function AccountCenterQuickProfileDialog({
  open,
  closeLabel,
  title,
  description,
  displayNameLabel,
  avatarURLLabel,
  bioLabel,
  displayNamePlaceholder,
  avatarURLPlaceholder,
  bioPlaceholder,
  saveLabel,
  cancelLabel,
  statusMessage,
  errorMessage,
  loading,
  saving,
  avatarInitials,
  draft,
  onDraftChange,
  onClose,
  onSave
}: AccountCenterQuickProfileDialogProps) {
  const formId = useId();
  const disableFields = loading || saving;

  return (
    <DetailFormSurface
      open={open}
      variant="modal"
      size="narrow"
      title={title}
      description={description}
      closeLabel={closeLabel}
      onClose={onClose}
      bodyClassName={styles.body}
      footer={(
        <div className={styles.footerActions}>
          <button type="button" className={styles.secondaryAction} onClick={onClose} disabled={saving}>
            {cancelLabel}
          </button>
          <button type="submit" form={formId} className={styles.primaryAction} disabled={disableFields}>
            {saving ? `${saveLabel}...` : saveLabel}
          </button>
        </div>
      )}
    >
      <form
        id={formId}
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <section className={styles.summaryCard}>
          <span className={styles.avatar} aria-hidden="true">
            {avatarInitials}
          </span>
          <div className={styles.summaryCopy}>
            <p className={styles.eyebrow}>{title}</p>
            <p className={styles.summaryTitle}>{draft.displayName || displayNamePlaceholder}</p>
            <p className={styles.summaryDescription}>{description}</p>
          </div>
        </section>

        {statusMessage ? <div className={styles.noticeSuccess}>{statusMessage}</div> : null}
        {errorMessage ? <div className={styles.noticeError}>{errorMessage}</div> : null}

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{displayNameLabel}</span>
            <input
              type="text"
              className={styles.input}
              value={draft.displayName}
              placeholder={displayNamePlaceholder}
              aria-label={displayNameLabel}
              maxLength={64}
              disabled={disableFields}
              onChange={(event) => onDraftChange({ displayName: event.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{avatarURLLabel}</span>
            <input
              type="url"
              className={styles.input}
              value={draft.avatarURL}
              placeholder={avatarURLPlaceholder}
              aria-label={avatarURLLabel}
              maxLength={512}
              disabled={disableFields}
              onChange={(event) => onDraftChange({ avatarURL: event.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{bioLabel}</span>
            <textarea
              className={styles.textarea}
              value={draft.bio}
              placeholder={bioPlaceholder}
              aria-label={bioLabel}
              maxLength={500}
              rows={5}
              disabled={disableFields}
              onChange={(event) => onDraftChange({ bio: event.target.value })}
            />
          </label>
        </div>
      </form>
    </DetailFormSurface>
  );
}
