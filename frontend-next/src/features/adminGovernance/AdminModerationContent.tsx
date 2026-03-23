"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { ModerationCaseItem, ModerationCasesPayload } from "./moderationModel";
import type { CreateModerationDraft, ResolveModerationDraft } from "./AdminModerationForms";
import { CreateModerationCaseForm, ModerationDispositionForm } from "./AdminModerationForms";
import {
  CreateModerationTriggerCard,
  ModerationFiltersCard,
  ModerationQueueCard,
  SelectedModerationCaseCard,
  SelectedModerationCaseSummary,
  type ModerationQueryState
} from "./AdminModerationPanels";

interface AdminModerationContentProps {
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  metrics: Array<{ label: string; value: string }>;
  payload: ModerationCasesPayload;
  selectedCase: ModerationCaseItem | null;
  reasonSummary: Array<{ reason: string; count: number }>;
  query: ModerationQueryState;
  createDraft: CreateModerationDraft;
  resolveDraft: ResolveModerationDraft;
  createDrawerOpen: boolean;
  detailDrawerOpen: boolean;
  onRefresh: () => void;
  onResetFilters: () => void;
  onQueryChange: (patch: Partial<ModerationQueryState>) => void;
  onOpenCreateDrawer: () => void;
  onCloseCreateDrawer: () => void;
  onOpenCaseDetail: (caseId: number) => void;
  onCloseCaseDetail: () => void;
  onCreateDraftChange: (patch: Partial<CreateModerationDraft>) => void;
  onResolveDraftChange: (patch: Partial<ResolveModerationDraft>) => void;
  onCreateCase: () => void;
  onResolveCase: () => void;
  onRejectCase: () => void;
}

export function AdminModerationContent({
  loading,
  busyAction,
  error,
  message,
  metrics,
  payload,
  selectedCase,
  reasonSummary,
  query,
  createDraft,
  resolveDraft,
  createDrawerOpen,
  detailDrawerOpen,
  onRefresh,
  onResetFilters,
  onQueryChange,
  onOpenCreateDrawer,
  onCloseCreateDrawer,
  onOpenCaseDetail,
  onCloseCaseDetail,
  onCreateDraftChange,
  onResolveDraftChange,
  onCreateCase,
  onResolveCase,
  onRejectCase
}: AdminModerationContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const moderationMessages = messages.adminModeration;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={moderationMessages.pageTitle}
      description={moderationMessages.pageDescription}
      actions={
        <>
          <Button variant="outline" onClick={onResetFilters}>
            {moderationMessages.resetFilters}
          </Button>
          <Button onClick={onRefresh} disabled={loading}>
            {loading ? commonMessages.refreshing : commonMessages.refresh}
          </Button>
        </>
      }
      metrics={metrics}
      error={error}
      message={message}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ModerationFiltersCard query={query} onQueryChange={onQueryChange} />
          <ModerationQueueCard
            payload={payload}
            loading={loading}
            selectedCase={selectedCase}
            onOpenCaseDetail={onOpenCaseDetail}
          />
        </div>

        <div className="space-y-6">
          <CreateModerationTriggerCard busyAction={busyAction} loading={loading} onOpen={onOpenCreateDrawer} />
          <SelectedModerationCaseCard
            selectedCase={selectedCase}
            reasonSummary={reasonSummary}
            onOpenDetail={selectedCase ? () => onOpenCaseDetail(selectedCase.id) : undefined}
          />
        </div>
      </div>

      <DetailFormSurface
        open={createDrawerOpen}
        variant="drawer"
        size="default"
        title={moderationMessages.createTitle}
        description={moderationMessages.createDescription}
        closeLabel={moderationMessages.closePanelAction}
        onClose={onCloseCreateDrawer}
      >
        <CreateModerationCaseForm
          createDraft={createDraft}
          busyAction={busyAction}
          onCreateDraftChange={onCreateDraftChange}
          onCreateCase={onCreateCase}
        />
      </DetailFormSurface>

      <DetailFormSurface
        open={detailDrawerOpen && Boolean(selectedCase)}
        variant="drawer"
        size="default"
        title={
          selectedCase
            ? moderationMessages.queueCasePrefix.replace("{caseId}", String(selectedCase.id))
            : moderationMessages.selectedCaseTitle
        }
        description={moderationMessages.selectedCaseDescription}
        closeLabel={moderationMessages.closePanelAction}
        onClose={onCloseCaseDetail}
      >
        {selectedCase ? (
          <div className="space-y-6">
            <SelectedModerationCaseSummary selectedCase={selectedCase} reasonSummary={reasonSummary} />
            <ModerationDispositionForm
              resolveDraft={resolveDraft}
              busyAction={busyAction}
              selectedCase={selectedCase}
              onResolveDraftChange={onResolveDraftChange}
              onResolveCase={onResolveCase}
              onRejectCase={onRejectCase}
            />
          </div>
        ) : null}
      </DetailFormSurface>
    </AdminPageScaffold>
  );
}
