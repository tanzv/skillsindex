import { PublicLink } from "@/src/components/shared/PublicLink";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { formatPublicDate, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { SkillDetailPreviewStage } from "./SkillDetailPreviewStage";
import type { SkillDetailOverviewModel } from "./skillDetailWorkbenchOverview";

interface SkillDetailOverviewPanelProps {
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "rankingOpenSkillLabel"
    | "skillDetailContentTitle"
    | "skillDetailMetricsComments"
    | "skillDetailMetricsRatings"
    | "skillDetailNoComments"
    | "skillDetailOverviewDescription"
    | "skillDetailOverviewMetricsTitle"
    | "skillDetailOverviewTitle"
    | "skillDetailRelatedDescription"
    | "skillDetailRelatedTitle"
    | "skillDetailUpdatedBadgePrefix"
  >;
  model: PublicSkillDetailModel;
  overviewModel: SkillDetailOverviewModel;
}

function buildCommentMonogram(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "SI";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function formatCommentDate(value: string, locale: PublicLocale): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function normalizeRatingAverage(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value > 5 ? value / 2 : value;
}

function normalizeComparableText(value: string): string {
  return String(value || "")
    .replace(/\r/g, "\n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function RatingStar({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`skill-detail-overview-star${filled ? " is-filled" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.3l1.93 3.91 4.32.63-3.12 3.04.74 4.29L8 11.14 4.13 13.17l.74-4.29L1.75 5.84l4.32-.63L8 1.3Z"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="currentColor"
      />
    </svg>
  );
}

function RatingStars({ value }: { value: number }) {
  const roundedValue = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span className="skill-detail-overview-star-row" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <RatingStar key={`skill-detail-overview-star-${index + 1}`} filled={index < roundedValue} />
      ))}
    </span>
  );
}

export function SkillDetailOverviewPanel({
  detail,
  locale,
  messages,
  model,
  overviewModel
}: SkillDetailOverviewPanelProps) {
  const latestComments = detail.comments.slice(0, 6);
  const displayRatingAverage = normalizeRatingAverage(detail.stats.rating_average);
  const ratingAverage = displayRatingAverage > 0 ? displayRatingAverage.toFixed(1) : "0.0";
  const summary = overviewModel.summary || messages.skillDetailOverviewDescription;
  const normalizedSummary = normalizeComparableText(summary);
  const normalizedPreviewContent = normalizeComparableText(overviewModel.previewContent);
  const shouldRenderSummary = normalizedSummary.length > 0 && !normalizedPreviewContent.includes(normalizedSummary);
  const metricRows = model.summaryMetrics.filter((metric) => metric.value.trim());
  const reviewMetaLabel = metricRows
    .filter((metric) => metric.label === messages.skillDetailMetricsRatings || metric.label === messages.skillDetailMetricsComments)
    .map((metric) => `${metric.value} ${metric.label}`)
    .join(" · ");

  return (
    <div className="skill-detail-overview-shell">
      <section className="skill-detail-preview-panel skill-detail-overview-card" aria-label={messages.skillDetailOverviewTitle}>
        <div className="skill-detail-overview-summary">
          {shouldRenderSummary ? <p className="skill-detail-panel-copy">{summary}</p> : null}

          {model.overviewFacts.length > 0 ? (
            <div className="skill-detail-overview-inline-facts">
              {model.overviewFacts.map((fact) => (
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
          badge={
            overviewModel.previewUpdatedAt
              ? `${messages.skillDetailUpdatedBadgePrefix} ${formatPublicDate(overviewModel.previewUpdatedAt, locale)}`
              : undefined
          }
          className="skill-detail-overview-document-stage"
          meta={overviewModel.previewLanguage}
          title={overviewModel.previewTitle || messages.skillDetailContentTitle}
        >
          <pre className="skill-detail-preview-content">{overviewModel.previewContent}</pre>
        </SkillDetailPreviewStage>
      </section>

      {model.relatedSkills.length > 0 ? (
        <section className="skill-detail-overview-section skill-detail-overview-related-card" aria-label={messages.skillDetailRelatedTitle}>
          <div className="skill-detail-overview-section-head">
            <div className="skill-detail-overview-section-copy">
              <h3 className="skill-detail-overview-section-title">{messages.skillDetailRelatedTitle}</h3>
              <p>{messages.skillDetailRelatedDescription}</p>
            </div>
          </div>

          <div className="skill-detail-related-list">
            {model.relatedSkills.map((skill) => (
              <PublicLink key={skill.id} href={`/skills/${skill.id}`} className="skill-detail-related-card">
                <div className="skill-detail-related-head">
                  <strong>{skill.name}</strong>
                  <span>{skill.qualityScore}</span>
                </div>
                <span className="skill-detail-related-meta">{skill.category}</span>
                <span className="skill-detail-related-link">{messages.rankingOpenSkillLabel}</span>
              </PublicLink>
            ))}
          </div>
        </section>
      ) : null}

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
              <RatingStars value={displayRatingAverage} />
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

      <section className="skill-detail-overview-section skill-detail-overview-comments-card" aria-label={messages.skillDetailMetricsComments}>
        <div className="skill-detail-overview-section-head">
          <div className="skill-detail-overview-section-copy">
            <h3 className="skill-detail-overview-section-title">{messages.skillDetailMetricsComments}</h3>
          </div>

          <span className="skill-detail-preview-badge">{detail.stats.comment_count}</span>
        </div>

        {latestComments.length > 0 ? (
          <div className="skill-detail-comment-list skill-detail-overview-comments-list">
            {latestComments.map((comment) => (
              <div key={comment.id} className="skill-detail-comment-item skill-detail-overview-review-item">
                <div className="skill-detail-comment-head">
                  <div className="skill-detail-overview-comment-author-block">
                    <span className="skill-detail-overview-comment-avatar" aria-hidden="true">
                      {buildCommentMonogram(comment.display_name || comment.username)}
                    </span>
                    <div>
                      <div className="skill-detail-comment-author">{comment.display_name || comment.username}</div>
                      <div className="skill-detail-comment-date">{formatCommentDate(comment.created_at, locale)}</div>
                    </div>
                  </div>

                  <div className="skill-detail-overview-comment-meta">
                    <RatingStars value={displayRatingAverage} />
                  </div>
                </div>
                <p className="skill-detail-comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="skill-detail-empty-state">{messages.skillDetailNoComments}</p>
        )}
      </section>
    </div>
  );
}
