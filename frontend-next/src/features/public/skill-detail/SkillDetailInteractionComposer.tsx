import { Button } from "@/src/components/ui/button";
import { PillRadioGroup, PillRadioItem } from "@/src/components/ui/pill-radio-group";
import { Textarea } from "@/src/components/ui/textarea";

import type { SkillDetailInteractionComposerProps } from "./skillDetailSidebarTypes";

export function SkillDetailInteractionComposer({
  busy,
  commentDraft,
  favoriteLabel,
  commentPlaceholder,
  commentSubmitLabel,
  onCommentDraftChange,
  onCommentSubmit,
  onFavorite,
  onRate,
  rateActionLabel,
  ratingValue
}: SkillDetailInteractionComposerProps) {
  return (
    <>
      <Button type="button" className="skill-detail-primary-action" onClick={onFavorite} disabled={busy}>
        {favoriteLabel}
      </Button>

      <PillRadioGroup className="skill-detail-rating-row" aria-label={rateActionLabel}>
        {[1, 2, 3, 4, 5].map((score) => (
          <PillRadioItem
            key={score}
            value={String(score)}
            activeValue={ratingValue > 0 ? String(ratingValue) : undefined}
            className="skill-detail-rating-button"
            onValueChange={() => onRate(score)}
            disabled={busy}
          >
            {rateActionLabel} {score}
          </PillRadioItem>
        ))}
      </PillRadioGroup>

      <form className="skill-detail-comment-form" onSubmit={onCommentSubmit}>
        <Textarea
          className="skill-detail-comment-input"
          value={commentDraft}
          onChange={(event) => onCommentDraftChange(event.target.value)}
          placeholder={commentPlaceholder}
          disabled={busy}
        />
        <Button
          type="submit"
          variant="outline"
          className="skill-detail-secondary-action"
          disabled={busy || !commentDraft.trim()}
        >
          {commentSubmitLabel}
        </Button>
      </form>
    </>
  );
}
