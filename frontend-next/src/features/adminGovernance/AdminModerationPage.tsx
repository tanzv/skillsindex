"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminMessageBanner, AdminMetricGrid } from "@/src/components/admin/AdminPrimitives";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import {
  CreateModerationCaseCard,
  ModerationDispositionCard,
  ModerationFiltersCard,
  type ModerationQueryState,
  ModerationQueueCard,
  SelectedModerationCaseCard
} from "./AdminModerationPanels";
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
  const commonMessages = messages.adminCommon;
  const moderationMessages = messages.adminModeration;
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(0);
  const [query, setQuery] = useState<ModerationQueryState>({ status: "", target_type: "", reason_code: "" });
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [createDraft, setCreateDraft] = useState({
    reporterUserId: "",
    targetType: "skill",
    skillId: "",
    commentId: "",
    reasonCode: "",
    reasonDetail: ""
  });
  const [resolveDraft, setResolveDraft] = useState({ action: "flagged", resolutionNote: "", rejectionNote: "" });

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
      setError(loadError instanceof Error ? loadError.message : moderationMessages.loadError);
      setRawPayload(null);
      setSelectedCaseId(0);
    } finally {
      setLoading(false);
    }
  }, [moderationMessages, query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      setMessage(moderationMessages.createSuccess);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : moderationMessages.createError);
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
      setError(actionError instanceof Error ? actionError.message : moderationMessages.resolveError);
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
      setError(actionError instanceof Error ? actionError.message : moderationMessages.rejectError);
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={commonMessages.adminEyebrow}
        title={moderationMessages.pageTitle}
        description={moderationMessages.pageDescription}
        actions={
          <>
        <Button variant="outline" onClick={() => setQuery({ status: "", target_type: "", reason_code: "" })}>
              {moderationMessages.resetFilters}
            </Button>
            <Button onClick={() => void loadData()} disabled={loading}>
              {loading ? commonMessages.refreshing : commonMessages.refresh}
            </Button>
          </>
        }
      />

      <AdminMetricGrid metrics={overview.metrics} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ModerationFiltersCard query={query} onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))} />

          {error ? <ErrorState description={error} /> : null}
          {message ? <AdminMessageBanner message={message} /> : null}

          <ModerationQueueCard payload={payload} loading={loading} selectedCase={selectedCase} onSelectCase={setSelectedCaseId} />
        </div>

        <div className="space-y-6">
          <SelectedModerationCaseCard selectedCase={selectedCase} reasonSummary={overview.reasonSummary} />
          <CreateModerationCaseCard
            createDraft={createDraft}
            busyAction={busyAction}
            onCreateDraftChange={(patch) => setCreateDraft((current) => ({ ...current, ...patch }))}
            onCreateCase={() => void createCase()}
          />
          <ModerationDispositionCard
            resolveDraft={resolveDraft}
            busyAction={busyAction}
            selectedCase={selectedCase}
            onResolveDraftChange={(patch) => setResolveDraft((current) => ({ ...current, ...patch }))}
            onResolveCase={() => void resolveCase()}
            onRejectCase={() => void rejectCase()}
          />
        </div>
      </div>
    </div>
  );
}
