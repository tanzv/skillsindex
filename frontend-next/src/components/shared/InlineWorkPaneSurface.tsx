"use client";

import type { ReactNode } from "react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import styles from "./InlineWorkPaneSurface.module.scss";

export interface InlineWorkPaneSurfaceProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
  dataTestId?: string;
  className?: string;
  bodyClassName?: string;
}

export function InlineWorkPaneSurface({
  title,
  description,
  children,
  actions,
  footer,
  closeLabel,
  onClose,
  dataTestId,
  className,
  bodyClassName
}: InlineWorkPaneSurfaceProps) {
  return (
    <section className={cn(styles.pane, className)} data-testid={dataTestId}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        <div className={styles.headerActions}>
          {actions}
          {closeLabel && onClose ? (
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {closeLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <div className={cn(styles.body, bodyClassName)}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
