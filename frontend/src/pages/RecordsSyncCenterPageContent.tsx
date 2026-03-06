import { Button, Card, Input, Select, Space, Switch, Tag, Typography } from "antd";
import type { Dispatch, SetStateAction } from "react";

import type { PrototypePagePalette } from "./prototypePageTheme";
import type { SyncPolicyRecord, SyncRunDetailSummary, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import {
  PrototypeCodeBlock,
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeFieldLabel,
  PrototypeFormLabel,
  PrototypeInlineForm,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeSideLinks,
  PrototypeStack
} from "./prototypeCssInJs";
import { statusColor } from "./RecordsSyncCenterPage.helpers";

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
  palette: PrototypePagePalette;
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

export default function RecordsSyncCenterPageContent({
  text,
  palette,
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
  return (
    <PrototypeDeckColumns>
      <PrototypeStack>
        <Card
          variant="borderless"
          style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
        >
          <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
            {text.runList}
          </Typography.Title>
          <PrototypeInlineForm>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.ownerFilter}</PrototypeFieldLabel>
              <Input value={ownerFilter} onChange={(event) => onOwnerFilterChange(event.target.value)} />
            </PrototypeFormLabel>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.limit}</PrototypeFieldLabel>
              <Input value={limit} onChange={(event) => onLimitChange(event.target.value)} />
            </PrototypeFormLabel>
            <Button onClick={onRefresh} loading={refreshing}>
              {text.apply}
            </Button>
          </PrototypeInlineForm>

          <PrototypeList>
            {runs.map((run) => (
              <PrototypeListRow key={run.id}>
                <PrototypeListMain>
                  <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.78rem" }}>
                    #{run.id} · {run.scope || text.unknown}
                  </Typography.Text>
                  <Typography.Text style={{ color: palette.cardText, fontSize: "0.72rem", lineHeight: 1.42 }}>
                    {run.trigger || text.unknown}
                  </Typography.Text>
                  <Typography.Text style={{ color: palette.cardText, fontSize: "0.72rem", lineHeight: 1.42 }}>
                    {run.owner_username || text.unknown} · {run.actor_username || text.unknown}
                  </Typography.Text>
                  <Typography.Text style={{ color: palette.cardText, fontSize: "0.72rem", lineHeight: 1.42 }}>
                    {run.candidates} / {run.synced} / {run.failed}
                  </Typography.Text>
                </PrototypeListMain>
                <PrototypeListActions>
                  <Tag color={statusColor(run.status)}>{run.status || text.unknown}</Tag>
                  <Tag>{Math.round(run.duration_ms)} ms</Tag>
                  <Button size="small" type={run.id === selectedRunID ? "primary" : "default"} onClick={() => onSelectRun(run.id)}>
                    {text.openDetail}
                  </Button>
                </PrototypeListActions>
              </PrototypeListRow>
            ))}
            {runs.length === 0 ? <PrototypeEmptyText>{text.noRuns}</PrototypeEmptyText> : null}
          </PrototypeList>
        </Card>

        <Card
          variant="borderless"
          style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
        >
          <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
            {text.runDetail}
          </Typography.Title>
          <PrototypeListRow>
            <PrototypeListMain>
              <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                {text.status}: {detailSummary.status}
              </Typography.Text>
              <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                {text.duration}: {detailSummary.durationMs} ms
              </Typography.Text>
              <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                {text.started}: {detailSummary.started}
              </Typography.Text>
              <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                {text.finished}: {detailSummary.finished}
              </Typography.Text>
            </PrototypeListMain>
          </PrototypeListRow>
          <Typography.Text
            style={{ color: "#b6d3f7", fontSize: "0.74rem", letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 700 }}
          >
            {text.detailsJSON}
          </Typography.Text>
          <PrototypeCodeBlock>{JSON.stringify(detailPayload || {}, null, 2)}</PrototypeCodeBlock>
        </Card>
      </PrototypeStack>

      <PrototypeStack>
        <Card
          variant="borderless"
          style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
        >
          <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
            {text.policy}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.78rem", lineHeight: 1.46 }}>
            {text.policyHint}
          </Typography.Paragraph>
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
          <Space wrap>
            <Button type="primary" onClick={onSavePolicy} loading={savingPolicy}>
              {text.savePolicy}
            </Button>
          </Space>
        </Card>

        <Card
          variant="borderless"
          style={{ borderRadius: 13, border: `1px solid ${palette.sideHighlightBorder}`, background: palette.sideHighlightBackground }}
          styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
        >
          <Typography.Title level={4} style={{ margin: 0, color: "#f3fbff", fontSize: "0.95rem" }}>
            {text.quickActions}
          </Typography.Title>
          <PrototypeSideLinks>
            <Button onClick={() => onNavigate(`${adminBase}/records/imports`)}>Imports</Button>
            <Button onClick={() => onNavigate(`${adminBase}/records/sync-jobs`)}>Sync Jobs</Button>
            <Button onClick={() => onNavigate(`${adminBase}/records/exports`)}>Exports</Button>
            <Button onClick={() => onNavigate(`${adminBase}/ops/metrics`)}>Ops Metrics</Button>
          </PrototypeSideLinks>
        </Card>
      </PrototypeStack>
    </PrototypeDeckColumns>
  );
}
