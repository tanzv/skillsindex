import type { ReactNode } from "react";

interface SkillDetailPreviewStageProps {
  actions?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  emptyState?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
}

export function SkillDetailPreviewStage({
  actions,
  badge,
  children,
  className,
  emptyState,
  meta,
  title
}: SkillDetailPreviewStageProps) {
  return (
    <section className={`skill-detail-preview-stage${className ? ` ${className}` : ""}`}>
      <header className="skill-detail-preview-stage-head">
        <div className="skill-detail-preview-stage-copy">
          <div className="skill-detail-preview-stage-title">{title}</div>
          {meta ? <div className="skill-detail-preview-stage-meta">{meta}</div> : null}
        </div>

        <div className="skill-detail-preview-stage-actions">
          {badge ? <span className="skill-detail-preview-stage-badge">{badge}</span> : null}
          {actions}
        </div>
      </header>

      <div className="skill-detail-preview-stage-body">{emptyState || children}</div>
    </section>
  );
}
