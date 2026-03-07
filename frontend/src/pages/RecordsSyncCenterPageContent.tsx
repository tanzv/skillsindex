import { Button, Input, Select, Switch, Tag, Typography } from "antd";
import type { Dispatch, SetStateAction } from "react";

import type { SyncPolicyRecord, SyncRunDetailSummary, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import {
  PrototypeFieldLabel,
  PrototypeFormLabel,
  PrototypeInlineForm,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeStack
} from "./prototypeCssInJs";
import { statusColor } from "./RecordsSyncCenterPage.helpers";
import {
  WorkspaceActionCluster,
  WorkspaceActionClusterTitle,
  WorkspaceCodeBlock,
  WorkspaceInlineMetricGrid,
  WorkspaceInlineMetricItem,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQuickActionGrid,
  WorkspaceSubpageGrid,
  WorkspaceSubpageRail
} from "./WorkspaceCenterPage.styles";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

interface RecordsSyncCenterPageContentText {
  apply: string;
  limit: string;
  ownerFilter: string;
  runList: string;
  runDetail: string;
  noRuns: string;
  status: string;
  duration: string;
  started: string;
  finished: string;
  unknown: string;
  openDetail: string;
  detailsJSON: string;
  policy: string;
  policyHint: string;
  enabled: string;
  interval: string;
  timeout: string;
  batchSize: string;
  savePolicy: string;
  quickActions: string;
}

interface RecordsSyncCenterPageContentProps {
  text: RecordsSyncCenterPageContentText;
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

const baseRunRowStyle = {
  background: "color-mix(in srgb, var(--si-color-muted-surface) 80%, transparent)",
  borderColor: "color-mix(in srgb, var(--si-color-border) 70%, transparent)",
  boxShadow: "none"
} as const;

const activeRunRowStyle = {
  background: "color-mix(in srgb, var(--si-color-accent) 10%, var(--si-color-surface) 90%)",
  borderColor: "color-mix(in srgb, var(--si-color-accent) 32%, var(--si-color-border) 68%)",
  boxShadow: "none"
} as const;

const detailCodeBlockStyle = {
  maxHeight: "220px",
  overflow: "auto"
} as const;

export default function RecordsSyncCenterPageContent({
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
      <PrototypeStack>
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.runList}</WorkspacePanelHeading>
          <WorkspaceMutedText>{selectedRun ? `#${selectedRun.id} · ${selectedRun.scope || text.unknown}` : text.noRuns}</WorkspaceMutedText>

          <PrototypeInlineForm>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.ownerFilter}</PrototypeFieldLabel>
              <Input value={ownerFilter} onChange={(event) => onOwnerFilterChange(event.target.value)} />
            </PrototypeFormLabel>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.limit}</PrototypeFieldLabel>
              <Input value={limit} onChange={(event) => onLimitChange(event.target.value)} />
            </PrototypeFormLabel>
            <Button type="primary" onClick={onRefresh} loading={refreshing}>
              {text.apply}
            </Button>
          </PrototypeInlineForm>

          <PrototypeList>
            {runs.map((run) => {
              const isActive = run.id === selectedRunID;
              return (
                <PrototypeListRow key={run.id} style={isActive ? activeRunRowStyle : baseRunRowStyle}>
                  <PrototypeListMain>
                    <Typography.Text strong style={{ color: "var(--si-color-text-primary)", fontSize: "0.8rem" }}>
                      #{run.id} · {run.scope || text.unknown}
                    </Typography.Text>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.73rem", lineHeight: 1.48 }}>
                      {run.trigger || text.unknown}
                    </Typography.Text>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.73rem", lineHeight: 1.48 }}>
                      {run.owner_username || text.unknown} · {run.actor_username || text.unknown}
                    </Typography.Text>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.73rem", lineHeight: 1.48 }}>
                      {run.candidates} / {run.synced} / {run.failed}
                    </Typography.Text>
                    {run.error_summary ? (
                      <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.72rem", lineHeight: 1.48 }}>
                        {run.error_summary}
                      </Typography.Text>
                    ) : null}
                  </PrototypeListMain>
                  <PrototypeListActions>
                    <Tag color={statusColor(run.status)}>{run.status || text.unknown}</Tag>
                    <Tag>{Math.round(run.duration_ms)} ms</Tag>
                    <Button size="small" type={isActive ? "primary" : "default"} onClick={() => onSelectRun(run.id)}>
                      {text.openDetail}
                    </Button>
                  </PrototypeListActions>
                </PrototypeListRow>
              );
            })}
            {runs.length === 0 ? <WorkspaceMutedText>{text.noRuns}</WorkspaceMutedText> : null}
          </PrototypeList>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.runDetail}</WorkspacePanelHeading>
          <WorkspaceInlineMetricGrid>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.status}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{detailSummary.status}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.duration}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{`${detailSummary.durationMs} ms`}</WorkspaceMetricValue>
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
          <PrototypeFormLabel>
            <PrototypeFieldLabel>{text.detailsJSON}</PrototypeFieldLabel>
            <WorkspaceCodeBlock style={detailCodeBlockStyle}>{JSON.stringify(detailPayload || {}, null, 2)}</WorkspaceCodeBlock>
          </PrototypeFormLabel>
        </WorkspaceSurfaceCard>
      </PrototypeStack>

      <WorkspaceSubpageRail>
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePanelHeading>{text.policy}</WorkspacePanelHeading>
          <WorkspaceMutedText>{text.policyHint}</WorkspaceMutedText>
          <PrototypeFormLabel>
            <PrototypeFieldLabel>{text.enabled}</PrototypeFieldLabel>
            <Switch checked={policy.enabled} onChange={(value) => setPolicy((previous) => ({ ...previous, enabled: value }))} />
          </PrototypeFormLabel>
          <PrototypeFormLabel>
            <PrototypeFieldLabel>{text.interval}</PrototypeFieldLabel>
            <Input value={policy.interval} onChange={(event) => setPolicy((previous) => ({ ...previous, interval: event.target.value }))} placeholder="30m" />
          </PrototypeFormLabel>
          <PrototypeFormLabel>
            <PrototypeFieldLabel>{text.timeout}</PrototypeFieldLabel>
            <Input value={policy.timeout} onChange={(event) => setPolicy((previous) => ({ ...previous, timeout: event.target.value }))} placeholder="10m" />
          </PrototypeFormLabel>
          <PrototypeFormLabel>
            <PrototypeFieldLabel>{text.batchSize}</PrototypeFieldLabel>
            <Select
              value={String(policy.batch_size)}
              options={[
                { label: "10", value: "10" },
                { label: "20", value: "20" },
                { label: "50", value: "50" },
                { label: "100", value: "100" }
              ]}
              onChange={(value) =>
                setPolicy((previous) => ({
                  ...previous,
                  batch_size: Number(value)
                }))
              }
            />
          </PrototypeFormLabel>
          <Button type="primary" onClick={onSavePolicy} loading={savingPolicy}>
            {text.savePolicy}
          </Button>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="panel">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.runDetail}</WorkspaceActionClusterTitle>
            <WorkspaceMutedText>{selectedRun ? `#${selectedRun.id} · ${selectedRun.scope || text.unknown}` : text.noRuns}</WorkspaceMutedText>
            <WorkspaceInlineMetricGrid>
              <WorkspaceInlineMetricItem>
                <WorkspaceMetricLabel>{text.status}</WorkspaceMetricLabel>
                <WorkspaceMetricValue>{detailSummary.status}</WorkspaceMetricValue>
              </WorkspaceInlineMetricItem>
              <WorkspaceInlineMetricItem>
                <WorkspaceMetricLabel>{text.duration}</WorkspaceMetricLabel>
                <WorkspaceMetricValue>{`${detailSummary.durationMs} ms`}</WorkspaceMetricValue>
              </WorkspaceInlineMetricItem>
            </WorkspaceInlineMetricGrid>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>

        <WorkspaceSurfaceCard tone="quick">
          <WorkspaceActionCluster>
            <WorkspaceActionClusterTitle>{text.quickActions}</WorkspaceActionClusterTitle>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(`${adminBase}/records/imports`)}>Imports</Button>
              <Button onClick={() => onNavigate(`${adminBase}/records/sync-jobs`)}>Sync Jobs</Button>
              <Button onClick={() => onNavigate(`${adminBase}/records/exports`)}>Exports</Button>
              <Button onClick={() => onNavigate(`${adminBase}/ops/metrics`)}>Ops Metrics</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceActionCluster>
        </WorkspaceSurfaceCard>
      </WorkspaceSubpageRail>
    </WorkspaceSubpageGrid>
  );
}
