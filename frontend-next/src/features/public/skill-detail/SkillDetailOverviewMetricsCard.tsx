import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { SkillDetailOverviewRatingStars } from "./SkillDetailOverviewRatingStars";

interface SkillDetailOverviewMetricsCardProps {
  displayRatingAverage: number;
  messages: Pick<
    PublicMarketplaceMessages,
    "skillDetailMetricsComments" | "skillDetailMetricsRatings" | "skillDetailOverviewDescription" | "skillDetailOverviewMetricsTitle"
  >;
  ratingAverage: string;
  summaryMetrics: PublicSkillDetailModel["summaryMetrics"];
}

export function SkillDetailOverviewMetricsCard({
  displayRatingAverage,
  messages,
  ratingAverage,
  summaryMetrics
}: SkillDetailOverviewMetricsCardProps) {
  const metricRows = summaryMetrics.filter((metric) => metric.value.trim());
  const reviewMetaLabel = metricRows
    .filter((metric) => metric.label === messages.skillDetailMetricsRatings || metric.label === messages.skillDetailMetricsComments)
    .map((metric) => `${metric.value} ${metric.label}`)
    .join(" · ");

  return (
    <section className="skill-detail-overview-section skill-detail-overview-score-card" aria-label={messages.skillDetailOverviewMetricsTitle}>
      <div className="skill-detail-overview-section-head">
        <div className="skill-detail-overview-section-copy">
          <h3 className="skill-detail-overview-section-title">{messages.skillDetailOverviewMetricsTitle}</h3>
          <p>{messages.skillDetailOverviewDescription}</p>
        </div>
      </div>

      <div className="skill-detail-overview-score-layout">
        <div className="skill-detail-overview-score-main">
          <span className="skill-detail-overview-score-value">{ratingAverage}</span>
          <div className="skill-detail-overview-score-stars">
            <SkillDetailOverviewRatingStars value={displayRatingAverage} />
            {reviewMetaLabel ? <span className="skill-detail-overview-score-meta">{reviewMetaLabel}</span> : null}
          </div>
        </div>

        <div className="skill-detail-overview-score-support-list">
          {metricRows.map((metric) => (
            <div key={`${metric.label}-${metric.value}-support`} className="skill-detail-overview-score-support-row">
              <span className="skill-detail-overview-score-support-label">{metric.label}</span>
              <span className="skill-detail-overview-score-support-value">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
