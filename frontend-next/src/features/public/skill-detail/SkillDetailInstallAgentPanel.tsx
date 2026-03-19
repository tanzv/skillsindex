import Link from "next/link";

import { Button } from "@/src/components/ui/button";

import type { SkillDetailInstallAgentPanelProps } from "./skillDetailSidebarTypes";

export function SkillDetailInstallAgentPanel({
  activeTab,
  ctaLabel,
  hintText,
  onCopyValue,
  promptContent,
  promptTitle,
  sourceActionLabel,
  sourceUrl
}: SkillDetailInstallAgentPanelProps) {
  return (
    <div
      id="skill-detail-install-agent-panel"
      role="tabpanel"
      aria-labelledby="skill-detail-install-agent-trigger"
      className="skill-detail-agent-panel"
      data-active-tab={activeTab}
    >
      <p className="skill-detail-agent-hint">{hintText}</p>

      <div className="skill-detail-agent-prompt-shell">
        <div className="skill-detail-agent-prompt-head">
          <h4>{promptTitle}</h4>
        </div>
        <pre className="skill-detail-agent-prompt-body">{promptContent}</pre>
      </div>

      <div className="skill-detail-link-grid skill-detail-install-action-grid" data-active-tab={activeTab}>
        <Button
          type="button"
          variant={activeTab === "resources" ? "default" : "outline"}
          className={`skill-detail-secondary-action${activeTab === "resources" ? " is-primary-tone" : ""}`}
          onClick={() => onCopyValue(promptContent)}
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
