import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { buildSkillDetailInstallPrompt } from "./skillDetailInstallPrompt";

type SkillDetailInstallAudience = "agent" | "human";

interface SkillDetailSidebarProps {
  busy: boolean;
  commentDraft: string;
  comments: PublicSkillDetailResponse["comments"];
  detail: PublicSkillDetailResponse;
  feedback: string;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "shellSignIn"
    | "shellWorkspace"
    | "skillDetailActionAddFavorite"
    | "skillDetailActionCopyCommand"
    | "skillDetailActionCopyPrompt"
    | "skillDetailActionRatePrefix"
    | "skillDetailActionRemoveFavorite"
    | "skillDetailCommentDelete"
    | "skillDetailCommentPlaceholder"
    | "skillDetailCommentSubmit"
    | "skillDetailFeedbackCopyFailed"
    | "skillDetailFeedbackCopied"
    | "skillDetailInstallAgentHint"
    | "skillDetailInstallAgentPromptTitle"
    | "skillDetailInstallAudienceAgent"
    | "skillDetailInstallAudienceHuman"
    | "skillDetailInstallDescription"
    | "skillDetailInstallTitle"
    | "skillDetailInteractionDescription"
    | "skillDetailInteractionTitle"
    | "skillDetailMetricsComments"
    | "skillDetailNoComments"
    | "skillDetailOpenRankings"
    | "skillDetailOpenSource"
  >;
  model: PublicSkillDetailModel;
  onCommentDelete: (commentId: number) => void;
  onCommentDraftChange: (value: string) => void;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFavorite: () => void;
  onRate: (score: number) => void;
  toPublicPath: (route: string) => string;
}

