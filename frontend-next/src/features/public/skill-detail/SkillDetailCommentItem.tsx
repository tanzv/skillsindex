import { Button } from "@/src/components/ui/button";

import type { SkillDetailCommentItemProps } from "./skillDetailSidebarTypes";

function formatCommentDate(createdAt: string, locale: SkillDetailCommentItemProps["locale"]) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(createdAt));
}

export function SkillDetailCommentItem({
  busy,
  comment,
  deleteActionLabel,
  locale,
  onCommentDelete
}: SkillDetailCommentItemProps) {
  return (
    <div className="skill-detail-comment-item">
      <div className="skill-detail-comment-head">
        <div>
          <div className="skill-detail-comment-author">{comment.display_name || comment.username}</div>
          <div className="skill-detail-comment-date">{formatCommentDate(comment.created_at, locale)}</div>
        </div>
        {comment.can_delete ? (
          <Button
            type="button"
            variant="ghost"
            className="skill-detail-comment-delete"
            onClick={() => onCommentDelete(comment.id)}
            disabled={busy}
          >
            {deleteActionLabel}
          </Button>
        ) : null}
      </div>
      <p className="skill-detail-comment-content">{comment.content}</p>
    </div>
  );
}
