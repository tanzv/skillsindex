"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { buildModerationOverview, normalizeModerationCasesPayload } from "./moderationModel";
import { formatDateTime } from "./shared";

function buildPath(query: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  });
  const suffix = params.toString();
  return suffix ? `/api/bff/admin/moderation?${suffix}` : "/api/bff/admin/moderation";
}

function renderStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "resolved") {
    return <Badge variant="soft">resolved</Badge>;
  }
  if (normalized === "rejected") {
    return <Badge className="bg-rose-100 text-rose-900 hover:bg-rose-100">rejected</Badge>;
  }
  return <Badge variant="outline">{status || "open"}</Badge>;
}

export function AdminModerationPage() {
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(0);
  const [query, setQuery] = useState<Record<string, string>>({ status: "", target_type: "", reason_code: "" });
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

  const payload = useMemo(() => normalizeModerationCasesPayload(rawPayload), [rawPayload]);
  const overview = useMemo(() => buildModerationOverview(payload, selectedCaseId), [payload, selectedCaseId]);
  const selectedCase = overview.selectedCase;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextPayload = await clientFetchJSON(buildPath(query));
      const normalized = normalizeModerationCasesPayload(nextPayload);
      setRawPayload(nextPayload);
      setSelectedCaseId((current) => current || normalized.items[0]?.id || 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load moderation queue.");
      setRawPayload(null);
      setSelectedCaseId(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createCase() {
    if (!createDraft.reasonCode.trim()) {
      setError("Reason code is required.");
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
      setMessage("Moderation case created.");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to create moderation case.");
    } finally {
      setBusyAction("");
    }
  }

  async function resolveCase() {
    if (!selectedCase) {
      setError("Select a moderation case first.");
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
      setMessage(`Case ${selectedCase.id} resolved.`);
      setResolveDraft((current) => ({ ...current, resolutionNote: "" }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to resolve moderation case.");
    } finally {
      setBusyAction("");
    }
  }

  async function rejectCase() {
    if (!selectedCase) {
      setError("Select a moderation case first.");
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
      setMessage(`Case ${selectedCase.id} rejected.`);
      setResolveDraft((current) => ({ ...current, rejectionNote: "" }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to reject moderation case.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Moderation"
        description="Review open reports, inspect target context, and resolve or reject cases from a dedicated moderation workspace."
        actions={
          <>
            <Button variant="outline" onClick={() => setQuery({ status: "", target_type: "", reason_code: "" })}>
              Reset Filters
            </Button>
            <Button onClick={() => void loadData()} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue Filters</CardTitle>
              <CardDescription>Scope the moderation queue before working on an individual case.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Input aria-label="Queue status" value={query.status || ""} placeholder="Status" onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value }))} />
              <Input
                aria-label="Queue target type"
                value={query.target_type || ""}
                placeholder="Target type"
                onChange={(event) => setQuery((current) => ({ ...current, target_type: event.target.value }))}
              />
              <Input
                aria-label="Queue reason code"
                value={query.reason_code || ""}
                placeholder="Reason code"
                onChange={(event) => setQuery((current) => ({ ...current, reason_code: event.target.value }))}
              />
            </CardContent>
          </Card>

          {error ? <ErrorState description={error} /> : null}
          {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Moderation Queue</CardTitle>
                  <CardDescription>Select a case to inspect details and apply a disposition.</CardDescription>
                </div>
                <Badge variant="outline">{payload.total} cases</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {payload.items.map((item) => (
                <button
                  key={item.id}
                  data-testid={`moderation-case-card-${item.id}`}
                  type="button"
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    item.id === selectedCase?.id ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedCaseId(item.id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">Case #{item.id}</span>
                        {renderStatusBadge(item.status)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item.targetType} · reason {item.reasonCode} · reporter #{item.reporterUserId || "n/a"}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {item.skillId ? <span className="rounded-full bg-slate-100 px-2.5 py-1">skill #{item.skillId}</span> : null}
                        {item.commentId ? <span className="rounded-full bg-slate-100 px-2.5 py-1">comment #{item.commentId}</span> : null}
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatDateTime(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{item.action || "no action"}</div>
                  </div>
                </button>
              ))}

              {!payload.items.length && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No moderation cases matched the current filter set.</div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Case</CardTitle>
              <CardDescription>Core evidence and resolution context for the active moderation record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="font-semibold text-slate-950">{selectedCase ? `Case #${selectedCase.id}` : "No case selected"}</div>
                <div className="mt-1">Target: {selectedCase?.targetType || "n/a"}</div>
                <div className="mt-1">Reason: {selectedCase?.reasonCode || "n/a"}</div>
                <div className="mt-1">Resolver: {selectedCase?.resolverUserId || "n/a"}</div>
                <div className="mt-1">Updated: {selectedCase ? formatDateTime(selectedCase.updatedAt) : "n/a"}</div>
              </div>
              {selectedCase?.reasonDetail ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="font-semibold text-slate-950">Reported detail</div>
                  <div className="mt-1">{selectedCase.reasonDetail}</div>
                </div>
              ) : null}
              {overview.reasonSummary.map((item) => (
                <div key={item.reason} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>{item.reason}</span>
                  <span className="font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Case</CardTitle>
              <CardDescription>Escalate a new report into the moderation queue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                aria-label="Case reporter user ID"
                value={createDraft.reporterUserId}
                placeholder="Reporter user ID"
                onChange={(event) => setCreateDraft((current) => ({ ...current, reporterUserId: event.target.value }))}
              />
              <select
                aria-label="Case target type"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                value={createDraft.targetType}
                onChange={(event) => setCreateDraft((current) => ({ ...current, targetType: event.target.value }))}
              >
                <option value="skill">skill</option>
                <option value="comment">comment</option>
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                <Input aria-label="Case skill ID" value={createDraft.skillId} placeholder="Skill ID" onChange={(event) => setCreateDraft((current) => ({ ...current, skillId: event.target.value }))} />
                <Input
                  aria-label="Case comment ID"
                  value={createDraft.commentId}
                  placeholder="Comment ID"
                  onChange={(event) => setCreateDraft((current) => ({ ...current, commentId: event.target.value }))}
                />
              </div>
              <Input
                aria-label="Case reason code"
                value={createDraft.reasonCode}
                placeholder="Reason code"
                onChange={(event) => setCreateDraft((current) => ({ ...current, reasonCode: event.target.value }))}
              />
              <textarea
                aria-label="Case reason detail"
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                value={createDraft.reasonDetail}
                placeholder="Reason detail"
                onChange={(event) => setCreateDraft((current) => ({ ...current, reasonDetail: event.target.value }))}
              />
              <Button onClick={() => void createCase()} disabled={Boolean(busyAction)}>
                {busyAction === "create-case" ? "Creating..." : "Create Case"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disposition</CardTitle>
              <CardDescription>Apply a resolution or reject the selected case with an audit note.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                aria-label="Resolution action"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                value={resolveDraft.action}
                onChange={(event) => setResolveDraft((current) => ({ ...current, action: event.target.value }))}
              >
                <option value="flagged">flagged</option>
                <option value="hidden">hidden</option>
                <option value="deleted">deleted</option>
              </select>
              <textarea
                aria-label="Resolution note"
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                value={resolveDraft.resolutionNote}
                placeholder="Resolution note"
                onChange={(event) => setResolveDraft((current) => ({ ...current, resolutionNote: event.target.value }))}
              />
              <textarea
                aria-label="Rejection note"
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                value={resolveDraft.rejectionNote}
                placeholder="Rejection note"
                onChange={(event) => setResolveDraft((current) => ({ ...current, rejectionNote: event.target.value }))}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void resolveCase()} disabled={Boolean(busyAction) || !selectedCase}>
                  {busyAction === "resolve-case" ? "Resolving..." : "Resolve Case"}
                </Button>
                <Button variant="outline" onClick={() => void rejectCase()} disabled={Boolean(busyAction) || !selectedCase}>
                  {busyAction === "reject-case" ? "Rejecting..." : "Reject Case"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
