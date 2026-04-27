import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

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
    "system-status-page__action",
    variant === "primary" ? "is-primary" : "is-secondary",
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
      <div className="system-status-page__skeleton-rail" aria-hidden="true">
        <span className="system-status-page__skeleton-line" />
        <span className="system-status-page__skeleton-line" />
        <span className="system-status-page__skeleton-line is-short" />
        <div className="system-status-page__skeleton-pulse-row">
          <span className="system-status-page__skeleton-pulse-dot" />
          <span className="system-status-page__skeleton-pulse-dot" />
          <span className="system-status-page__skeleton-pulse-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="system-status-page__telemetry-rail" aria-hidden="true">
      <div className="system-status-page__telemetry-bar" />
      <div className="system-status-page__telemetry-bar" />
      <div className="system-status-page__telemetry-bar is-muted" />
      <div className="system-status-page__telemetry-grid">
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
        "system-status-page",
        layout === "embedded" ? "is-embedded" : "is-fullscreen",
        tone === "warning" && "tone-warning",
        tone === "danger" && "tone-danger",
        tone === "loading" && "tone-loading"
      )}
      data-testid={testId}
    >
      <section className="system-status-page__panel">
        <div className="system-status-page__copy-column">
          <p className="system-status-page__eyebrow">{eyebrow}</p>
          <div className="system-status-page__headline-row">
            {statusCode ? (
              <span className="system-status-page__code" data-testid="system-status-code">
                {statusCode}
              </span>
            ) : null}
            <h1 className="system-status-page__title">{title}</h1>
          </div>
          <p className="system-status-page__description">{description}</p>
          {detail ? <p className="system-status-page__detail">{detail}</p> : null}
          {actions ? <div className="system-status-page__actions">{actions}</div> : null}
        </div>

        <aside className="system-status-page__insight-column">
          <div className="system-status-page__insight-card">
            <span className="system-status-page__insight-label">Recovery Window</span>
            <strong className="system-status-page__insight-value">{tone === "loading" ? "In Progress" : "Ready"}</strong>
            <p className="system-status-page__insight-text">
              {tone === "loading"
                ? "The route shell is still negotiating data and layout slots."
                : "Primary navigation remains available while you recover or redirect."}
            </p>
          </div>
          <div className="system-status-page__telemetry-card">{renderTelemetryRail(tone)}</div>
        </aside>
      </section>
    </div>
  );
}
