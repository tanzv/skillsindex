"use client";
import { useEffect, useMemo, useState } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
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
import {
  buildPublicSkillInteractivePageModel,
  resolveInitialSelectedSkillResourceName
} from "./publicSkillInteractivePageModel";
import { SkillDetailContextBar } from "./skill-detail/SkillDetailContextBar";
import { SkillDetailHeader } from "./skill-detail/SkillDetailHeader";
import { SkillDetailSidebar } from "./skill-detail/SkillDetailSidebar";
import { SkillDetailWorkbench, type SkillDetailWorkspaceTab } from "./skill-detail/SkillDetailWorkbench";
import { shouldLoadDeferredSkillResourceContent, shouldLoadDeferredSkillResources, shouldLoadDeferredSkillVersions } from "./skill-detail/skillDetailDeferredLoad";
import { buildSkillDetailWorkspaceCopy } from "./skill-detail/skillDetailWorkspaceConfig";
import { useDeferredLoadStatus, useLatestRef, useMountedRef } from "./skill-detail/useDeferredLoadStatus";

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
  const mountedRef = useMountedRef();
  const initialSelectedResourceName = resolveInitialSelectedSkillResourceName({
    detail: initialDetail,
    resources,
    initialResourceContent
  });
  const [detail, setDetail] = useState(initialDetail);
  const skillIdRef = useLatestRef(detail.skill.id);
  const [resourcesState, setResourcesState] = useState(resources);
  const { status: resourcesStatus, setStatus: setResourcesStatus, statusRef: resourcesStatusRef } = useDeferredLoadStatus(
    resources ? "ready" : "idle"
  );
  const [versionsState, setVersionsState] = useState(versions);
  const { status: versionsStatus, setStatus: setVersionsStatus, statusRef: versionsStatusRef } = useDeferredLoadStatus(
    versions ? "ready" : "idle"
  );
  const [resourceContent, setResourceContent] = useState(initialResourceContent);
  const { setStatus: setResourceContentStatus, statusRef: resourceContentStatusRef } = useDeferredLoadStatus(
    initialResourceContent ? "ready" : "idle"
  );
  const [selectedResourceName, setSelectedResourceName] = useState(initialSelectedResourceName);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState<SkillDetailWorkspaceTab>("overview");
  const shouldLoadResources = shouldLoadDeferredSkillResources(workspaceTab);
  const shouldLoadVersions = shouldLoadDeferredSkillVersions(workspaceTab);
  const shouldLoadResourceContent = shouldLoadDeferredSkillResourceContent(workspaceTab);

  useEffect(() => {
    if (!shouldLoadResources || resourcesState || resourcesStatusRef.current === "loading" || resourcesStatusRef.current === "error") {
      return;
    }
    const requestedSkillId = detail.skill.id;
    setResourcesStatus("loading");

    async function loadResources() {
      try {
        const payload = await clientFetchJSON<PublicSkillResourcesResponse>(`/api/bff/public/skills/${detail.skill.id}/resources`);
        if (!mountedRef.current || skillIdRef.current !== requestedSkillId) {
          return;
        }
        setResourcesState(payload);
        setResourcesStatus("ready");
      } catch {
        if (!mountedRef.current || skillIdRef.current !== requestedSkillId) {
          return;
        }
        setResourcesState(null);
        setResourcesStatus("error");
      }
    }
    void loadResources();
  }, [detail.skill.id, mountedRef, resourcesState, resourcesStatusRef, setResourcesStatus, shouldLoadResources, skillIdRef]);

  useEffect(() => {
    if (!shouldLoadVersions || versionsState || versionsStatusRef.current === "loading" || versionsStatusRef.current === "error") {
      return;
    }
    const requestedSkillId = detail.skill.id;
    setVersionsStatus("loading");

    async function loadVersions() {
      try {
        const payload = await clientFetchJSON<PublicSkillVersionsResponse>(`/api/bff/public/skills/${detail.skill.id}/versions`);
        if (!mountedRef.current || skillIdRef.current !== requestedSkillId) {
          return;
        }
        setVersionsState(payload);
        setVersionsStatus("ready");
      } catch {
        if (!mountedRef.current || skillIdRef.current !== requestedSkillId) {
          return;
        }
        setVersionsState(null);
        setVersionsStatus("error");
      }
    }
    void loadVersions();
  }, [detail.skill.id, mountedRef, setVersionsStatus, shouldLoadVersions, skillIdRef, versionsState, versionsStatusRef]);

  useEffect(() => {
    const firstResourceName = resourcesState?.files[0]?.name || "";
    if (!firstResourceName || selectedResourceName) {
      return;
    }
    setSelectedResourceName(firstResourceName);
  }, [resourcesState, selectedResourceName]);

  useEffect(() => {
    const firstResourceName = resourcesState?.files[0]?.name || "";
    if (
      !shouldLoadResourceContent ||
      !firstResourceName ||
      resourceContent ||
      resourceContentStatusRef.current === "loading" ||
      resourceContentStatusRef.current === "error"
    ) {
      return;
    }
    if (selectedResourceName && selectedResourceName !== firstResourceName) {
      return;
    }
    const requestedSkillId = detail.skill.id;
    setResourceContent(null);
    setResourceContentStatus("loading");

    async function loadInitialResourceContent() {
      try {
        const payload = await clientFetchJSON<PublicSkillResourceContentResponse>(
          `/api/bff/public/skills/${detail.skill.id}/resource-file?path=${encodeURIComponent(firstResourceName)}`
        );
        if (!mountedRef.current || skillIdRef.current !== requestedSkillId) {
          return;
        }
        setResourceContent(payload);
        setResourceContentStatus("ready");
      } catch {
        if (!mountedRef.current || skillIdRef.current !== requestedSkillId) {
          return;
        }
        setResourceContent(null);
        setResourceContentStatus("error");
      }
    }
    void loadInitialResourceContent();
  }, [
    detail.skill.id,
    mountedRef,
    resourceContent,
    resourceContentStatusRef,
    resourcesState,
    selectedResourceName,
    setResourceContentStatus,
    shouldLoadResourceContent,
    skillIdRef
  ]);

  const model = useMemo(
    () =>
      buildPublicSkillDetailModel({
        detail,
        resources: resourcesState,
        versions: versionsState,
        resourceContent,
        locale,
        messages
      }),
    [detail, locale, messages, resourceContent, resourcesState, versionsState]
  );

  const selectedFile = useMemo(() => {
    return resourcesState?.files.find((file) => file.name === selectedResourceName) || resourcesState?.files[0] || null;
  }, [resourcesState?.files, selectedResourceName]);

  const workspaceCopy = buildSkillDetailWorkspaceCopy(messages);
  const pageModel = buildPublicSkillInteractivePageModel({
    detail,
    resources: resourcesState,
    versions: versionsState,
    activeTab: workspaceTab,
    selectedResourceName: selectedResourceName || selectedFile?.name || "",
    messages
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
    setSelectedResourceName(fileName);
    setResourceContent(null);
    setResourceContentStatus("loading");
    try {
      const payload = await clientFetchJSON<PublicSkillResourceContentResponse>(
        `/api/bff/public/skills/${detail.skill.id}/resource-file?path=${encodeURIComponent(fileName)}`
      );
      setResourceContent(payload);
      setResourceContentStatus("ready");
      setWorkspaceTab("skill");
    } catch (error) {
      setResourceContent(null);
      setResourceContentStatus("error");
      setFeedback(error instanceof Error ? error.message : messages.skillDetailFeedbackResourceFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="skill-detail-page" data-active-tab={workspaceTab} data-testid="skill-detail-page">
      <SkillDetailContextBar
        activeTab={workspaceTab}
        breadcrumbAriaLabel={messages.stageSkillDetail}
        breadcrumbItems={pageModel.breadcrumbItems}
        onTabChange={setWorkspaceTab}
        previewStatus={pageModel.previewStatus}
        summaryItems={[detail.skill.source_type, detail.skill.quality_score.toFixed(1)].filter(Boolean)}
        title={detail.skill.name}
        workspaceCopy={workspaceCopy}
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
            locale={locale}
            resourceContent={resourceContent}
            resourcesPending={shouldLoadResources && resourcesStatus === "loading" && !resourcesState}
            resources={resourcesState}
            selectedFileName={selectedResourceName || selectedFile?.name || ""}
            versionsPending={shouldLoadVersions && versionsStatus === "loading" && !versionsState}
          />
        </div>
        <SkillDetailSidebar
          activeTab={workspaceTab}
          busy={busy}
          commentDraft={commentDraft}
          comments={detail.comments}
          currentContextLabel={pageModel.previewStatus}
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
        />
      </div>
    </div>
  );
}
