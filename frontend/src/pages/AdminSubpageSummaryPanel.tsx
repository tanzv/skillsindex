import { ReactNode } from "react";

export interface AdminSubpageSummaryMetric {
  id: string;
  label: string;
  value: ReactNode;
  help?: ReactNode;
}

interface AdminSubpageSummaryPanelProps {
  title?: string;
  status?: ReactNode;
  actions?: ReactNode;
  controls?: ReactNode;
  notice?: ReactNode;
  metrics?: AdminSubpageSummaryMetric[];
  className?: string;
}

function joinClassNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}

export default function AdminSubpageSummaryPanel({
  title,
  status,
  actions,
  controls,
  notice,
  metrics = [],
  className
}: AdminSubpageSummaryPanelProps) {
  return (
    <section className={joinClassNames("panel", "panel-hero", "panel-hero-compact", className)}>
      {title || status || actions ? (
        <div className="panel-hero-toolbar">
          <div className="panel-hero-toolbar-main">
            {title ? <h2 className="panel-hero-title">{title}</h2> : null}
            {status ? <div className="panel-hero-badges">{status}</div> : null}
          </div>
          {actions ? <div className="panel-hero-actions">{actions}</div> : null}
        </div>
      ) : null}

      {controls ? <div className="panel-hero-controls">{controls}</div> : null}
      {notice ? <div className="panel-hero-notice">{notice}</div> : null}

      {metrics.length > 0 ? (
        <div className="metric-row">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.id}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.help ? <p className="panel-hero-metric-help">{metric.help}</p> : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
