import { SkillDetailCommentItem } from "./SkillDetailCommentItem";
import type { SkillDetailCommentsPanelProps } from "./skillDetailSidebarTypes";

export function SkillDetailCommentsPanel({
  busy,
  comments,
  deleteActionLabel,
  emptyLabel,
  locale,
  title,
  onCommentDelete
}: SkillDetailCommentsPanelProps) {
  return (
    <section className="marketplace-section-card skill-detail-side-card" data-testid="skill-detail-comments-panel">
      <div className="marketplace-section-header">
        <h3>{title}</h3>
        {comments.length === 0 ? <p>{emptyLabel}</p> : null}
      </div>

      <div className="skill-detail-comment-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <SkillDetailCommentItem
              key={comment.id}
              busy={busy}
              comment={comment}
              deleteActionLabel={deleteActionLabel}
              locale={locale}
              onCommentDelete={onCommentDelete}
            />
          ))
        ) : (
          <p className="skill-detail-empty-state">{emptyLabel}</p>
        )}
      </div>
    </section>
  );
}
