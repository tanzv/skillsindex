import type { ReactNode } from "react";

interface PublicNarrativeStat {
  label: string;
  value: string;
  detail: string;
}

interface PublicNarrativeSection {
  key: string;
  title: string;
  description?: string;
  content: ReactNode;
  emphasis?: boolean;
  testId?: string;
}

interface PublicNarrativeStageProps {
  testId: string;
  eyebrow: string;
  title: string;
  description: string;
  stats: PublicNarrativeStat[];
  mainSections: PublicNarrativeSection[];
  sideSections?: PublicNarrativeSection[];
  beforeSections?: ReactNode;
}

function renderSection(section: PublicNarrativeSection) {
  return (
    <section
      key={section.key}
      className={section.emphasis ? "marketplace-section-card is-emphasis" : "marketplace-section-card"}
      data-testid={section.testId}
    >
      <div className="marketplace-section-header">
        <h3>{section.title}</h3>
        {section.description ? <p>{section.description}</p> : null}
      </div>
      {section.content}
    </section>
  );
}

export function PublicNarrativeStage({
  testId,
  eyebrow,
  title,
  description,
  stats,
  mainSections,
  sideSections = [],
  beforeSections
}: PublicNarrativeStageProps) {
  return (
    <div className="marketplace-main-column marketplace-narrative-stage" data-testid={testId}>
      <section className="marketplace-section-card is-emphasis marketplace-narrative-hero">
        <div className="marketplace-section-header">
          <p className="marketplace-kicker">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="marketplace-stat-grid marketplace-narrative-stat-grid">
          {stats.map((item) => (
            <div key={`${item.label}-${item.value}`} className="marketplace-stat-card">
              <div className="marketplace-stat-card-label">{item.label}</div>
              <div className="marketplace-stat-card-value">{item.value}</div>
              <div className="marketplace-stat-card-detail">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {beforeSections}

      <div className="marketplace-results-layout marketplace-narrative-layout">
        <div className="marketplace-list-stack">{mainSections.map(renderSection)}</div>
        {sideSections.length > 0 ? <aside className="marketplace-side-column">{sideSections.map(renderSection)}</aside> : null}
      </div>
    </div>
  );
}
