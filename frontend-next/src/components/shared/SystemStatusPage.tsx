import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

import styles from "./SystemStatusPage.module.scss";

export type SystemStatusTone = "neutral" | "warning" | "danger" | "loading";
export type SystemStatusLayout = "fullscreen" | "embedded";
export type SystemStatusActionVariant = "primary" | "secondary";

interface SystemStatusPageProps {
  eyebrow: string;
  title: string;
  description: string;
  detail?: string;
  statusCode?: string;
  tone?: SystemStatusTone;
  layout?: SystemStatusLayout;
  actions?: ReactNode;
  testId?: string;
}

interface SystemStatusActionProps {
  children: ReactNode;
  variant?: SystemStatusActionVariant;
  className?: string;
}

interface SystemStatusLinkActionProps extends SystemStatusActionProps {
  href: string;
}

interface SystemStatusButtonActionProps extends SystemStatusActionProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

function buildActionClassName(variant: SystemStatusActionVariant, className?: string): string {
  return cn(
    styles.action,
    variant === "primary" ? styles.actionPrimary : styles.actionSecondary,
    className
  );
}

export function SystemStatusLinkAction({
  href,
  children,
  variant = "secondary",
  className
}: SystemStatusLinkActionProps) {
  return (
    <Link href={href} className={buildActionClassName(variant, className)}>
      {children}
    </Link>
  );
}

export function SystemStatusButtonAction({
  children,
  variant = "secondary",
  className,
  onClick,
  type = "button"
}: SystemStatusButtonActionProps) {
  return (
    <button type={type} className={buildActionClassName(variant, className)} onClick={onClick}>
      {children}
    </button>
  );
}

function renderTelemetryRail(tone: SystemStatusTone): ReactNode {
  if (tone === "loading") {
    return (
      <div className={styles.skeletonRail} aria-hidden="true">
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
        <span className={cn(styles.skeletonLine, styles.skeletonLineShort)} />
        <div className={styles.skeletonPulseRow}>
          <span className={styles.skeletonPulseDot} />
          <span className={styles.skeletonPulseDot} />
          <span className={styles.skeletonPulseDot} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.telemetryRail} aria-hidden="true">
      <div className={styles.telemetryBar} />
      <div className={styles.telemetryBar} />
      <div className={cn(styles.telemetryBar, styles.telemetryBarMuted)} />
      <div className={styles.telemetryGrid}>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function SystemStatusPage({
  eyebrow,
  title,
  description,
  detail,
  statusCode,
  tone = "neutral",
  layout = "fullscreen",
  actions,
  testId = "system-status-page"
}: SystemStatusPageProps) {
  return (
    <div
      className={cn(
        styles.page,
        layout === "embedded" ? styles.pageEmbedded : styles.pageFullscreen,
        tone === "warning" && styles.pageWarning,
        tone === "danger" && styles.pageDanger,
        tone === "loading" && styles.pageLoading
      )}
      data-testid={testId}
    >
      <section className={styles.panel}>
        <div className={styles.copyColumn}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <div className={styles.headlineRow}>
            {statusCode ? (
              <span className={styles.code} data-testid="system-status-code">
                {statusCode}
              </span>
            ) : null}
            <h1 className={styles.title}>{title}</h1>
          </div>
          <p className={styles.description}>{description}</p>
          {detail ? <p className={styles.detail}>{detail}</p> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>

        <aside className={styles.insightColumn}>
          <div className={styles.insightCard}>
            <span className={styles.insightLabel}>Recovery Window</span>
            <strong className={styles.insightValue}>{tone === "loading" ? "In Progress" : "Ready"}</strong>
            <p className={styles.insightText}>
              {tone === "loading"
                ? "The route shell is still negotiating data and layout slots."
                : "Primary navigation remains available while you recover or redirect."}
            </p>
          </div>
          <div className={styles.telemetryCard}>{renderTelemetryRail(tone)}</div>
        </aside>
      </section>
    </div>
  );
}
