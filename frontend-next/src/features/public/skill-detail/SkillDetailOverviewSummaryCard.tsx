import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { SkillDetailPreviewStage } from "./SkillDetailPreviewStage";
import { shouldRenderSkillDetailSummary } from "./skillDetailSummaryVisibility";
import type { SkillDetailOverviewModel } from "./skillDetailWorkbenchOverview";

interface SkillDetailOverviewSummaryCardProps {
  messages: Pick<
    PublicMarketplaceMessages,
    "skillDetailContentTitle" | "skillDetailOverviewDescription" | "skillDetailOverviewTitle" | "skillDetailUpdatedBadgePrefix"
  >;
  overviewModel: SkillDetailOverviewModel;
  overviewFacts: PublicSkillDetailModel["overviewFacts"];
  previewBadge?: string;
}

export function SkillDetailOverviewSummaryCard({
  messages,
  overviewFacts,
  overviewModel,
  previewBadge
}: SkillDetailOverviewSummaryCardProps) {
  const summary = overviewModel.summary || messages.skillDetailOverviewDescription;
  const shouldRenderSummary = shouldRenderSkillDetailSummary(summary, overviewModel.previewContent);

  return (
    <>
      <section className="skill-detail-preview-panel skill-detail-overview-card" aria-label={messages.skillDetailOverviewTitle}>
        <div className="skill-detail-overview-summary">
          {shouldRenderSummary ? <p className="skill-detail-panel-copy">{summary}</p> : null}

          {overviewFacts.length > 0 ? (
            <div className="skill-detail-overview-inline-facts">
              {overviewFacts.map((fact) => (
                <div key={`${fact.label}-${fact.value}-summary`} className="skill-detail-overview-inline-fact">
                  <span className="skill-detail-overview-inline-fact-label">{fact.label}</span>
                  <span className="skill-detail-overview-inline-fact-value">{fact.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="skill-detail-overview-document-card"
        aria-label={overviewModel.previewTitle || messages.skillDetailContentTitle}
      >
        <SkillDetailPreviewStage
          badge={previewBadge}
          className="skill-detail-overview-document-stage"
          meta={overviewModel.previewLanguage}
          title={overviewModel.previewTitle || messages.skillDetailContentTitle}
        >
          <pre className="skill-detail-preview-content">{overviewModel.previewContent}</pre>
        </SkillDetailPreviewStage>
      </section>
    </>
  );
}
