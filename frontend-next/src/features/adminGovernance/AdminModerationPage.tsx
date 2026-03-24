"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { useAdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { AdminModerationContent } from "./AdminModerationContent";
import type { CreateModerationDraft, ResolveModerationDraft } from "./AdminModerationForms";
import { type ModerationQueryState } from "./AdminModerationPanels";
import { buildModerationOverview, normalizeModerationCasesPayload } from "./moderationModel";

function buildPath(query: ModerationQueryState) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  });
  const suffix = params.toString();
  return suffix ? `/api/bff/admin/moderation?${suffix}` : "/api/bff/admin/moderation";
}

export function AdminModerationPage() {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(0);
  const { overlay, openOverlay, closeOverlay } = useAdminOverlayState<"moderationCreate" | "moderationDetail">();
  const [query, setQuery] = useState<ModerationQueryState>({ status: "", target_type: "", reason_code: "" });
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [createDraft, setCreateDraft] = useState<CreateModerationDraft>({
    reporterUserId: "",
    targetType: "skill",
    skillId: "",
    commentId: "",
    reasonCode: "",
    reasonDetail: ""
  });
  const [resolveDraft, setResolveDraft] = useState<ResolveModerationDraft>({ action: "flagged", resolutionNote: "", rejectionNote: "" });

  const payload = useMemo(
    () =>
      normalizeModerationCasesPayload(rawPayload, {
        targetUnknown: moderationMessages.targetUnknown,
        reasonUnspecified: moderationMessages.reasonUnspecified,
        statusFallback: moderationMessages.statusFallback,
        actionNone: moderationMessages.actionNone
      }),
    [moderationMessages, rawPayload]
  );
  const overview = useMemo(
    () =>
      buildModerationOverview(payload, selectedCaseId, {
        totalCases: moderationMessages.metricTotalCases,
        openCases: moderationMessages.metricOpenCases,
        resolvedCases: moderationMessages.metricResolvedCases,
        skillTargets: moderationMessages.metricSkillTargets,
        rejectedSummary: moderationMessages.reasonSummaryRejected
      }),
    [moderationMessages, payload, selectedCaseId]
  );
  const selectedCase = overview.selectedCase;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextPayload = await clientFetchJSON(buildPath(query));
      const normalized = normalizeModerationCasesPayload(nextPayload, {
        targetUnknown: moderationMessages.targetUnknown,
        reasonUnspecified: moderationMessages.reasonUnspecified,
        statusFallback: moderationMessages.statusFallback,
        actionNone: moderationMessages.actionNone
      });
      setRawPayload(nextPayload);
      setSelectedCaseId((current) => current || normalized.items[0]?.id || 0);
    } catch (loadError) {
      setError(resolveRequestErrorDisplayMessage(loadError, moderationMessages.loadError));
      setRawPayload(null);
      setSelectedCaseId(0);
    } finally {
      setLoading(false);
    }
  }, [moderationMessages, query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

  useEffect(() => {
    if (!selectedCase && overlay?.entity === "moderationDetail") {
      closeOverlay();
    }
  }, [closeOverlay, overlay, selectedCase]);

  async function createCase() {
    if (!createDraft.reasonCode.trim()) {
      setError(moderationMessages.createReasonRequiredError);
      return;
    }
    setBusyAction("create-case");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON("/api/bff/admin/moderation", {
        method: "POST",
        body: {
          reporter_user_id: Number(createDraft.reporterUserId || 0) || undefined,
          target_type: createDraft.targetType,
          skill_id: Number(createDraft.skillId || 0) || undefined,
          comment_id: Number(createDraft.commentId || 0) || undefined,
          reason_code: createDraft.reasonCode.trim(),
          reason_detail: createDraft.reasonDetail.trim()
        }
      });
      setCreateDraft({
        reporterUserId: "",
        targetType: "skill",
        skillId: "",
        commentId: "",
        reasonCode: "",
        reasonDetail: ""
      });
      closeOverlay();
      setMessage(moderationMessages.createSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, moderationMessages.createError));
    } finally {
      setBusyAction("");
    }
  }

  async function resolveCase() {
    if (!selectedCase) {
      setError(moderationMessages.selectCaseError);
      return;
    }
    setBusyAction("resolve-case");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/moderation/${selectedCase.id}/resolve`, {
        method: "POST",
        body: {
          action: resolveDraft.action,
          resolution_note: resolveDraft.resolutionNote.trim()
        }
      });
      setMessage(formatProtectedMessage(moderationMessages.resolveSuccess, { caseId: selectedCase.id }));
      setResolveDraft((current) => ({ ...current, resolutionNote: "" }));
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, moderationMessages.resolveError));
    } finally {
      setBusyAction("");
    }
  }

  async function rejectCase() {
    if (!selectedCase) {
      setError(moderationMessages.selectCaseError);
      return;
    }
    setBusyAction("reject-case");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/moderation/${selectedCase.id}/reject`, {
        method: "POST",
        body: {
          rejection_note: resolveDraft.rejectionNote.trim()
        }
      });
      setMessage(formatProtectedMessage(moderationMessages.rejectSuccess, { caseId: selectedCase.id }));
      setResolveDraft((current) => ({ ...current, rejectionNote: "" }));
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, moderationMessages.rejectError));
    } finally {
      setBusyAction("");
    }
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={moderationMessages.pageTitle}
        description={moderationMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminModerationContent
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      metrics={overview.metrics}
      payload={payload}
      selectedCase={selectedCase}
      reasonSummary={overview.reasonSummary}
      query={query}
      createDraft={createDraft}
      resolveDraft={resolveDraft}
      activePane={overlay?.entity === "moderationCreate" ? "create" : overlay?.entity === "moderationDetail" ? "detail" : "idle"}
      onRefresh={() => void loadData()}
      onResetFilters={() => setQuery({ status: "", target_type: "", reason_code: "" })}
      onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
      onOpenCreatePane={() => openOverlay({ kind: "create", entity: "moderationCreate" })}
      onOpenCaseDetail={(caseId) => {
        setSelectedCaseId(caseId);
        openOverlay({ kind: "detail", entity: "moderationDetail", entityId: caseId });
      }}
      onClosePane={closeOverlay}
      onCreateDraftChange={(patch) => setCreateDraft((current) => ({ ...current, ...patch }))}
      onResolveDraftChange={(patch) => setResolveDraft((current) => ({ ...current, ...patch }))}
      onCreateCase={() => void createCase()}
      onResolveCase={() => void resolveCase()}
      onRejectCase={() => void rejectCase()}
    />
  );
}
