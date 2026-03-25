"use client";

import { AdminMessageBanner, AdminMetricGrid } from "@/src/components/admin/AdminPrimitives";
import { AdminDetailDrawer } from "@/src/components/admin/AdminOverlaySurface";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import {
  OperationsEndpointStatusPanel,
  OperationsRecordDetailSummary,
  OperationsRecordEntryForm,
  OperationsRecordsLedgerPanel,
  type OperationsRecordDetailState
} from "./AdminOperationsRecordsPanels";
import type { RecordsDraft, RecordsFormField, RecordsRoute } from "./records-config";
import type {
  OpsBackupPlanItem,
  OpsBackupRunItem,
  OpsChangeApprovalItem,
  OpsRecoveryDrillRecordItem,
  OpsReleaseItem
} from "./types";

type RecordsLedgerRow =
  | OpsRecoveryDrillRecordItem
  | OpsReleaseItem
  | OpsChangeApprovalItem
  | OpsBackupPlanItem
  | OpsBackupRunItem;

export function AdminOperationsRecordsContent({
  route,
  title,
  description,
  loading,
  busyAction,
  error,
  message,
  metrics,
  rows,
  endpoint,
  createEndpoint,
  formFields,
  draft,
  activePane,
  selectedRecord,
  onRefresh,
  onOpenCreatePane,
  onClosePane,
  onOpenDetailPane,
  onDraftChange,
  onSubmitCreate
}: {
  route: RecordsRoute;
  title: string;
  description: string;
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  metrics: Array<{ label: string; value: string }>;
  rows: Array<string | RecordsLedgerRow>;
  endpoint: string;
  createEndpoint?: string;
  formFields: RecordsFormField[];
  draft: RecordsDraft;
  activePane: "idle" | "create" | "detail";
  selectedRecord: OperationsRecordDetailState | null;
  onRefresh: () => void;
  onOpenCreatePane: () => void;
  onClosePane: () => void;
  onOpenDetailPane: (detail: OperationsRecordDetailState) => void;
  onDraftChange: (key: string, value: string) => void;
  onSubmitCreate: () => void;
}) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const operationsMessages = messages.adminOperations;
  const ledgerTitle = `${title} ${operationsMessages.ledgerTitleSuffix}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={commonMessages.adminEyebrow}
        title={title}
        description={description}
        actions={
          <>
            {createEndpoint ? (
              <Button variant="outline" onClick={onOpenCreatePane}>
                {operationsMessages.openRecordEntryAction}
              </Button>
            ) : null}
            <Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>
          </>
        }
      />

      {error ? <ErrorState description={error} /> : null}
      {message ? <AdminMessageBanner message={message} /> : null}

      <div data-testid="ops-records-metrics">
        <AdminMetricGrid metrics={metrics} columnsClassName="grid gap-4 md:grid-cols-3" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <OperationsRecordsLedgerPanel
          route={route}
          ledgerTitle={ledgerTitle}
          ledgerDescription={operationsMessages.ledgerDescription}
          rows={rows}
          onOpenDetail={onOpenDetailPane}
        />
        <div className="space-y-6">
          {activePane === "create" ? (
            <AdminDetailDrawer
              open
              title={operationsMessages.recordEntryTitle}
              description={operationsMessages.recordEntryDescription}
              closeLabel={operationsMessages.closePanelAction}
              onClose={onClosePane}
              dataTestId="admin-ops-record-create-pane"
            >
              <OperationsRecordEntryForm
                fields={formFields}
                draft={draft}
                busy={busyAction === "submit-create"}
                onDraftChange={onDraftChange}
                onSubmit={onSubmitCreate}
              />
            </AdminDetailDrawer>
          ) : null}
          {activePane === "detail" ? (
            <AdminDetailDrawer
              open
              title={operationsMessages.recordDetailTitle}
              description={operationsMessages.recordDetailDescription}
              closeLabel={operationsMessages.closePanelAction}
              onClose={onClosePane}
              dataTestId="admin-ops-record-detail-pane"
            >
              <OperationsRecordDetailSummary detail={selectedRecord} />
            </AdminDetailDrawer>
          ) : null}
          <OperationsEndpointStatusPanel endpoint={endpoint} createEndpoint={createEndpoint} />
        </div>
      </div>
    </div>
  );
}
