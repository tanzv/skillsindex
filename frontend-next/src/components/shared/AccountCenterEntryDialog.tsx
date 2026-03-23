"use client";

import { ArrowRight, Globe2, Languages, LayoutGrid, ShieldCheck, UserCircle2 } from "lucide-react";

import type { AccountCenterMenuEntry } from "./accountCenterMenu.types";
import { DetailFormSurface } from "./DetailFormSurface";
import styles from "./AccountCenterEntryDialog.module.scss";

interface AccountCenterEntryDialogProps {
  closeLabel: string;
  confirmLabel: string;
  entry: AccountCenterMenuEntry | null;
  groupTitle?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function renderEntryIcon(icon: AccountCenterMenuEntry["icon"]) {
  switch (icon) {
    case "profile":
      return <UserCircle2 className={styles.icon} />;
    case "security":
      return <ShieldCheck className={styles.icon} />;
    case "sessions":
      return <Languages className={styles.icon} />;
    case "credentials":
      return <LayoutGrid className={styles.icon} />;
    default:
      return <Globe2 className={styles.icon} />;
  }
}

export function AccountCenterEntryDialog({
  closeLabel,
  confirmLabel,
  entry,
  groupTitle,
  open,
  onClose,
  onConfirm
}: AccountCenterEntryDialogProps) {
  if (!entry) {
    return null;
  }

  const routeLabel = entry.kind === "account" ? "Account surface" : "Admin surface";

  return (
    <DetailFormSurface
      open={open}
      variant="modal"
      size="narrow"
      title={entry.label}
      description={entry.description}
      closeLabel={closeLabel}
      onClose={onClose}
      footer={(
        <div className={styles.footerActions}>
          <button type="button" className={styles.secondaryAction} onClick={onClose}>
            {closeLabel}
          </button>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onConfirm}
          >
            <span>{confirmLabel}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    >
      <div className={styles.stack}>
        <section className={styles.summaryCard}>
          <span className={styles.iconShell} aria-hidden="true">
            {renderEntryIcon(entry.icon)}
          </span>
          <div className={styles.summaryCopy}>
            <p className={styles.eyebrow}>{groupTitle || routeLabel}</p>
            <p className={styles.title}>{entry.label}</p>
            <p className={styles.description}>{entry.description}</p>
          </div>
        </section>

        <section className={styles.pathCard}>
          <p className={styles.pathLabel}>{routeLabel}</p>
          <p className={styles.pathValue}>{entry.href}</p>
        </section>
      </div>
    </DetailFormSurface>
  );
}
