"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

import { cn } from "@/src/lib/utils";

import styles from "./DetailFormSurface.module.scss";

export interface DetailFormSurfaceProps {
  open: boolean;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  variant?: "drawer" | "modal";
  size?: "narrow" | "default" | "wide";
  closeOnBackdrop?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  panelClassName?: string;
  bodyClassName?: string;
}

export function DetailFormSurface({
  open,
  title,
  description,
  closeLabel,
  onClose,
  children,
  actions,
  footer,
  variant = "drawer",
  size = "default",
  closeOnBackdrop = true,
  initialFocusRef,
  panelClassName,
  bodyClassName
}: DetailFormSurfaceProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextFocusTarget = initialFocusRef?.current ?? panelRef.current;
    nextFocusTarget?.focus();
  }, [initialFocusRef, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(styles.backdrop, variant === "modal" ? styles.isModalBackdrop : styles.isDrawerBackdrop)}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        data-variant={variant}
        data-size={size}
        tabIndex={-1}
        className={cn(
          styles.surface,
          variant === "modal" ? styles.variantModal : styles.variantDrawer,
          size === "narrow" ? styles.sizeNarrow : size === "wide" ? styles.sizeWide : styles.sizeDefault,
          panelClassName
        )}
      >
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          <div className={styles.headerActions}>
            {actions}
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label={closeLabel}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={cn(styles.body, bodyClassName)}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
