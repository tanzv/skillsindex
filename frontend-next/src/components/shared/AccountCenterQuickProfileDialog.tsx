"use client";

import { useId } from "react";

import type { AccountProfileDraft } from "@/src/lib/account/accountProfile";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

import { DetailFormSurface } from "./DetailFormSurface";
import styles from "./AccountCenterQuickProfileDialog.module.scss";

interface AccountCenterQuickProfileDialogProps {
  open: boolean;
  closeLabel: string;
  title: string;
  description: string;
  loadingMessage: string;
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
  loadingMessage,
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
  const showLoadingState = loading;

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
          <Button type="button" variant="outline" className={styles.secondaryAction} onClick={onClose} disabled={saving}>
            {cancelLabel}
          </Button>
          <Button type="submit" form={formId} className={styles.primaryAction} disabled={disableFields}>
            {saving ? `${saveLabel}...` : saveLabel}
          </Button>
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
          <Avatar className={styles.avatar} aria-hidden="true">
            <AvatarFallback className={styles.avatar}>{avatarInitials}</AvatarFallback>
          </Avatar>
          <div className={styles.summaryCopy}>
            <p className={styles.eyebrow}>{title}</p>
            <p className={styles.summaryTitle}>{showLoadingState ? title : draft.displayName || displayNamePlaceholder}</p>
            <p className={styles.summaryDescription}>{description}</p>
          </div>
        </section>

        {statusMessage ? <div className={styles.noticeSuccess}>{statusMessage}</div> : null}
        {errorMessage ? <div className={styles.noticeError}>{errorMessage}</div> : null}
        {showLoadingState ? (
          <div className={styles.noticeLoading} role="status" aria-live="polite" aria-busy="true">
            {loadingMessage}
          </div>
        ) : null}

        {showLoadingState ? null : (
          <div className={styles.fields}>
            <div className={styles.field}>
              <Label htmlFor={`${formId}-display-name`} className={styles.fieldLabel}>
                {displayNameLabel}
              </Label>
              <Input
                id={`${formId}-display-name`}
                type="text"
                className={styles.input}
                value={draft.displayName}
                placeholder={displayNamePlaceholder}
                aria-label={displayNameLabel}
                maxLength={64}
                disabled={disableFields}
                onChange={(event) => onDraftChange({ displayName: event.target.value })}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor={`${formId}-avatar-url`} className={styles.fieldLabel}>
                {avatarURLLabel}
              </Label>
              <Input
                id={`${formId}-avatar-url`}
                type="url"
                className={styles.input}
                value={draft.avatarURL}
                placeholder={avatarURLPlaceholder}
                aria-label={avatarURLLabel}
                maxLength={512}
                disabled={disableFields}
                onChange={(event) => onDraftChange({ avatarURL: event.target.value })}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor={`${formId}-bio`} className={styles.fieldLabel}>
                {bioLabel}
              </Label>
              <Textarea
                id={`${formId}-bio`}
                className={styles.textarea}
                value={draft.bio}
                placeholder={bioPlaceholder}
                aria-label={bioLabel}
                maxLength={500}
                rows={5}
                disabled={disableFields}
                onChange={(event) => onDraftChange({ bio: event.target.value })}
              />
            </div>
          </div>
        )}
      </form>
    </DetailFormSurface>
  );
}
