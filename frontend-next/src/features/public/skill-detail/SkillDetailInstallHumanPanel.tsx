import Link from "next/link";

import { Button } from "@/src/components/ui/button";

import type { SkillDetailInstallHumanPanelProps } from "./skillDetailSidebarTypes";

export function SkillDetailInstallHumanPanel({
  activeTab,
  commandLabel,
  ctaLabel,
  metadataRows,
  onCopyValue,
  sourceActionLabel,
  sourceUrl,
  title
}: SkillDetailInstallHumanPanelProps) {
  return (
    <div
      id="skill-detail-install-human-panel"
      role="tabpanel"
      aria-labelledby="skill-detail-install-human-trigger"
      className="skill-detail-human-panel"
      data-active-tab={activeTab}
    >
      <div className="skill-detail-content-panel skill-detail-install-command-panel">
        <div className="skill-detail-content-head">
          <h3>{title}</h3>
        </div>
        <pre className="skill-detail-content-preview">{commandLabel}</pre>
      </div>

      {metadataRows.length > 0 ? (
        <div className="skill-detail-install-list">
          {metadataRows.map((item) => (
            <div key={`${item.label}-${item.value}`} className="skill-detail-install-row">
              <div className="skill-detail-install-row-copy">
                <span className="skill-detail-install-label">{item.label}</span>
                {item.description ? <p className="skill-detail-install-help">{item.description}</p> : null}
              </div>
              <span className="skill-detail-install-value">{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="skill-detail-link-grid skill-detail-install-action-grid" data-active-tab={activeTab}>
        <Button
          type="button"
          variant={activeTab === "resources" ? "default" : "outline"}
          className={`skill-detail-secondary-action${activeTab === "resources" ? " is-primary-tone" : ""}`}
          onClick={() => onCopyValue(commandLabel)}
        >
          {ctaLabel}
        </Button>
        {sourceUrl ? (
          <Button asChild variant="outline" className="skill-detail-secondary-action">
            <Link href={sourceUrl} target="_blank" rel="noreferrer">
              {sourceActionLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
