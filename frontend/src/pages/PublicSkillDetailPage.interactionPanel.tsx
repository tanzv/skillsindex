import type { Ref } from "react";
import { PublicSkillDetailComment, PublicSkillDetailViewerState, SkillInteractionStats } from "../lib/api";
import { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import { formatRatingAverage } from "./PublicSkillDetailPage.interaction";

interface PublicSkillDetailInteractionPanelProps {
  comments: PublicSkillDetailComment[];
  commentDraft: string;
  detailModel: SkillDetailViewModel;
  feedbackMessage: string;
  interactionBusy: boolean;
  stats: SkillInteractionStats;
  text: SkillDetailCopy;
  viewerState: PublicSkillDetailViewerState;
  selectedRating: number;
  commentInputRef: Ref<HTMLTextAreaElement>;
  onCommentDraftChange: (value: string) => void;
  onCopyCommand: () => void;
  onDeleteComment: (commentID: number) => void;
  onInstall: () => void;
  onOpenSource: () => void;
  onSignIn: () => void;
  onSelectRating: (score: number) => void;
  onSubmitComment: () => void;
  onSubmitFeedback: () => void;
  onSubmitRating: () => void;
  onToggleFavorite: () => void;
  onViewChangeHistory: () => void;
}

function resolveFavoriteLabel(text: SkillDetailCopy, viewerState: PublicSkillDetailViewerState): string {
  if (!viewerState.can_interact) {
    return text.signInToInteract;
  }
  return viewerState.favorited ? text.favoriteRemove : text.favoriteAdd;
}

function resolveInteractionSummary(stats: SkillInteractionStats): string {
  const ratingAverage = formatRatingAverage(stats.rating_average);
  return `Favorites ${stats.favorite_count} · Rating ${ratingAverage} (${stats.rating_count}) · Comments ${stats.comment_count}`;
}

export default function PublicSkillDetailInteractionPanel({
  comments,
  commentDraft,
  detailModel,
  feedbackMessage,
  interactionBusy,
  stats,
  text,
  viewerState,
  selectedRating,
  commentInputRef,
  onCommentDraftChange,
  onCopyCommand,
  onDeleteComment,
  onInstall,
  onOpenSource,
  onSignIn,
  onSelectRating,
  onSubmitComment,
  onSubmitFeedback,
  onSubmitRating,
  onToggleFavorite,
  onViewChangeHistory
}: PublicSkillDetailInteractionPanelProps) {
  const summaryLabel = resolveInteractionSummary(stats);
  const favoriteLabel = resolveFavoriteLabel(text, viewerState);
  const ratingValue = selectedRating > 0 ? selectedRating : viewerState.rating;
  const auditorInitials = String(detailModel.governanceAuditor || "Platform Admin")
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="skill-detail-right-col">
      <article className="skill-detail-card is-summary">
        <div className="skill-detail-summary-head">
          <div className="skill-detail-summary-title-group">
            <p className="skill-detail-summary-title">{detailModel.titleName}</p>
            <p className="skill-detail-summary-subtitle">{detailModel.breadcrumb}</p>
          </div>
          <div className="skill-detail-summary-badges">
            <span className="skill-detail-chip is-light">{text.officialVerified}</span>
            <span className="skill-detail-chip is-warning">{text.riskFlag}</span>
          </div>
        </div>
        <p className="skill-detail-summary-description">{detailModel.summaryDescription}</p>
        <div className="skill-detail-summary-metrics">
          {detailModel.summaryMetrics.map((metric) => (
            <div className="skill-detail-summary-metric" key={metric.label}>
              <span className="skill-detail-summary-metric-label">{metric.label}</span>
              <span className="skill-detail-summary-metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="skill-detail-card is-quality">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.qualityHealth}</span>
        </div>
        <div className="skill-detail-quality-metrics">
          {detailModel.qualityMetrics.map((metric) => (
            <div className="skill-detail-quality-metric" key={metric.label}>
              <span className="skill-detail-quality-metric-label">{metric.label}</span>
              <span className="skill-detail-quality-metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="skill-detail-card is-metadata">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.metadataTitle}</span>
        </div>

        <div className="skill-detail-metadata-owner">
          <span className="skill-detail-owner-avatar">{auditorInitials || "PA"}</span>
          <div className="skill-detail-owner-main">
            <p className="skill-detail-owner-name">{detailModel.governanceAuditor}</p>
            <p className="skill-detail-owner-repo">{detailModel.repositoryHostPath}</p>
          </div>
        </div>

        <div className="skill-detail-metadata-lines">
          {detailModel.metadataLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="skill-detail-metadata-governance">
          <p>{detailModel.governanceState}</p>
          <p>{detailModel.governanceAuditor}</p>
        </div>
      </article>

      <article className="skill-detail-card is-action">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.actionCenter}</span>
        </div>

        <button type="button" className="skill-detail-action-main" onClick={onToggleFavorite} disabled={!viewerState.can_interact || interactionBusy}>
          {favoriteLabel}
        </button>

        <div className="skill-detail-action-row">
          <button type="button" className="skill-detail-action-button is-large" onClick={onCopyCommand}>
            {text.copyCommand}
          </button>
          <button type="button" className="skill-detail-action-button is-large" onClick={onOpenSource}>
            {text.openOriginal}
          </button>
        </div>

        <div className="skill-detail-action-row">
          <button type="button" className="skill-detail-action-button is-small" onClick={onViewChangeHistory}>
            {text.compareSkill}
          </button>
          <button type="button" className="skill-detail-action-button is-small" onClick={onSubmitFeedback}>
            {text.submitFeedback}
          </button>
        </div>

        <div className="skill-detail-action-tags">
          <span className="skill-detail-pill is-primary-action">{text.installable}</span>
          <span className="skill-detail-pill is-warning">{text.mediumRisk}</span>
          <span className="skill-detail-pill is-success">{text.maintained}</span>
        </div>

        {!viewerState.can_interact ? (
          <div className="skill-detail-auth-cta">
            <p className="skill-detail-auth-hint">{text.signInToInteract}</p>
            <button type="button" className="skill-detail-action-button is-large" onClick={onSignIn}>
              {text.signIn}
            </button>
          </div>
        ) : null}

        <p className="skill-detail-interaction-summary">{summaryLabel}</p>

        <div className="skill-detail-rating-row">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              type="button"
              key={score}
              className={`skill-detail-rating-button${ratingValue === score ? " is-active" : ""}`}
              onClick={() => onSelectRating(score)}
              disabled={!viewerState.can_interact || interactionBusy}
            >
              {score}
            </button>
          ))}
          <button
            type="button"
            className="skill-detail-action-button is-small"
            onClick={onSubmitRating}
            disabled={!viewerState.can_interact || interactionBusy || ratingValue === 0}
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
            disabled={!viewerState.can_interact || interactionBusy}
          />
          <button
            type="button"
            className="skill-detail-action-button is-large"
            onClick={onSubmitComment}
            disabled={!viewerState.can_interact || interactionBusy}
          >
            {text.postComment}
          </button>
        </div>

        {feedbackMessage ? <p className="skill-detail-feedback">{feedbackMessage}</p> : null}
      </article>

      <article className="skill-detail-card is-comments">
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

      <article className="skill-detail-card is-compatibility">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.dependencyTitle}</span>
        </div>

        <div className="skill-detail-compat-row">
          <p className="skill-detail-compat-label">{text.runtimeLabel}</p>
          <p className="skill-detail-compat-value">{detailModel.runtimeValue}</p>
        </div>
        <div className="skill-detail-compat-row">
          <p className="skill-detail-compat-label">{text.testFrameworkLabel}</p>
          <p className="skill-detail-compat-value">{detailModel.frameworkValue}</p>
        </div>
        <div className="skill-detail-compat-row is-short">
          <p className="skill-detail-compat-label">{text.bizVersionLabel}</p>
          <p className="skill-detail-compat-value">{detailModel.bizVersionValue}</p>
        </div>
        <p className="skill-detail-compat-conflict">{text.conflictText}</p>
      </article>

      <button type="button" className="skill-detail-action-main" onClick={onInstall} disabled={interactionBusy}>
        {text.installCurrent}
      </button>
    </aside>
  );
}
