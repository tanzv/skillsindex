import {
  AdminEmptyBlock,
  AdminInsetBlock,
  AdminRecordCard,
  AdminSectionCard
} from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import { buildOpsRecordChips, type OpsDisplayChip } from "./display";
import type {
  OpsBackupPlanItem,
  OpsBackupRunItem,
  OpsChangeApprovalItem,
  OpsRecoveryDrillRecordItem,
  OpsReleaseItem
} from "./types";
import type { RecordsDraft, RecordsFormField, RecordsRoute } from "./records-config";

type RecordsLedgerRow =
  | OpsRecoveryDrillRecordItem
  | OpsReleaseItem
  | OpsChangeApprovalItem
  | OpsBackupPlanItem
  | OpsBackupRunItem;

export interface OperationsRecordDetailState {
  index: number;
  chips: OpsDisplayChip[];
  rawValue: string | null;
}

export function OperationsRecordsLedgerPanel({
  route,
  ledgerTitle,
  ledgerDescription,
  rows,
  onOpenDetail
}: {
  route: RecordsRoute;
  ledgerTitle: string;
  ledgerDescription: string;
  rows: Array<string | RecordsLedgerRow>;
  onOpenDetail: (detail: OperationsRecordDetailState) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const operationsMessages = messages.adminOperations;

  function handleOpenDetail(row: string | RecordsLedgerRow, index: number) {
    if (typeof row === "string") {
      onOpenDetail({
        index,
        chips: [],
        rawValue: row
      });
      return;
    }

    onOpenDetail({
      index,
      chips: buildOpsRecordChips(route, row, locale, operationsMessages),
      rawValue: null
    });
  }

  return (
    <AdminSectionCard title={ledgerTitle} description={ledgerDescription} contentClassName="space-y-3">
      <div className="space-y-3" data-testid="ops-records-ledger">
        <div className="space-y-3" data-testid="ops-records-rows">
        {rows.map((row, index) => (
          <AdminRecordCard key={`row-${index}`} data-testid={`ops-record-row-${index}`}>
            <div className="space-y-3">
              {typeof row === "string" ? (
                <div className="overflow-x-auto rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-4 font-mono text-xs text-[color:var(--ui-text-secondary)]">
                  {row}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {buildOpsRecordChips(route, row, locale, operationsMessages).map((chip, chipIndex) => (
                    <span
                      key={`${index}-${chipIndex}-${chip.label}`}
                      className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]"
                    >
                      {`${chip.label}: ${chip.value}`}
                    </span>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={() => handleOpenDetail(row, index)}>
                {operationsMessages.openRecordDetailAction}
              </Button>
            </div>
          </AdminRecordCard>
        ))}
        </div>

        {rows.length === 0 ? <AdminEmptyBlock>{operationsMessages.noRecords}</AdminEmptyBlock> : null}
      </div>
    </AdminSectionCard>
  );
}

export function OperationsRecordEntryForm({
  fields,
  draft,
  busy,
  onDraftChange,
  onSubmit
}: {
  fields: RecordsFormField[];
  draft: RecordsDraft;
  busy: boolean;
  onDraftChange: (key: string, value: string) => void;
  onSubmit: () => void;
}) {
  const { messages } = useProtectedI18n();
  const operationsMessages = messages.adminOperations;

  function renderField(field: RecordsFormField) {
    if (field.inputType === "checkbox") {
      return (
        <label
          key={field.key}
          className="flex items-center gap-3 rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-3 py-2 text-sm text-[color:var(--ui-text-secondary)]"
        >
          <Checkbox
            aria-label={field.label}
            checked={draft[field.key] === "true"}
            data-testid={field.testId}
            onCheckedChange={(checked) => onDraftChange(field.key, checked ? "true" : "false")}
          />
          <span>{field.label}</span>
        </label>
      );
    }

    if (field.inputType === "select") {
      return (
        <Select
          key={field.key}
          value={draft[field.key] || field.options?.[0]?.value || ""}
          aria-label={field.label}
          data-testid={field.testId}
          onChange={(event) => onDraftChange(field.key, event.target.value)}
        >
          {(field.options || []).map((option) => (
            <option key={`${field.key}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }

    return (
      <Input
        key={field.key}
        type={field.inputType}
        value={draft[field.key] || ""}
        aria-label={field.label}
        placeholder={field.placeholder}
        data-testid={field.testId}
        onChange={(event) => onDraftChange(field.key, event.target.value)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => renderField(field))}
      <Button onClick={onSubmit} disabled={busy}>
        {busy ? operationsMessages.savingRecordAction : operationsMessages.saveRecordAction}
      </Button>
    </div>
  );
}

export function OperationsRecordDetailSummary({
  detail
}: {
  detail: OperationsRecordDetailState | null;
}) {
  const { messages } = useProtectedI18n();
  const operationsMessages = messages.adminOperations;

  if (!detail) {
    return <AdminEmptyBlock>{operationsMessages.noRecords}</AdminEmptyBlock>;
  }

  if (detail.rawValue !== null) {
    return (
      <div className="space-y-3">
        <AdminInsetBlock>
          <div className="font-semibold text-[color:var(--ui-text-primary)]">{operationsMessages.rawRecordDetailTitle}</div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-[color:var(--ui-text-secondary)]">
            {detail.rawValue}
          </pre>
        </AdminInsetBlock>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {detail.chips.map((chip) => (
        <AdminInsetBlock key={`${chip.label}-${chip.value}`}>
          <div className="font-semibold text-[color:var(--ui-text-primary)]">{chip.label}</div>
          <div className="mt-1 text-sm text-[color:var(--ui-text-secondary)]">{chip.value}</div>
        </AdminInsetBlock>
      ))}
    </div>
  );
}

export function OperationsEndpointStatusPanel({
  endpoint,
  createEndpoint
}: {
  endpoint: string;
  createEndpoint?: string;
}) {
  const { messages } = useProtectedI18n();
  const operationsMessages = messages.adminOperations;

  return (
    <AdminSectionCard
      title={operationsMessages.endpointStatusTitle}
      description={operationsMessages.endpointStatusDescription}
      contentClassName="space-y-3 text-sm text-[color:var(--ui-text-secondary)]"
    >
      <AdminInsetBlock>{endpoint}</AdminInsetBlock>
      {createEndpoint ? <AdminInsetBlock>{createEndpoint}</AdminInsetBlock> : null}
    </AdminSectionCard>
  );
}
