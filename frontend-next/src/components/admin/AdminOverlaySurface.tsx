import type { ReactNode } from "react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { DetailFormSurface, type DetailFormSurfaceProps } from "@/src/components/shared/DetailFormSurface";

import styles from "./AdminOverlaySurface.module.scss";

const ADMIN_DRAWER_TOP_OFFSET = "108px";

interface AdminOverlayBaseProps extends Omit<DetailFormSurfaceProps, "variant"> {
  variant?: "drawer" | "modal";
}

export function AdminOverlaySurface({
  panelClassName,
  bodyClassName,
  footer,
  variant = "drawer",
  ...props
}: AdminOverlayBaseProps) {
  return (
    <DetailFormSurface
      {...props}
      variant={variant}
      viewportTopOffset={variant === "drawer" ? ADMIN_DRAWER_TOP_OFFSET : undefined}
      panelClassName={cn(styles.panel, variant === "modal" ? styles.panelModal : styles.panelDrawer, panelClassName)}
      bodyClassName={cn(styles.body, bodyClassName)}
      footer={footer ? <div className={styles.footer}>{footer}</div> : undefined}
    />
  );
}

export function AdminDetailDrawer(props: Omit<AdminOverlayBaseProps, "variant">) {
  return <AdminOverlaySurface {...props} variant="drawer" />;
}

export function AdminOverlaySection({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(styles.section, className)}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export function AdminOverlayMetaList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className={styles.metaList}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className={styles.metaRow}>
          <dt className={styles.metaLabel}>{item.label}</dt>
          <dd className={styles.metaValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminConfirmModal({
  open,
  title,
  description,
  closeLabel,
  cancelLabel,
  confirmLabel,
  onClose,
  onConfirm,
  busy = false,
  children
}: {
  open: boolean;
  title: string;
  description?: string;
  closeLabel: string;
  cancelLabel: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
  children?: ReactNode;
}) {
  return (
    <AdminOverlaySurface
      open={open}
      variant="modal"
      size="narrow"
      title={title}
      description={description}
      closeLabel={closeLabel}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children ? <div className={styles.confirmBody}>{children}</div> : null}
    </AdminOverlaySurface>
  );
}
