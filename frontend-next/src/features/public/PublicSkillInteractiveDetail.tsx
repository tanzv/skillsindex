"use client";
import { useMemo, useState } from "react";

import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse,
  SkillCommentCreateMutationResponse,
  SkillCommentDeleteMutationResponse,
  SkillFavoriteMutationResponse,
  SkillRatingMutationResponse
} from "@/src/lib/schemas/public";

import { buildPublicSkillDetailModel } from "./publicSkillDetailModel";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { buildPublicSkillFallbackResourceContent } from "./publicSkillDetailFallback";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { SkillDetailHeader } from "./skill-detail/SkillDetailHeader";
import { SkillDetailSidebar } from "./skill-detail/SkillDetailSidebar";
import { SkillDetailWorkbench, type SkillDetailWorkspaceTab } from "./skill-detail/SkillDetailWorkbench";

interface PublicSkillInteractiveDetailProps {
  initialDetail: PublicSkillDetailResponse;
  resources: PublicSkillResourcesResponse | null;
  versions: PublicSkillVersionsResponse | null;
  initialResourceContent: PublicSkillResourceContentResponse | null;
}

export function PublicSkillInteractiveDetail({
  initialDetail,
  resources,
  versions,
  initialResourceContent
}: PublicSkillInteractiveDetailProps) {
  const { locale, messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const [detail, setDetail] = useState(initialDetail);
  const [resourceContent, setResourceContent] = useState(initialResourceContent);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState<SkillDetailWorkspaceTab>("overview");

  const model = useMemo(
    () =>
      buildPublicSkillDetailModel({
        detail,
        resources,
        versions,
        resourceContent,
        locale,
        messages
      }),
    [detail, locale, messages, resourceContent, resources, versions]
  );

  const selectedFile = useMemo(() => {
    const preferred = resourceContent?.path;
    return resources?.files.find((file) => file.name === preferred) || resources?.files[0] || null;
  }, [resourceContent?.path, resources?.files]);

  const activeWorkspaceLabel =
    workspaceTab === "overview"
      ? messages.skillDetailOverviewTitle
      : workspaceTab === "installation"
        ? messages.skillDetailInstallTitle
        : workspaceTab === "skill"
          ? messages.skillDetailContentTitle
          : workspaceTab === "history"
            ? messages.skillDetailVersionsTitle
            : workspaceTab === "related"
              ? messages.skillDetailRelatedTitle
              : messages.skillDetailResourcesTitle;

  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageSkillDetail,
    variant: "skill-detail"
  });

  async function refreshDetail() {
    const payload = await clientFetchJSON<PublicSkillDetailResponse>(`/api/bff/public/skills/${detail.skill.id}`);
    setDetail(payload);
  }

  async function handleFavorite() {
    setBusy(true);
    setFeedback("");
    try {
      const payload = await clientFetchJSON<SkillFavoriteMutationResponse>(`/api/bff/skills/${detail.skill.id}/favorite`, {
        method: "POST"
      });
      setDetail((current) => ({
        ...current,
        viewer_state: {
          ...current.viewer_state,
          favorited: payload.favorited
        },
        stats: payload.stats ? { ...current.stats, ...payload.stats } : current.stats
      }));
      setFeedback(payload.favorited ? messages.skillDetailFeedbackFavoriteAdded : messages.skillDetailFeedbackFavoriteRemoved);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.skillDetailFeedbackFavoriteFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleRate(score: number) {
    setBusy(true);
    setFeedback("");
    try {
      const payload = await clientFetchJSON<SkillRatingMutationResponse>(`/api/bff/skills/${detail.skill.id}/rating`, {
        method: "POST",
        body: { score }
      });
      setDetail((current) => ({
        ...current,
        viewer_state: {
          ...current.viewer_state,
          rated: true,
          rating: payload.score
        },
        stats: payload.stats ? { ...current.stats, ...payload.stats } : current.stats
      }));
      setFeedback(`${messages.skillDetailFeedbackRatingSubmittedPrefix} ${payload.score}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.skillDetailFeedbackRatingFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!commentDraft.trim()) {
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      await clientFetchJSON<SkillCommentCreateMutationResponse>(`/api/bff/skills/${detail.skill.id}/comments`, {
        method: "POST",
        body: { content: commentDraft.trim() }
      });
      setCommentDraft("");
      setFeedback(messages.skillDetailFeedbackCommentCreated);
      await refreshDetail();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.skillDetailFeedbackCommentFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleCommentDelete(commentId: number) {
    setBusy(true);
    setFeedback("");
    try {
      await clientFetchJSON<SkillCommentDeleteMutationResponse>(`/api/bff/skills/${detail.skill.id}/comments/${commentId}/delete`, {
        method: "POST"
      });
      setFeedback(messages.skillDetailFeedbackCommentDeleted);
      await refreshDetail();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.skillDetailFeedbackCommentDeleteFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenFile(fileName: string) {
    setBusy(true);
    setFeedback("");
    try {
      const payload = await clientFetchJSON<PublicSkillResourceContentResponse>(
        `/api/bff/public/skills/${detail.skill.id}/resource-file?path=${encodeURIComponent(fileName)}`
      );
      setResourceContent(payload);
      setWorkspaceTab("skill");
    } catch (error) {
      const fallbackContent = buildPublicSkillFallbackResourceContent(detail.skill.id, fileName);
      if (fallbackContent) {
        setResourceContent(fallbackContent);
        setWorkspaceTab("skill");
        return;
      }
      setFeedback(error instanceof Error ? error.message : messages.skillDetailFeedbackResourceFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="skill-detail-page" data-testid="skill-detail-page">
      <PublicShellRegistration slots={shellSlots} />

      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.stageSkillDetail}
        className="skill-detail-shell-breadcrumb"
        testId="skill-detail-shell-breadcrumb"
        items={[
          { href: toPublicPath("/"), label: messages.shellHome },
          { href: toPublicPath(`/skills/${detail.skill.id}`), label: detail.skill.name },
          { label: activeWorkspaceLabel, isCurrent: true, isSoft: true }
        ]}
      />

      <SkillDetailHeader detail={detail} locale={locale} messages={messages} model={model} />

      <div className="skill-detail-workspace">
        <div className="skill-detail-main-column">
          <SkillDetailWorkbench
            activeTab={workspaceTab}
            detail={detail}
            messages={messages}
            model={model}
            onOpenFile={(fileName) => void handleOpenFile(fileName)}
            onTabChange={setWorkspaceTab}
            locale={locale}
            resourceContent={resourceContent}
            resources={resources}
            selectedFileName={selectedFile?.name || ""}
            toPublicPath={toPublicPath}
          />
        </div>

        <SkillDetailSidebar
          busy={busy}
          commentDraft={commentDraft}
          comments={detail.comments}
          detail={detail}
          feedback={feedback}
          locale={locale}
          messages={messages}
          model={model}
          onCommentDelete={(commentId) => void handleCommentDelete(commentId)}
          onCommentDraftChange={setCommentDraft}
          onCommentSubmit={(event) => void handleCommentSubmit(event)}
          onFavorite={() => void handleFavorite()}
          onRate={(score) => void handleRate(score)}
          toPublicPath={toPublicPath}
        />
      </div>
    </div>
  );
}
