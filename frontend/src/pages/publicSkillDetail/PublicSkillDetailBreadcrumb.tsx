interface PublicSkillDetailBreadcrumbProps {
  rootLabel: string;
  skillLabel: string;
  currentLabel: string;
  onNavigateRoot: () => void;
  onNavigateSkill: () => void;
}

export default function PublicSkillDetailBreadcrumb({
  rootLabel,
  skillLabel,
  currentLabel,
  onNavigateRoot,
  onNavigateSkill
}: PublicSkillDetailBreadcrumbProps) {
  return (
    <nav className="skill-detail-breadcrumb" aria-label="Skill detail breadcrumb">
      <ol className="skill-detail-breadcrumb-list">
        <li className="skill-detail-breadcrumb-node">
          <button
            type="button"
            className="skill-detail-breadcrumb-button"
            data-testid="skill-detail-breadcrumb-marketplace"
            onClick={onNavigateRoot}
            title={rootLabel}
          >
            <span className="skill-detail-breadcrumb-label">{rootLabel}</span>
          </button>
        </li>
        <li className="skill-detail-breadcrumb-separator" aria-hidden="true">
          ›
        </li>
        <li className="skill-detail-breadcrumb-node">
          <button
            type="button"
            className="skill-detail-breadcrumb-button"
            data-testid="skill-detail-breadcrumb-skill"
            onClick={onNavigateSkill}
            title={skillLabel}
          >
            <span className="skill-detail-breadcrumb-label">{skillLabel}</span>
          </button>
        </li>
        <li className="skill-detail-breadcrumb-separator" aria-hidden="true">
          ›
        </li>
        <li className="skill-detail-breadcrumb-node">
          <span
            className="skill-detail-breadcrumb-current"
            data-testid="skill-detail-breadcrumb-file"
            aria-current="page"
            title={currentLabel}
          >
            <span className="skill-detail-breadcrumb-label">{currentLabel}</span>
          </span>
        </li>
      </ol>
    </nav>
  );
}
