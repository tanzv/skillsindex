import { AdminEmptyBlock, AdminInsetBlock, AdminSectionCard, AdminSelectableRecordCard } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
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
  onOpenCaseDetail
}: {
  payload: ModerationCasesPayload;
  loading: boolean;
  selectedCase: ModerationCaseItem | null;
  onOpenCaseDetail: (caseId: number) => void;
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
          <AdminSelectableRecordCard
            key={item.id}
            selected={item.id === selectedCase?.id}
            data-testid={`moderation-case-card-${item.id}`}
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
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-[color:var(--ui-text-muted)]">{item.action || moderationMessages.queueNoAction}</div>
                <Button size="sm" variant="outline" onClick={() => onOpenCaseDetail(item.id)}>
                  {moderationMessages.openCaseDetailAction}
                </Button>
              </div>
            </div>
          </AdminSelectableRecordCard>
        ))}

        {!payload.items.length && !loading ? <AdminEmptyBlock>{moderationMessages.queueEmpty}</AdminEmptyBlock> : null}
      </CardContent>
    </Card>
  );
}

export function CreateModerationTriggerCard({
  loading,
  busyAction,
  onOpen
}: {
  loading: boolean;
  busyAction: string;
  onOpen: () => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <AdminSectionCard
      title={moderationMessages.createTitle}
      description={moderationMessages.createDescription}
      contentClassName="space-y-3"
    >
      <Button onClick={onOpen} disabled={Boolean(busyAction) || loading}>
        {moderationMessages.openCreateCaseAction}
      </Button>
    </AdminSectionCard>
  );
}

export function SelectedModerationCaseCard({
  selectedCase,
  reasonSummary,
  onOpenDetail
}: {
  selectedCase: ModerationCaseItem | null;
  reasonSummary: Array<{ reason: string; count: number }>;
  onOpenDetail?: () => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{moderationMessages.selectedCaseTitle}</CardTitle>
            <CardDescription>{moderationMessages.selectedCaseDescription}</CardDescription>
          </div>
          {onOpenDetail ? (
            <Button size="sm" variant="outline" onClick={onOpenDetail}>
              {moderationMessages.openCaseDetailAction}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
        <SelectedModerationCaseSummary selectedCase={selectedCase} reasonSummary={reasonSummary} />
      </CardContent>
    </Card>
  );
}

export function SelectedModerationCaseSummary({
  selectedCase,
  reasonSummary
}: {
  selectedCase: ModerationCaseItem | null;
  reasonSummary: Array<{ reason: string; count: number }>;
}) {
  const { locale, messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <div className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
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
    </div>
  );
}
