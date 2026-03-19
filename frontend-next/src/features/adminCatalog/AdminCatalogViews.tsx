"use client";

import Link from "next/link";

import { AdminEmptyBlock } from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input as TextInput } from "@/src/components/ui/input";

import type { AdminCatalogRow, AdminCatalogViewModel, RepositorySyncPolicy } from "./model";
import { DetailCard, RowSelectionButton, SidePanels, useSelectedRow } from "./AdminCatalogShared";

export { QueryFilters } from "./AdminCatalogShared";

export function SkillsView({
  rows,
  busyAction,
  sidePanels,
  onSyncSkill
}: {
  rows: AdminCatalogRow[];
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onSyncSkill: (skillId: number) => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{adminCatalogMessages.skillsInventoryTitle}</CardTitle>
            <CardDescription>{adminCatalogMessages.skillsInventoryDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => (
              <RowSelectionButton
                key={row.id}
                row={row}
                selected={selectedRowId === row.id}
                buttonLabel={adminCatalogMessages.inspectAction}
                onSelect={() => setSelectedRowId(row.id)}
              >
                {row.syncable ? (
                  <Button size="sm" variant="outline" onClick={() => onSyncSkill(row.id)} disabled={Boolean(busyAction)}>
                    {busyAction === `sync-skill-${row.id}` ? adminCatalogMessages.syncingAction : adminCatalogMessages.syncNowAction}
                  </Button>
                ) : null}
              </RowSelectionButton>
            ))}
            {!rows.length ? <AdminEmptyBlock>{adminCatalogMessages.skillsEmpty}</AdminEmptyBlock> : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <DetailCard
          title={adminCatalogMessages.selectedSkillTitle}
          description={adminCatalogMessages.selectedSkillDescription}
          row={selectedRow}
          emptyText={adminCatalogMessages.selectedSkillEmpty}
          actions={
            selectedRow ? (
              <>
                {selectedRow.syncable ? (
                  <Button variant="outline" onClick={() => onSyncSkill(selectedRow.id)} disabled={Boolean(busyAction)}>
                    {busyAction === `sync-skill-${selectedRow.id}` ? adminCatalogMessages.syncingAction : adminCatalogMessages.syncNowAction}
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href={`/skills/${selectedRow.id}`}>{adminCatalogMessages.openSkillDetailAction}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/ingestion/repository">{adminCatalogMessages.openIntakeAction}</Link>
                </Button>
              </>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

export function JobsView({
  rows,
  busyAction,
  sidePanels,
  onRunJobAction
}: {
  rows: AdminCatalogRow[];
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{adminCatalogMessages.jobsQueueTitle}</CardTitle>
            <CardDescription>{adminCatalogMessages.jobsQueueDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => {
              const normalized = row.status.toLowerCase();
              const canRetry = normalized.includes("failed") || normalized.includes("canceled");
              const canCancel = normalized.includes("running") || normalized.includes("pending");

              return (
                <RowSelectionButton
                  key={row.id}
                  row={row}
                  selected={selectedRowId === row.id}
                  buttonLabel={adminCatalogMessages.inspectAction}
                  onSelect={() => setSelectedRowId(row.id)}
                >
                  {canRetry ? (
                    <Button size="sm" variant="outline" onClick={() => onRunJobAction(row.id, "retry")} disabled={Boolean(busyAction)}>
                      {busyAction === `retry-${row.id}` ? adminCatalogMessages.retryingAction : adminCatalogMessages.retryAction}
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button size="sm" variant="outline" onClick={() => onRunJobAction(row.id, "cancel")} disabled={Boolean(busyAction)}>
                      {busyAction === `cancel-${row.id}` ? adminCatalogMessages.cancelingAction : adminCatalogMessages.cancelAction}
                    </Button>
                  ) : null}
                </RowSelectionButton>
              );
            })}
            {!rows.length ? <AdminEmptyBlock>{adminCatalogMessages.jobsEmpty}</AdminEmptyBlock> : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <DetailCard
          title={adminCatalogMessages.selectedJobTitle}
          description={adminCatalogMessages.selectedJobDescription}
          row={selectedRow}
          emptyText={adminCatalogMessages.selectedJobEmpty}
          actions={
            selectedRow ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "retry")}
                  disabled={
                    Boolean(busyAction) ||
                    (!selectedRow.status.toLowerCase().includes("failed") && !selectedRow.status.toLowerCase().includes("canceled"))
                  }
                >
                  {adminCatalogMessages.retrySelectedAction}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "cancel")}
                  disabled={
                    Boolean(busyAction) ||
                    (!selectedRow.status.toLowerCase().includes("running") && !selectedRow.status.toLowerCase().includes("pending"))
                  }
                >
                  {adminCatalogMessages.cancelSelectedAction}
                </Button>
              </>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

export function SyncRunsView({
  rows,
  sidePanels
}: {
  rows: AdminCatalogRow[];
  sidePanels: AdminCatalogViewModel["sidePanel"];
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{adminCatalogMessages.syncRunsTitle}</CardTitle>
            <CardDescription>{adminCatalogMessages.syncRunsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => (
              <RowSelectionButton
                key={row.id}
                row={row}
                selected={selectedRowId === row.id}
                buttonLabel={adminCatalogMessages.inspectAction}
                onSelect={() => setSelectedRowId(row.id)}
              />
            ))}
            {!rows.length ? <AdminEmptyBlock>{adminCatalogMessages.syncRunsEmpty}</AdminEmptyBlock> : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <DetailCard
          title={adminCatalogMessages.selectedSyncRunTitle}
          description={adminCatalogMessages.selectedSyncRunDescription}
          row={selectedRow}
          emptyText={adminCatalogMessages.selectedSyncRunEmpty}
          actions={
            selectedRow ? (
              <Button asChild variant="outline">
                <Link href="/admin/sync-policy/repository">{adminCatalogMessages.openSyncPolicyAction}</Link>
              </Button>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

export function PolicyView({
  busyAction,
  sidePanels,
  metrics,
  policyDraft,
  onPolicyDraftChange,
  onResetPolicyDraft,
  onSavePolicy
}: {
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  metrics: AdminCatalogViewModel["metrics"];
  policyDraft: RepositorySyncPolicy;
  onPolicyDraftChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onResetPolicyDraft: () => void;
  onSavePolicy: () => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{adminCatalogMessages.policyEditorTitle}</CardTitle>
            <CardDescription>{adminCatalogMessages.policyEditorDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-3 py-3 text-sm text-[color:var(--ui-text-secondary)]">
              <input
                aria-label={adminCatalogMessages.schedulerEnabledLabel}
                type="checkbox"
                checked={policyDraft.enabled}
                onChange={(event) => onPolicyDraftChange({ enabled: event.target.checked })}
              />
              <span>{adminCatalogMessages.schedulerEnabledHelp}</span>
            </label>
            <TextInput
              value={policyDraft.interval}
              aria-label={adminCatalogMessages.intervalLabel}
              placeholder={adminCatalogMessages.intervalPlaceholder}
              onChange={(event) => onPolicyDraftChange({ interval: event.target.value })}
            />
            <TextInput
              value={policyDraft.timeout}
              aria-label={adminCatalogMessages.timeoutLabel}
              placeholder={adminCatalogMessages.timeoutPlaceholder}
              onChange={(event) => onPolicyDraftChange({ timeout: event.target.value })}
            />
            <TextInput
              type="number"
              value={String(policyDraft.batchSize)}
              aria-label={adminCatalogMessages.batchSizeLabel}
              placeholder={adminCatalogMessages.batchSizePlaceholder}
              onChange={(event) => onPolicyDraftChange({ batchSize: Number(event.target.value) || 0 })}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={onSavePolicy} disabled={busyAction === "save-policy"}>
                {busyAction === "save-policy" ? adminCatalogMessages.savingPolicyAction : adminCatalogMessages.savePolicyAction}
              </Button>
              <Button variant="outline" onClick={onResetPolicyDraft}>
                {adminCatalogMessages.resetDraftAction}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{adminCatalogMessages.policyPostureTitle}</CardTitle>
            <CardDescription>{adminCatalogMessages.policyPostureDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">{metric.label}</div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--ui-text-primary)]">{metric.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SidePanels panels={sidePanels} />
    </div>
  );
}