export function SkillDetailSidebar({
  busy,
  commentDraft,
  comments,
  detail,
  feedback,
  locale,
  messages,
  model,
  onCommentDelete,
  onCommentDraftChange,
  onCommentSubmit,
  onFavorite,
  onRate,
  toPublicPath
}: SkillDetailSidebarProps) {
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const [installAudience, setInstallAudience] = useState<SkillDetailInstallAudience>("agent");
  const [installFeedback, setInstallFeedback] = useState("");
  const favoriteLabel = detail.viewer_state.favorited
    ? messages.skillDetailActionRemoveFavorite
    : messages.skillDetailActionAddFavorite;
  const installMetadataRows = model.installationSteps.slice(1);
  const installCommand = detail.skill.install_command || model.installationSteps[0]?.value || "";
  const agentPrompt = useMemo(
    () =>
      buildSkillDetailInstallPrompt({
        detail,
        fallbackInstallValue: model.installationSteps[0]?.value
      }),
    [detail, model.installationSteps]
  );

  async function handleCopyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setInstallFeedback(messages.skillDetailFeedbackCopied);
    } catch {
      setInstallFeedback(messages.skillDetailFeedbackCopyFailed);
    }
  }

  return (
    <aside className="skill-detail-sidebar" data-testid="skill-detail-sidebar">
      <section className="marketplace-section-card skill-detail-side-card" data-testid="skill-detail-installation-card">
        <div className="marketplace-section-header">
          <h3>{messages.skillDetailInstallTitle}</h3>
          <p>{messages.skillDetailInstallDescription}</p>
        </div>

        <div className="skill-detail-install-mode-switch" role="tablist" aria-label={messages.skillDetailInstallTitle}>
          <button
            type="button"
            role="tab"
            aria-selected={installAudience === "agent"}
            className={`skill-detail-install-mode-button${installAudience === "agent" ? " is-active" : ""}`}
            onClick={() => setInstallAudience("agent")}
          >
            {messages.skillDetailInstallAudienceAgent}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={installAudience === "human"}
            className={`skill-detail-install-mode-button${installAudience === "human" ? " is-active" : ""}`}
            onClick={() => setInstallAudience("human")}
          >
            {messages.skillDetailInstallAudienceHuman}
          </button>
        </div>

        {installFeedback ? <div className="skill-detail-feedback">{installFeedback}</div> : null}

        {installAudience === "agent" ? (
          <div className="skill-detail-agent-panel">
            <p className="skill-detail-agent-hint">{messages.skillDetailInstallAgentHint}</p>

            <div className="skill-detail-agent-prompt-shell">
              <div className="skill-detail-agent-prompt-head">
                <h4>{messages.skillDetailInstallAgentPromptTitle}</h4>
              </div>
              <pre className="skill-detail-agent-prompt-body">{agentPrompt}</pre>
            </div>

            <div className="skill-detail-link-grid skill-detail-install-action-grid">
              <button
                type="button"
                className="skill-detail-secondary-action"
                onClick={() => void handleCopyValue(agentPrompt)}
              >
                {messages.skillDetailActionCopyPrompt}
              </button>
              {detail.skill.source_url ? (
                <Link href={detail.skill.source_url} target="_blank" rel="noreferrer" className="skill-detail-secondary-action">
                  {messages.skillDetailOpenSource}
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="skill-detail-human-panel">
            <div className="skill-detail-content-panel skill-detail-install-command-panel">
              <div className="skill-detail-content-head">
                <h3>{model.installationSteps[0]?.label || messages.skillDetailInstallTitle}</h3>
              </div>
              <pre className="skill-detail-content-preview">{installCommand}</pre>
            </div>

            {installMetadataRows.length > 0 ? (
              <div className="skill-detail-install-list">
                {installMetadataRows.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="skill-detail-install-row">
                    <div className="skill-detail-install-row-copy">
                      <span className="skill-detail-install-label">{item.label}</span>
                      {item.description ? <p className="skill-detail-install-help">{item.description}</p> : null}
                    </div>
                    <span className="skill-detail-install-value">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="skill-detail-link-grid skill-detail-install-action-grid">
              <button
                type="button"
                className="skill-detail-secondary-action"
                onClick={() => void handleCopyValue(installCommand)}
              >
                {messages.skillDetailActionCopyCommand}
              </button>
              {detail.skill.source_url ? (
                <Link href={detail.skill.source_url} target="_blank" rel="noreferrer" className="skill-detail-secondary-action">
                  {messages.skillDetailOpenSource}
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="marketplace-section-card skill-detail-side-card" data-testid="skill-detail-interaction-panel">
        <div className="marketplace-section-header">
          <h3>{messages.skillDetailInteractionTitle}</h3>
          <p>{messages.skillDetailInteractionDescription}</p>
        </div>

        {feedback ? <div className="skill-detail-feedback">{feedback}</div> : null}

        {detail.viewer_state.can_interact ? (
          <>
            <button
              type="button"
              className="skill-detail-primary-action"
              onClick={onFavorite}
              disabled={busy}
            >
              {favoriteLabel}
            </button>

            <div className="skill-detail-rating-row">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`skill-detail-rating-button${detail.viewer_state.rating === score ? " is-active" : ""}`}
                  onClick={() => onRate(score)}
                  disabled={busy}
                >
                  {messages.skillDetailActionRatePrefix} {score}
                </button>
              ))}
            </div>

            <form className="skill-detail-comment-form" onSubmit={onCommentSubmit}>
              <textarea
                className="skill-detail-comment-input"
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(event.target.value)}
                placeholder={messages.skillDetailCommentPlaceholder}
                disabled={busy}
              />
              <button
                type="submit"
                className="skill-detail-secondary-action"
                disabled={busy || !commentDraft.trim()}
              >
                {messages.skillDetailCommentSubmit}
              </button>
            </form>
          </>
        ) : !isAuthenticated ? (
          <Link
            href={loginTarget.href}
            as={loginTarget.as}
            className="skill-detail-primary-action skill-detail-signin-link"
          >
            {messages.shellSignIn}
          </Link>
        ) : (
          <Link href="/workspace" className="skill-detail-primary-action">
            {messages.shellWorkspace}
          </Link>
        )}

        <div className="skill-detail-link-grid">
          <Link href={toPublicPath("/rankings")} className="skill-detail-secondary-action">
            {messages.skillDetailOpenRankings}
          </Link>
        </div>
      </section>

      <section className="marketplace-section-card skill-detail-side-card" data-testid="skill-detail-comments-panel">
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
                    <div className="skill-detail-comment-date">
                      {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(comment.created_at))}
                    </div>
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
    </aside>
  );
}
