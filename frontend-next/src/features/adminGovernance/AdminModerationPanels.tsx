import { AdminEmptyBlock, AdminInsetBlock } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { ModerationCaseItem, ModerationCasesPayload } from "./moderationModel";
import { formatDateTime } from "./shared";

export interface ModerationQueryState {
  status: string;
  target_type: string;
  reason_code: string;
}

function renderStatusBadge(
  status: string,
  labels: {
    open: string;
    resolved: string;
    rejected: string;
  }
) {
  const normalized = status.toLowerCase();

  if (normalized === "resolved") {
    return <Badge variant="soft">{labels.resolved}</Badge>;
  }
  if (normalized === "rejected") {
    return (
      <Badge
        variant="outline"
        className="border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] text-[color:var(--ui-danger-text)]"
      >
        {labels.rejected}
      </Badge>
    );
  }
  return <Badge variant="outline">{status || labels.open}</Badge>;
}

export function ModerationFiltersCard({
  query,
  onQueryChange
}: {
  query: ModerationQueryState;
  onQueryChange: (patch: Partial<ModerationQueryState>) => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{moderationMessages.queueFiltersTitle}</CardTitle>
        <CardDescription>{moderationMessages.queueFiltersDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <Input
          aria-label={moderationMessages.queueStatusLabel}
          value={query.status || ""}
          placeholder={moderationMessages.queueStatusPlaceholder}
          onChange={(event) => onQueryChange({ status: event.target.value })}
        />
        <Input
          aria-label={moderationMessages.queueTargetTypeLabel}
          value={query.target_type || ""}
          placeholder={moderationMessages.queueTargetTypePlaceholder}
          onChange={(event) => onQueryChange({ target_type: event.target.value })}
        />
        <Input
          aria-label={moderationMessages.queueReasonCodeLabel}
          value={query.reason_code || ""}
          placeholder={moderationMessages.queueReasonCodePlaceholder}
          onChange={(event) => onQueryChange({ reason_code: event.target.value })}
        />
      </CardContent>
    </Card>
  );
}

export function ModerationQueueCard({
  payload,
  loading,
  selectedCase,
  onSelectCase
}: {
  payload: ModerationCasesPayload;
  loading: boolean;
  selectedCase: ModerationCaseItem | null;
  onSelectCase: (caseId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{moderationMessages.queueTitle}</CardTitle>
            <CardDescription>{moderationMessages.queueDescription}</CardDescription>
          </div>
          <Badge variant="outline">{formatProtectedMessage(moderationMessages.queueCount, { count: payload.total })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {payload.items.map((item) => (
          <button
            key={item.id}
            data-testid={`moderation-case-card-${item.id}`}
            type="button"
            className={`w-full rounded-2xl border p-4 text-left transition ${
              item.id === selectedCase?.id
                ? "border-[color:var(--ui-info-border)] bg-[color:var(--ui-info-bg)]"
                : "border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] hover:border-[color:var(--ui-border-strong)] hover:bg-[color:var(--ui-card-muted-bg)]"
            }`}
            onClick={() => onSelectCase(item.id)}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                    {formatProtectedMessage(moderationMessages.queueCasePrefix, { caseId: item.id })}
                  </span>
                  {renderStatusBadge(item.status, {
                    open: moderationMessages.statusOpen,
                    resolved: moderationMessages.statusResolved,
                    rejected: moderationMessages.statusRejected
                  })}
                </div>
                <div className="text-sm text-[color:var(--ui-text-secondary)]">
                  {item.targetType} · {formatProtectedMessage(moderationMessages.queueReasonPrefix, { value: item.reasonCode })} ·{" "}
                  {formatProtectedMessage(moderationMessages.queueReporterPrefix, {
                    value: item.reporterUserId || moderationMessages.notAvailable
                  })}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-muted)]">
                  {item.skillId ? (
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                      {formatProtectedMessage(moderationMessages.queueSkillPrefix, { value: item.skillId })}
                    </span>
                  ) : null}
                  {item.commentId ? (
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                      {formatProtectedMessage(moderationMessages.queueCommentPrefix, { value: item.commentId })}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {formatDateTime(item.createdAt, locale, moderationMessages.notAvailable)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-[color:var(--ui-text-muted)]">{item.action || moderationMessages.queueNoAction}</div>
            </div>
          </button>
        ))}

        {!payload.items.length && !loading ? <AdminEmptyBlock>{moderationMessages.queueEmpty}</AdminEmptyBlock> : null}
      </CardContent>
    </Card>
  );
}

export function SelectedModerationCaseCard({
  selectedCase,
  reasonSummary
}: {
  selectedCase: ModerationCaseItem | null;
  reasonSummary: Array<{ reason: string; count: number }>;
}) {
  const { locale, messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{moderationMessages.selectedCaseTitle}</CardTitle>
        <CardDescription>{moderationMessages.selectedCaseDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
        <AdminInsetBlock>
          <div className="font-semibold text-[color:var(--ui-text-primary)]">
            {selectedCase ? formatProtectedMessage(moderationMessages.queueCasePrefix, { caseId: selectedCase.id }) : moderationMessages.noSelection}
          </div>
          <div className="mt-1">
            {moderationMessages.targetLabel}: {selectedCase?.targetType || moderationMessages.notAvailable}
          </div>
          <div className="mt-1">
            {moderationMessages.reasonLabel}: {selectedCase?.reasonCode || moderationMessages.notAvailable}
          </div>
          <div className="mt-1">
            {moderationMessages.resolverLabel}: {selectedCase?.resolverUserId || moderationMessages.notAvailable}
          </div>
          <div className="mt-1">
            {moderationMessages.updatedLabel}:{" "}
            {selectedCase ? formatDateTime(selectedCase.updatedAt, locale, moderationMessages.notAvailable) : moderationMessages.notAvailable}
          </div>
        </AdminInsetBlock>
        {selectedCase?.reasonDetail ? (
          <AdminInsetBlock>
            <div className="font-semibold text-[color:var(--ui-text-primary)]">{moderationMessages.reportedDetailTitle}</div>
            <div className="mt-1">{selectedCase.reasonDetail}</div>
          </AdminInsetBlock>
        ) : null}
        {reasonSummary.map((item) => (
          <AdminInsetBlock key={item.reason} className="flex items-center justify-between">
            <span>{item.reason}</span>
            <span className="font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
          </AdminInsetBlock>
        ))}
      </CardContent>
    </Card>
  );
}

export function CreateModerationCaseCard({
  createDraft,
  busyAction,
  onCreateDraftChange,
  onCreateCase
}: {
  createDraft: {
    reporterUserId: string;
    targetType: string;
    skillId: string;
    commentId: string;
    reasonCode: string;
    reasonDetail: string;
  };
  busyAction: string;
  onCreateDraftChange: (patch: Partial<CreateModerationCaseCardProps["createDraft"]>) => void;
  onCreateCase: () => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{moderationMessages.createTitle}</CardTitle>
        <CardDescription>{moderationMessages.createDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          aria-label={moderationMessages.reporterUserIdLabel}
          value={createDraft.reporterUserId}
          placeholder={moderationMessages.reporterUserIdPlaceholder}
          onChange={(event) => onCreateDraftChange({ reporterUserId: event.target.value })}
        />
        <Select aria-label={moderationMessages.targetTypeLabel} value={createDraft.targetType} onChange={(event) => onCreateDraftChange({ targetType: event.target.value })}>
          <option value="skill">{moderationMessages.targetTypeSkill}</option>
          <option value="comment">{moderationMessages.targetTypeComment}</option>
        </Select>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            aria-label={moderationMessages.skillIdLabel}
            value={createDraft.skillId}
            placeholder={moderationMessages.skillIdPlaceholder}
            onChange={(event) => onCreateDraftChange({ skillId: event.target.value })}
          />
          <Input
            aria-label={moderationMessages.commentIdLabel}
            value={createDraft.commentId}
            placeholder={moderationMessages.commentIdPlaceholder}
            onChange={(event) => onCreateDraftChange({ commentId: event.target.value })}
          />
        </div>
        <Input
          aria-label={moderationMessages.reasonCodeLabel}
          value={createDraft.reasonCode}
          placeholder={moderationMessages.reasonCodePlaceholder}
          onChange={(event) => onCreateDraftChange({ reasonCode: event.target.value })}
        />
        <Textarea
          aria-label={moderationMessages.reasonDetailLabel}
          className="min-h-24"
          value={createDraft.reasonDetail}
          placeholder={moderationMessages.reasonDetailPlaceholder}
          onChange={(event) => onCreateDraftChange({ reasonDetail: event.target.value })}
        />
        <Button onClick={onCreateCase} disabled={Boolean(busyAction)}>
          {busyAction === "create-case" ? moderationMessages.creatingAction : moderationMessages.createAction}
        </Button>
      </CardContent>
    </Card>
  );
}

type CreateModerationCaseCardProps = Parameters<typeof CreateModerationCaseCard>[0];

export function ModerationDispositionCard({
  resolveDraft,
  busyAction,
  selectedCase,
  onResolveDraftChange,
  onResolveCase,
  onRejectCase
}: {
  resolveDraft: {
    action: string;
    resolutionNote: string;
    rejectionNote: string;
  };
  busyAction: string;
  selectedCase: ModerationCaseItem | null;
  onResolveDraftChange: (patch: Partial<{ action: string; resolutionNote: string; rejectionNote: string }>) => void;
  onResolveCase: () => void;
  onRejectCase: () => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{moderationMessages.dispositionTitle}</CardTitle>
        <CardDescription>{moderationMessages.dispositionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select aria-label={moderationMessages.resolutionActionLabel} value={resolveDraft.action} onChange={(event) => onResolveDraftChange({ action: event.target.value })}>
          <option value="flagged">{moderationMessages.resolutionActionFlagged}</option>
          <option value="hidden">{moderationMessages.resolutionActionHidden}</option>
          <option value="deleted">{moderationMessages.resolutionActionDeleted}</option>
        </Select>
        <Textarea
          aria-label={moderationMessages.resolutionNoteLabel}
          className="min-h-24"
          value={resolveDraft.resolutionNote}
          placeholder={moderationMessages.resolutionNotePlaceholder}
          onChange={(event) => onResolveDraftChange({ resolutionNote: event.target.value })}
        />
        <Textarea
          aria-label={moderationMessages.rejectionNoteLabel}
          className="min-h-24"
          value={resolveDraft.rejectionNote}
          placeholder={moderationMessages.rejectionNotePlaceholder}
          onChange={(event) => onResolveDraftChange({ rejectionNote: event.target.value })}
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={onResolveCase} disabled={Boolean(busyAction) || !selectedCase}>
            {busyAction === "resolve-case" ? moderationMessages.resolvingAction : moderationMessages.resolveAction}
          </Button>
          <Button variant="outline" onClick={onRejectCase} disabled={Boolean(busyAction) || !selectedCase}>
            {busyAction === "reject-case" ? moderationMessages.rejectingAction : moderationMessages.rejectAction}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
