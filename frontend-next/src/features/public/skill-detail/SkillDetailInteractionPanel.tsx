import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { publicRankingsRoute } from "@/src/lib/routing/publicRouteRegistry";

import { SkillDetailInteractionAccessGate } from "./SkillDetailInteractionAccessGate";
import { SkillDetailInteractionComposer } from "./SkillDetailInteractionComposer";
import type { SkillDetailInteractionPanelProps } from "./skillDetailSidebarTypes";

export function SkillDetailInteractionPanel({
  canInteract,
  busy,
  commentDraft,
  favoriteLabel,
  feedback,
  isAuthenticated,
  loginTarget,
  messages,
  ratingValue,
  onCommentDraftChange,
  onCommentSubmit,
  onFavorite,
  onRate,
  workspaceHref
}: SkillDetailInteractionPanelProps) {
  return (
    <section className="marketplace-section-card skill-detail-side-card" data-testid="skill-detail-interaction-panel">
      <div className="marketplace-section-header">
        <h3>{messages.skillDetailInteractionTitle}</h3>
        <p>{messages.skillDetailInteractionDescription}</p>
      </div>

      {feedback ? <div className="skill-detail-feedback">{feedback}</div> : null}

      {canInteract ? (
        <SkillDetailInteractionComposer
          busy={busy}
          commentDraft={commentDraft}
          favoriteLabel={favoriteLabel}
          ratingValue={ratingValue}
          rateActionLabel={messages.skillDetailActionRatePrefix}
          commentPlaceholder={messages.skillDetailCommentPlaceholder}
          commentSubmitLabel={messages.skillDetailCommentSubmit}
          onCommentDraftChange={onCommentDraftChange}
          onCommentSubmit={onCommentSubmit}
          onFavorite={onFavorite}
          onRate={onRate}
        />
      ) : (
        <SkillDetailInteractionAccessGate
          isAuthenticated={isAuthenticated}
          loginTarget={loginTarget}
          signInLabel={messages.shellSignIn}
          workspaceHref={workspaceHref}
          workspaceLabel={messages.shellWorkspace}
        />
      )}

      <div className="skill-detail-link-grid">
        <Button asChild variant="outline" className="skill-detail-secondary-action">
          <Link href={publicRankingsRoute}>{messages.skillDetailOpenRankings}</Link>
        </Button>
      </div>
    </section>
  );
}
