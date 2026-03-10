import { Button, Input, Select, Switch, Tag } from "antd";
import type { Dispatch, SetStateAction } from "react";

import type { AppLocale } from "../../lib/i18n";
import type { RecordsSyncCenterCopy } from "./RecordsSyncCenterPage.copy";
import type { SyncPolicyRecord, SyncRunDetailSummary, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import {
  RecordsSyncCardHeader,
  RecordsSyncCodeBlock,
  RecordsSyncDefinitionItem,
  RecordsSyncDefinitionLabel,
  RecordsSyncDefinitionList,
  RecordsSyncDefinitionValue,
  RecordsSyncEmptyState,
  RecordsSyncField,
  RecordsSyncFieldGrid,
  RecordsSyncFieldLabel,
  RecordsSyncFilterGrid,
  RecordsSyncMetaGrid,
  RecordsSyncMetaItem,
  RecordsSyncMetaLabel,
  RecordsSyncMetaValue,
  RecordsSyncRunHeader,
  RecordsSyncRunList,
  RecordsSyncRunRow,
  RecordsSyncRunTitle,
  RecordsSyncStack,
  RecordsSyncStatChip,
  RecordsSyncStatRow,
  RecordsSyncTagRow,
  RecordsSyncErrorLine
} from "./RecordsSyncCenterPageContent.styles";
import { parseDate, statusColor } from "./RecordsSyncCenterPage.helpers";
import {
  WorkspaceActionCluster,
  WorkspaceActionClusterTitle,
  WorkspaceInlineMetricGrid,
  WorkspaceInlineMetricItem,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQuickActionGrid,
  WorkspaceActionRow,
  WorkspaceSubpageGrid,
  WorkspaceSubpageRail
} from "../workspace/WorkspaceCenterPage.styles";
import WorkspaceSurfaceCard from "../workspace/WorkspaceSurfaceCard";

interface RecordsSyncCenterPageContentProps {
  locale: AppLocale;
  text: RecordsSyncCenterCopy;
  adminBase: string;
  ownerFilter: string;
  onOwnerFilterChange: (nextValue: string) => void;
  limit: string;
  onLimitChange: (nextValue: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  runs: SyncRunRecord[];
  selectedRunID: number;
  onSelectRun: (runID: number) => void;
  detailSummary: SyncRunDetailSummary;
  detailPayload: Record<string, unknown> | null;
  policy: SyncPolicyRecord;
  setPolicy: Dispatch<SetStateAction<SyncPolicyRecord>>;
  onSavePolicy: () => void;
  savingPolicy: boolean;
  onNavigate: (path: string) => void;
}

const limitOptions = ["20", "40", "80", "120", "200"].map((value) => ({ label: value, value }));
const batchSizeOptions = ["10", "20", "50", "100"].map((value) => ({ label: value, value }));

function formatDuration(value: string, fallback: string): string {
  return value === fallback ? fallback : `${value} ms`;
}

function formatRunTimestamp(value: string, locale: AppLocale, fallback: string): string {
  return parseDate(value, locale, fallback);
}

export default function RecordsSyncCenterPageContent({
  locale,
  text,
  adminBase,
  ownerFilter,
  onOwnerFilterChange,
  limit,
  onLimitChange,
  onRefresh,
  refreshing,
  runs,
  selectedRunID,
  onSelectRun,
  detailSummary,
  detailPayload,
  policy,
  setPolicy,
  onSavePolicy,
  savingPolicy,
  onNavigate
}: RecordsSyncCenterPageContentProps) {
  const selectedRun = runs.find((run) => run.id === selectedRunID) || null;

  return (
    <WorkspaceSubpageGrid>
      <RecordsSyncStack>
        <WorkspaceSurfaceCard tone="panel">
          <RecordsSyncCardHeader>
            <WorkspacePanelHeading>{text.runList}</WorkspacePanelHeading>
            <WorkspaceMutedText>{text.runListHint}</WorkspaceMutedText>
            <WorkspaceMutedText>{selectedRun ? `#${selectedRun.id} · ${selectedRun.scope || text.unknown}` : text.noSelectedRun}</WorkspaceMutedText>
          </RecordsSyncCardHeader>

          <RecordsSyncFilterGrid>
            <RecordsSyncField>
              <RecordsSyncFieldLabel>{text.ownerFilter}</RecordsSyncFieldLabel>
              <Input value={ownerFilter} placeholder={text.ownerFilterPlaceholder} onChange={(event) => onOwnerFilterChange(event.target.value)} />
            </RecordsSyncField>
            <RecordsSyncField>
              <RecordsSyncFieldLabel>{text.limit}</RecordsSyncFieldLabel>
              <Select value={limit} options={limitOptions} onChange={(value) => onLimitChange(String(value))} />
            </RecordsSyncField>
            <Button type="primary" onClick={onRefresh} loading={refreshing}>
              {text.applyFilters}
            </Button>
          </RecordsSyncFilterGrid>

          {runs.length === 0 ? (
            <RecordsSyncEmptyState>{text.noRuns}</RecordsSyncEmptyState>
          ) : (
            <RecordsSyncRunList>
            {runs.map((run) => {
              const isActive = run.id === selectedRunID;
              const runDuration = `${Math.round(run.duration_ms)} ms`;

              return (
                <RecordsSyncRunRow key={run.id} $active={isActive}>
                  <RecordsSyncRunHeader>
                    <div>
                      <RecordsSyncRunTitle>#{run.id}</RecordsSyncRunTitle>
                      <WorkspaceMutedText>{`${text.scope}: ${run.scope || text.unknown}`}</WorkspaceMutedText>
                    </div>
                    <RecordsSyncTagRow>
                      <Tag color={statusColor(run.status)}>{run.status || text.unknown}</Tag>
                      <Tag>{runDuration}</Tag>
                    </RecordsSyncTagRow>
                  </RecordsSyncRunHeader>

                  <RecordsSyncMetaGrid>
                    <RecordsSyncMetaItem>
                      <RecordsSyncMetaLabel>{text.trigger}</RecordsSyncMetaLabel>
                      <RecordsSyncMetaValue>{run.trigger || text.unknown}</RecordsSyncMetaValue>
                    </RecordsSyncMetaItem>
                    <RecordsSyncMetaItem>
                      <RecordsSyncMetaLabel>{text.owner}</RecordsSyncMetaLabel>
                      <RecordsSyncMetaValue>{run.owner_username || text.unknown}</RecordsSyncMetaValue>
                    </RecordsSyncMetaItem>
                    <RecordsSyncMetaItem>
                      <RecordsSyncMetaLabel>{text.actor}</RecordsSyncMetaLabel>
                      <RecordsSyncMetaValue>{run.actor_username || text.unknown}</RecordsSyncMetaValue>
                    </RecordsSyncMetaItem>
                    <RecordsSyncMetaItem>
                      <RecordsSyncMetaLabel>{text.started}</RecordsSyncMetaLabel>
                      <RecordsSyncMetaValue>{formatRunTimestamp(run.started_at, locale, text.unknown)}</RecordsSyncMetaValue>
                    </RecordsSyncMetaItem>
                    <RecordsSyncMetaItem>
                      <RecordsSyncMetaLabel>{text.finished}</RecordsSyncMetaLabel>
                      <RecordsSyncMetaValue>{formatRunTimestamp(run.finished_at, locale, text.unknown)}</RecordsSyncMetaValue>
                    </RecordsSyncMetaItem>
                  </RecordsSyncMetaGrid>

                  <RecordsSyncStatRow>
                    <RecordsSyncStatChip>
                      {text.candidates}: {run.candidates}
                    </RecordsSyncStatChip>
                    <RecordsSyncStatChip>
                      {text.synced}: {run.synced}
                    </RecordsSyncStatChip>
                    <RecordsSyncStatChip>
                      {text.failed}: {run.failed}
                    </RecordsSyncStatChip>
                  </RecordsSyncStatRow>

                    {run.error_summary ? (
                      <RecordsSyncErrorLine>
                        {text.lastError}: {run.error_summary}
                      </RecordsSyncErrorLine>
                    ) : null}

                  <WorkspaceActionRow>
                    <Button size="small" type={isActive ? "primary" : "default"} onClick={() => onSelectRun(run.id)}>
                      {text.openDetail}
                    </Button>
                  </WorkspaceActionRow>
                </RecordsSyncRunRow>
              );
            })}
            </RecordsSyncRunList>
          )}
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="panel">
          <RecordsSyncCardHeader>
            <WorkspacePanelHeading>{text.runDetail}</WorkspacePanelHeading>
            <WorkspaceMutedText>{text.runDetailHint}</WorkspaceMutedText>
          </RecordsSyncCardHeader>
          <WorkspaceInlineMetricGrid>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.status}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{detailSummary.status}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.duration}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{formatDuration(detailSummary.durationMs, text.unknown)}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.started}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{detailSummary.started}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.finished}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{detailSummary.finished}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
          </WorkspaceInlineMetricGrid>
          <RecordsSyncField>
            <RecordsSyncFieldLabel>{text.detailsJSON}</RecordsSyncFieldLabel>
            <RecordsSyncCodeBlock>{JSON.stringify(detailPayload || {}, null, 2)}</RecordsSyncCodeBlock>
          </RecordsSyncField>
        </WorkspaceSurfaceCard>
      </RecordsSyncStack>

      <WorkspaceSubpageRail>
        <WorkspaceSurfaceCard tone="panel">
          <RecordsSyncCardHeader>
            <WorkspacePanelHeading>{text.policy}</WorkspacePanelHeading>
            <WorkspaceMutedText>{text.policyHint}</WorkspaceMutedText>
          </RecordsSyncCardHeader>
          <RecordsSyncFieldGrid>
            <RecordsSyncField>
              <RecordsSyncFieldLabel>{text.enabled}</RecordsSyncFieldLabel>
              <Switch checked={policy.enabled} onChange={(value) => setPolicy((previous) => ({ ...previous, enabled: value }))} />
            </RecordsSyncField>
            <RecordsSyncField>
              <RecordsSyncFieldLabel>{text.batchSize}</RecordsSyncFieldLabel>
              <Select
                value={String(policy.batch_size)}
                options={batchSizeOptions}
                onChange={(value) =>
                  setPolicy((previous) => ({
                    ...previous,
                    batch_size: Number(value)
                  }))
                }
              />
            </RecordsSyncField>
            <RecordsSyncField>
              <RecordsSyncFieldLabel>{text.interval}</RecordsSyncFieldLabel>
              <Input
                value={policy.interval}
                placeholder={text.intervalPlaceholder}
                onChange={(event) => setPolicy((previous) => ({ ...previous, interval: event.target.value }))}
              />
            </RecordsSyncField>
            <RecordsSyncField>
              <RecordsSyncFieldLabel>{text.timeout}</RecordsSyncFieldLabel>
              <Input
                value={policy.timeout}
                placeholder={text.timeoutPlaceholder}
                onChange={(event) => setPolicy((previous) => ({ ...previous, timeout: event.target.value }))}
              />
            </RecordsSyncField>
          </RecordsSyncFieldGrid>
          <WorkspaceActionRow>
            <Button type="primary" onClick={onSavePolicy} loading={savingPolicy}>
              {text.savePolicy}
            </Button>
          </WorkspaceActionRow>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="panel">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.selectedRun}</WorkspaceActionClusterTitle>
            <WorkspaceMutedText>{selectedRun ? `#${selectedRun.id} · ${selectedRun.scope || text.unknown}` : text.noSelectedRun}</WorkspaceMutedText>
            <RecordsSyncDefinitionList>
              <RecordsSyncDefinitionItem>
                <RecordsSyncDefinitionLabel>{text.status}</RecordsSyncDefinitionLabel>
                <RecordsSyncDefinitionValue>{detailSummary.status}</RecordsSyncDefinitionValue>
              </RecordsSyncDefinitionItem>
              <RecordsSyncDefinitionItem>
                <RecordsSyncDefinitionLabel>{text.duration}</RecordsSyncDefinitionLabel>
                <RecordsSyncDefinitionValue>{formatDuration(detailSummary.durationMs, text.unknown)}</RecordsSyncDefinitionValue>
              </RecordsSyncDefinitionItem>
              <RecordsSyncDefinitionItem>
                <RecordsSyncDefinitionLabel>{text.owner}</RecordsSyncDefinitionLabel>
                <RecordsSyncDefinitionValue>{selectedRun?.owner_username || text.unknown}</RecordsSyncDefinitionValue>
              </RecordsSyncDefinitionItem>
              <RecordsSyncDefinitionItem>
                <RecordsSyncDefinitionLabel>{text.actor}</RecordsSyncDefinitionLabel>
                <RecordsSyncDefinitionValue>{selectedRun?.actor_username || text.unknown}</RecordsSyncDefinitionValue>
              </RecordsSyncDefinitionItem>
            </RecordsSyncDefinitionList>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="quick">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.quickActions}</WorkspaceActionClusterTitle>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(`${adminBase}/records/imports`)}>{text.quickActionImports}</Button>
              <Button onClick={() => onNavigate(`${adminBase}/records/sync-jobs`)}>{text.quickActionSyncJobs}</Button>
              <Button onClick={() => onNavigate(`${adminBase}/records/exports`)}>{text.quickActionExports}</Button>
              <Button onClick={() => onNavigate(`${adminBase}/ops/metrics`)}>{text.quickActionOpsMetrics}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>
      </WorkspaceSubpageRail>
    </WorkspaceSubpageGrid>
  );
}
