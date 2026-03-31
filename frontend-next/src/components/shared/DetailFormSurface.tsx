"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Sheet, SheetContent } from "@/src/components/ui/sheet";
import { MOTION_EXIT_DURATION_MS } from "@/src/lib/motion/contracts";
import { usePresenceMotion } from "@/src/lib/motion/usePresenceMotion";
import { useReducedMotion } from "@/src/lib/motion/useReducedMotion";
import { cn } from "@/src/lib/utils";

import styles from "./DetailFormSurface.module.scss";

const DETAIL_DRAWER_MOBILE_MEDIA_QUERY = "(max-width: 768px)";

function useCompactDetailDrawerViewport() {
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(DETAIL_DRAWER_MOBILE_MEDIA_QUERY);
    const animationFrameId = window.requestAnimationFrame(() => {
      setIsCompactViewport(mediaQueryList.matches);
    });

    const handleChange = (event: MediaQueryListEvent) => {
      setIsCompactViewport(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, []);

  return isCompactViewport;
}

function resolveFirstFocusableElement(container: HTMLElement | null) {
  if (!container) {
    return null;
  }

  return container.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

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
  dataTestId?: string;
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
  bodyClassName,
  dataTestId
}: DetailFormSurfaceProps) {
  const titleId = useId();
  const descriptionId = useId();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isCompactViewport = useCompactDetailDrawerViewport();
  const { isPresent, motionState } = usePresenceMotion({
    open,
    reducedMotion,
    exitDurationMs: MOTION_EXIT_DURATION_MS
  });
  const drawerSide = isCompactViewport ? "bottom" : "right";

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
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-variant={variant}
      data-size={size}
      data-sheet-side={variant === "drawer" ? drawerSide : undefined}
      data-motion-state={motionState}
      data-testid={dataTestId}
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

      <div ref={bodyRef} className={cn(styles.body, bodyClassName)}>
        {children}
      </div>

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
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          data-variant={variant}
          data-size={size}
          data-motion-state={motionState}
        onPointerDownOutside={(event) => {
          if (!closeOnBackdrop) {
            event.preventDefault();
          }
        }}
        onOpenAutoFocus={(event) => {
          const nextFocusTarget = initialFocusRef?.current ?? resolveFirstFocusableElement(bodyRef.current);
          if (!nextFocusTarget) {
            return;
          }

          event.preventDefault();
          nextFocusTarget.focus();
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
        side={drawerSide}
        hideClose
        overlayClassName={overlayClassName}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        data-variant={variant}
        data-size={size}
        data-motion-state={motionState}
        onPointerDownOutside={(event) => {
          if (!closeOnBackdrop) {
            event.preventDefault();
          }
        }}
        onOpenAutoFocus={(event) => {
          const nextFocusTarget = initialFocusRef?.current ?? resolveFirstFocusableElement(bodyRef.current);
          if (!nextFocusTarget) {
            return;
          }

          event.preventDefault();
          nextFocusTarget.focus();
        }}
      >
        {panelContent}
      </SheetContent>
    </Sheet>
  );
}
