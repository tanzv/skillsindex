import { useMemo, useState, type Ref } from "react";
import type { MarketplaceSkill, PublicSkillDetailComment, PublicSkillDetailViewerState } from "../../lib/api";
import PublicSkillDetailDirectoryTree from "./PublicSkillDetailDirectoryTree";
import { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import { buildAgentInstallPrompt } from "./PublicSkillDetailPageViewHelpers";

interface PublicSkillDetailInteractionPanelProps {
  activeSkill: MarketplaceSkill | null;
  comments: PublicSkillDetailComment[];
  commentDraft: string;
  detailModel: SkillDetailViewModel;
  feedbackMessage: string;
  interactionBusy: boolean;
  selectedFileName: string;
  text: SkillDetailCopy;
  viewerState: PublicSkillDetailViewerState;
  selectedRating: number;
  commentInputRef: Ref<HTMLTextAreaElement>;
  onCommentDraftChange: (value: string) => void;
  onCopyAgentPrompt: () => void;
  onCopyCommand: () => void;
  onDeleteComment: (commentID: number) => void;
  onOpenSource: () => void;
  onSignIn: () => void;
  onSelectFile: (nextFileIndex: number) => void;
  onSelectRating: (score: number) => void;
  onSubmitComment: () => void;
  onSubmitRating: () => void;
  onToggleFavorite: () => void;
  onViewInstallationDetails: () => void;
  onViewResourceDetails: () => void;
}

type InstallationAudience = "agent" | "human";

function resolveFavoriteLabel(text: SkillDetailCopy, viewerState: PublicSkillDetailViewerState): string {
  return viewerState.favorited ? text.favoriteRemove : text.favoriteAdd;
}

export default function PublicSkillDetailInteractionPanel({
  activeSkill,
  comments,
  commentDraft,
  detailModel,
  feedbackMessage,
  interactionBusy,
  selectedFileName,
  text,
  viewerState,
  selectedRating,
  commentInputRef,
  onCommentDraftChange,
  onCopyAgentPrompt,
  onCopyCommand,
  onDeleteComment,
  onOpenSource,
  onSignIn,
  onSelectFile,
  onSelectRating,
  onSubmitComment,
  onSubmitRating,
  onToggleFavorite,
  onViewInstallationDetails,
  onViewResourceDetails
}: PublicSkillDetailInteractionPanelProps) {
  const favoriteLabel = resolveFavoriteLabel(text, viewerState);
  const ratingValue = selectedRating > 0 ? selectedRating : viewerState.rating;
  const rootLabel = `${detailModel.repositorySlug}/`;
  const [installationAudience, setInstallationAudience] = useState<InstallationAudience>("agent");
  const agentPrompt = useMemo(() => buildAgentInstallPrompt(activeSkill, detailModel), [activeSkill, detailModel]);

  return (
    <aside className="skill-detail-right-col">
      <article className="skill-detail-card is-install skill-detail-side-panel">
        <div className="skill-detail-side-card-head">
          <div className="skill-detail-card-title">
            <span className="skill-detail-title-dot" />
            <span>{text.installFlowTitle}</span>
          </div>
          <button type="button" className="skill-detail-side-link" onClick={onViewInstallationDetails}>
            {text.viewDetails}
          </button>
        </div>

        <div className="skill-detail-side-segment" role="tablist" aria-label={text.installFlowTitle}>
          <button
            type="button"
            className={`skill-detail-side-segment-button${installationAudience === "agent" ? " is-active" : ""}`}
            onClick={() => setInstallationAudience("agent")}
          >
            {text.agentAudience}
          </button>
          <button
            type="button"
            className={`skill-detail-side-segment-button${installationAudience === "human" ? " is-active" : ""}`}
            onClick={() => setInstallationAudience("human")}
          >
            {text.humanAudience}
          </button>
        </div>

        {installationAudience === "agent" ? (
          <div className="skill-detail-agent-panel">
            <p className="skill-detail-agent-hint">{text.sendPromptToAgent}</p>
            <div className="skill-detail-agent-prompt-shell">
              <div className="skill-detail-agent-prompt-head">
                <span>{text.agentPromptTitle}</span>
              </div>
              <pre className="skill-detail-agent-prompt-body">{agentPrompt}</pre>
            </div>
            <div className="skill-detail-action-row">
              <button type="button" className="skill-detail-action-button is-large" onClick={onCopyAgentPrompt}>
                {text.copyPrompt}
              </button>
              <button type="button" className="skill-detail-action-button is-large" onClick={onOpenSource}>
                {text.openOriginal}
              </button>
            </div>
          </div>
        ) : (
          <div className="skill-detail-human-panel">
            <div className="skill-detail-install-steps">
              {detailModel.installSteps.map((step) => (
                <div className="skill-detail-install-step" key={step}>
                  {step}
                </div>
              ))}
            </div>
            <div className="skill-detail-action-row">
              <button type="button" className="skill-detail-action-button is-large" onClick={onCopyCommand}>
                {text.copyCommand}
              </button>
              <button type="button" className="skill-detail-action-button is-large" onClick={onOpenSource}>
                {text.openOriginal}
              </button>
            </div>
          </div>
        )}
      </article>

      <article className="skill-detail-card is-file-control skill-detail-side-panel">
        <div className="skill-detail-side-card-head">
          <div className="skill-detail-card-title">
            <span className="skill-detail-title-dot" />
            <span>{text.fileTreeTitle}</span>
          </div>
          <button type="button" className="skill-detail-side-link" onClick={onViewResourceDetails}>
            {text.detailsAction}
          </button>
        </div>
        <PublicSkillDetailDirectoryTree
          fileEntries={detailModel.fileEntries}
          rootLabel={rootLabel}
          selectedFilePath={selectedFileName}
          title={text.fileTreeTitle}
          hideHeader
          onSelectFile={onSelectFile}
        />
      </article>

      <article className="skill-detail-card is-action skill-detail-side-panel">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.actionCenter}</span>
        </div>

        {viewerState.can_interact ? (
          <button type="button" className="skill-detail-action-main" onClick={onToggleFavorite} disabled={interactionBusy}>
            {favoriteLabel}
          </button>
        ) : null}

        {!viewerState.can_interact ? (
          <div className="skill-detail-auth-cta">
            <p className="skill-detail-auth-hint">{text.signInToInteract}</p>
            <button type="button" className="skill-detail-action-button is-large" onClick={onSignIn}>
              {text.signIn}
            </button>
          </div>
        ) : (
          <div className="skill-detail-action-feedback-panel">
            <div className="skill-detail-rating-row">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  className={`skill-detail-rating-button${ratingValue === score ? " is-active" : ""}`}
                  onClick={() => onSelectRating(score)}
                  disabled={interactionBusy}
                >
                  {score}
                </button>
              ))}
              <button
                type="button"
                className="skill-detail-action-button is-small"
                onClick={onSubmitRating}
                disabled={interactionBusy || ratingValue === 0}
              >
                {text.submitRating}
              </button>
            </div>

            <div className="skill-detail-comment-editor">
              <textarea
                ref={commentInputRef}
                className="skill-detail-comment-input"
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(event.target.value)}
                maxLength={3000}
                placeholder={text.commentPlaceholder}
                disabled={interactionBusy}
              />
              <button
                type="button"
                className="skill-detail-action-button is-large"
                onClick={onSubmitComment}
                disabled={interactionBusy}
              >
                {text.postComment}
              </button>
            </div>
          </div>
        )}

        {feedbackMessage ? <p className="skill-detail-feedback">{feedbackMessage}</p> : null}
      </article>

      <article className="skill-detail-card is-comments skill-detail-side-panel">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.recentComments}</span>
        </div>
        {comments.length === 0 ? <p className="skill-detail-comments-empty">{text.commentsEmpty}</p> : null}
        {comments.map((comment) => (
          <div className="skill-detail-comment-item" key={comment.id}>
            <p className="skill-detail-comment-meta">
              <span>{comment.display_name || comment.username || `User#${comment.user_id}`}</span>
              <span>{new Date(comment.created_at).toLocaleString()}</span>
            </p>
            <p className="skill-detail-comment-content">{comment.content}</p>
            {comment.can_delete ? (
              <button type="button" className="skill-detail-comment-delete" onClick={() => onDeleteComment(comment.id)} disabled={interactionBusy}>
                {text.deleteComment}
              </button>
            ) : null}
          </div>
        ))}
      </article>
    </aside>
  );
}
