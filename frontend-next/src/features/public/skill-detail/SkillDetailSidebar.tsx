import { useState, type FormEvent } from "react";

import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import { SkillDetailCommentsPanel } from "./SkillDetailCommentsPanel";
import { SkillDetailInstallCard } from "./SkillDetailInstallCard";
import { SkillDetailInteractionPanel } from "./SkillDetailInteractionPanel";
import { type SkillDetailInstallAudience } from "./skillDetailInstallAudience";
import type { SkillDetailSidebarBaseProps, SkillDetailSidebarMessages } from "./skillDetailSidebarTypes";

interface SkillDetailSidebarProps extends SkillDetailSidebarBaseProps {
  commentDraft: string;
  comments: SkillDetailSidebarBaseProps["detail"]["comments"];
  feedback: string;
  messages: SkillDetailSidebarMessages;
  onCommentDelete: (commentId: number) => void;
  onCommentDraftChange: (value: string) => void;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFavorite: () => void;
  onRate: (score: number) => void;
}

export function SkillDetailSidebar({
  activeTab,
  busy,
  commentDraft,
  comments,
  currentContextLabel,
  detail,
  feedback,
  locale,
  messages,
  model,
  onCommentDelete,
  onCommentDraftChange,
  onCommentSubmit,
  onFavorite,
  onRate
}: SkillDetailSidebarProps) {
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const [installAudience, setInstallAudience] = useState<SkillDetailInstallAudience>("agent");
  const [installFeedback, setInstallFeedback] = useState("");
  const favoriteLabel = detail.viewer_state.favorited
    ? messages.skillDetailActionRemoveFavorite
    : messages.skillDetailActionAddFavorite;
  const showSecondaryPanels = activeTab !== "resources" && activeTab !== "overview";

  async function handleCopyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setInstallFeedback(messages.skillDetailFeedbackCopied);
    } catch {
      setInstallFeedback(messages.skillDetailFeedbackCopyFailed);
    }
  }

  return (
    <aside className="skill-detail-sidebar" data-active-tab={activeTab} data-testid="skill-detail-sidebar">
      <SkillDetailInstallCard
        activeTab={activeTab}
        currentContextLabel={currentContextLabel}
        detail={{ skill: detail.skill }}
        installAudience={installAudience}
        installFeedback={installFeedback}
        installationSteps={model.installationSteps}
        messages={messages}
        onCopyValue={(value) => void handleCopyValue(value)}
        onInstallAudienceChange={setInstallAudience}
      />

      {showSecondaryPanels ? (
        <SkillDetailInteractionPanel
          busy={busy}
          canInteract={detail.viewer_state.can_interact}
          commentDraft={commentDraft}
          favoriteLabel={favoriteLabel}
          feedback={feedback}
          isAuthenticated={isAuthenticated}
          loginTarget={loginTarget}
          messages={messages}
          ratingValue={detail.viewer_state.rating}
          onCommentDraftChange={onCommentDraftChange}
          onCommentSubmit={onCommentSubmit}
          onFavorite={onFavorite}
          onRate={onRate}
          workspaceHref={workspaceOverviewRoute}
        />
      ) : null}

      {showSecondaryPanels ? (
        <SkillDetailCommentsPanel
          busy={busy}
          comments={comments}
          deleteActionLabel={messages.skillDetailCommentDelete}
          emptyLabel={messages.skillDetailNoComments}
          locale={locale}
          title={messages.skillDetailMetricsComments}
          onCommentDelete={onCommentDelete}
        />
      ) : null}
    </aside>
  );
}
