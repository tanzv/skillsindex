import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";

import { SkillDetailOverviewRatingStars } from "./SkillDetailOverviewRatingStars";

const COMMENT_DATE_FORMATTERS = {
  en: new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }),
  zh: new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  })
} as const;

interface SkillDetailOverviewCommentsCardProps {
  commentCount: number;
  comments: PublicSkillDetailResponse["comments"];
  displayRatingAverage: number;
  locale: PublicLocale;
  messages: Pick<PublicMarketplaceMessages, "skillDetailMetricsComments" | "skillDetailNoComments">;
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
  return COMMENT_DATE_FORMATTERS[locale].format(new Date(value));
}

export function SkillDetailOverviewCommentsCard({
  commentCount,
  comments,
  displayRatingAverage,
  locale,
  messages
}: SkillDetailOverviewCommentsCardProps) {
  if (comments.length === 0) {
    return (
      <section className="skill-detail-overview-section skill-detail-overview-comments-card" aria-label={messages.skillDetailMetricsComments}>
        <div className="skill-detail-overview-section-head">
          <div className="skill-detail-overview-section-copy">
            <h3 className="skill-detail-overview-section-title">{messages.skillDetailMetricsComments}</h3>
          </div>

          <span className="skill-detail-preview-badge">{commentCount}</span>
        </div>

        <p className="skill-detail-empty-state">{messages.skillDetailNoComments}</p>
      </section>
    );
  }

  return (
    <section className="skill-detail-overview-section skill-detail-overview-comments-card" aria-label={messages.skillDetailMetricsComments}>
      <div className="skill-detail-overview-section-head">
        <div className="skill-detail-overview-section-copy">
          <h3 className="skill-detail-overview-section-title">{messages.skillDetailMetricsComments}</h3>
        </div>

        <span className="skill-detail-preview-badge">{commentCount}</span>
      </div>

      <div className="skill-detail-comment-list skill-detail-overview-comments-list">
        {comments.map((comment) => (
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
                <SkillDetailOverviewRatingStars value={displayRatingAverage} />
              </div>
            </div>
            <p className="skill-detail-comment-content">{comment.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
