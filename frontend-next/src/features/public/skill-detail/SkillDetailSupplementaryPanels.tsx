import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { formatPublicDate, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";

interface SkillDetailContentSectionProps {
  content: string;
  messages: Pick<PublicMarketplaceMessages, "skillDetailContentTitle" | "skillDetailNotAvailable">;
}

export function SkillDetailContentSection({ content, messages }: SkillDetailContentSectionProps) {
  return (
    <section className="marketplace-section-card skill-detail-secondary-stage">
      <div className="marketplace-section-header">
        <h3>{messages.skillDetailContentTitle}</h3>
      </div>
      <div className="skill-detail-content-panel is-secondary">
        <pre className="skill-detail-content-preview">{content || messages.skillDetailNotAvailable}</pre>
      </div>
    </section>
  );
}

interface SkillDetailCommentsSectionProps {
  busy: boolean;
  comments: PublicSkillDetailResponse["comments"];
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    "skillDetailCommentDelete" | "skillDetailMetricsComments" | "skillDetailNoComments"
  >;
  onCommentDelete: (commentId: number) => void;
}

export function SkillDetailCommentsSection({
  busy,
  comments,
  locale,
  messages,
  onCommentDelete
}: SkillDetailCommentsSectionProps) {
  return (
    <section className="marketplace-section-card skill-detail-secondary-stage">
      <div className="marketplace-section-header">
        <h3>{messages.skillDetailMetricsComments}</h3>
        {comments.length === 0 ? <p>{messages.skillDetailNoComments}</p> : null}
      </div>

      <div className="skill-detail-comment-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="skill-detail-comment-item">
              <div className="skill-detail-comment-head">
                <div>
                  <div className="skill-detail-comment-author">{comment.display_name || comment.username}</div>
                  <div className="skill-detail-comment-date">{formatPublicDate(comment.created_at, locale)}</div>
                </div>
                {comment.can_delete ? (
                  <button
                    type="button"
                    className="skill-detail-comment-delete"
                    onClick={() => onCommentDelete(comment.id)}
                    disabled={busy}
                  >
                    {messages.skillDetailCommentDelete}
                  </button>
                ) : null}
              </div>
              <p className="skill-detail-comment-content">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="skill-detail-empty-state">{messages.skillDetailNoComments}</p>
        )}
      </div>
    </section>
  );
}
