"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Sheet, SheetContent } from "@/src/components/ui/sheet";
import { MOTION_EXIT_DURATION_MS } from "@/src/lib/motion/contracts";
import { usePresenceMotion } from "@/src/lib/motion/usePresenceMotion";
import { useReducedMotion } from "@/src/lib/motion/useReducedMotion";
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
  const reducedMotion = useReducedMotion();
  const { isPresent, motionState } = usePresenceMotion({
    open,
    reducedMotion,
    exitDurationMs: MOTION_EXIT_DURATION_MS
  });

  useEffect(() => {
    if (!isPresent) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPresent]);

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

  if (!isPresent) {
    return null;
  }

  const sharedPanelClassName = cn(
    styles.surface,
    variant === "modal" ? styles.variantModal : styles.variantDrawer,
    size === "narrow" ? styles.sizeNarrow : size === "wide" ? styles.sizeWide : styles.sizeDefault,
    panelClassName
  );

  const panelContent = (
    <div
      ref={panelRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-variant={variant}
      data-size={size}
      data-motion-state={motionState}
      tabIndex={-1}
      className={sharedPanelClassName}
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
  );

  const overlayClassName = cn(styles.backdrop, variant === "modal" ? styles.isModalBackdrop : styles.isDrawerBackdrop);

  if (variant === "modal") {
    return (
      <Dialog open={isPresent} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <DialogContent
          hideClose
          overlayClassName={overlayClassName}
          onPointerDownOutside={(event) => {
            if (!closeOnBackdrop) {
              event.preventDefault();
            }
          }}
        >
          {panelContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isPresent} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        hideClose
        overlayClassName={overlayClassName}
        onPointerDownOutside={(event) => {
          if (!closeOnBackdrop) {
            event.preventDefault();
          }
        }}
      >
        {panelContent}
      </SheetContent>
    </Sheet>
  );
}
