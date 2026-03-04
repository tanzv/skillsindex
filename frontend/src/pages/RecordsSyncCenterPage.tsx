import { Alert, Button, Card, Input, Select, Space, Spin, Switch, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import {
  asRecord,
  buildSyncRunDetailSummary,
  parseDate,
  parseSyncPolicy,
  parseSyncRun,
  resolveAdminBase,
  statusColor
} from "./RecordsSyncCenterPage.helpers";
import type { RecordsSyncCenterPageProps, SyncPolicyRecord, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import {
  PrototypeCodeBlock,
  PrototypeDeckColumns,
  PrototypeEmptyText,
  PrototypeFieldLabel,
  PrototypeFormLabel,
  PrototypeHeaderLayout,
  PrototypeInlineForm,
  PrototypeList,
  PrototypeListActions,
  PrototypeListMain,
  PrototypeListRow,
  PrototypeLoadingCenter,
  PrototypeMetricGrid,
  PrototypePageGrid,
  PrototypeSideLinks,
  PrototypeStack
} from "./prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "./prototypePageTheme";

const copy = {
  en: {
    title: "Records Governance and Remote Sync",
    subtitle: "Track sync run history, inspect one run detail, and update scheduler policy.",
    loading: "Loading sync records",
    refresh: "Refresh",
    apply: "Apply Filters",
    openJobs: "Open Jobs",
    openPolicy: "Open Sync Policy",
    openExports: "Open Exports",
    ownerFilter: "Owner ID",
    limit: "Limit",
    runList: "Sync Run List",
    runDetail: "Run Detail",
    noRuns: "No sync run records",
    status: "Status",
    trigger: "Trigger",
    scope: "Scope",
    candidates: "Candidates",
    synced: "Synced",
    failed: "Failed",
    duration: "Duration",
    started: "Started",
    finished: "Finished",
    owner: "Owner",
    actor: "Actor",
    openDetail: "Open Detail",
    detailsJSON: "Details JSON",
    policy: "Repository Sync Policy",
    policyHint: "Update scheduler configuration used by repository synchronization.",
    enabled: "Enabled",
    interval: "Interval",
    timeout: "Timeout",
    batchSize: "Batch Size",
    savePolicy: "Save Policy",
    quickActions: "Quick Actions",
    recordsCount: "Run Records",
    failedCount: "Failed Runs",
    partialCount: "Partial Runs",
    policyState: "Policy State",
    enabledState: "enabled",
    disabledState: "disabled",
    saveSuccess: "Saved successfully",
    requestFailed: "Request failed",
    unknown: "n/a"
  },
  zh: {
    title: "\u8bb0\u5f55\u6cbb\u7406\u4e0e\u8fdc\u7a0b\u540c\u6b65",
    subtitle: "\u8ddf\u8e2a\u540c\u6b65\u8fd0\u884c\u8bb0\u5f55\u3001\u67e5\u770b\u5355\u6b21\u8be6\u60c5\u5e76\u66f4\u65b0\u8c03\u5ea6\u7b56\u7565\u3002",
    loading: "\u6b63\u5728\u52a0\u8f7d\u540c\u6b65\u8bb0\u5f55",
    refresh: "\u5237\u65b0",
    apply: "\u5e94\u7528\u8fc7\u6ee4",
    openJobs: "\u6253\u5f00\u4efb\u52a1\u5217\u8868",
    openPolicy: "\u6253\u5f00\u540c\u6b65\u7b56\u7565",
    openExports: "\u6253\u5f00\u5bfc\u51fa\u4e2d\u5fc3",
    ownerFilter: "\u6240\u6709\u8005 ID",
    limit: "\u9650\u5236",
    runList: "\u540c\u6b65\u8fd0\u884c\u5217\u8868",
    runDetail: "\u8fd0\u884c\u8be6\u60c5",
    noRuns: "\u6682\u65e0\u540c\u6b65\u8bb0\u5f55",
    status: "\u72b6\u6001",
    trigger: "\u89e6\u53d1\u65b9\u5f0f",
    scope: "\u8303\u56f4",
    candidates: "\u5019\u9009\u6570",
    synced: "\u6210\u529f\u6570",
    failed: "\u5931\u8d25\u6570",
    duration: "\u8017\u65f6",
    started: "\u5f00\u59cb",
    finished: "\u7ed3\u675f",
    owner: "\u6240\u6709\u8005",
    actor: "\u6267\u884c\u8005",
    openDetail: "\u6253\u5f00\u8be6\u60c5",
    detailsJSON: "\u8be6\u60c5 JSON",
    policy: "\u4ed3\u5e93\u540c\u6b65\u7b56\u7565",
    policyHint: "\u66f4\u65b0\u4ed3\u5e93\u540c\u6b65\u4f7f\u7528\u7684\u8c03\u5ea6\u53c2\u6570\u3002",
    enabled: "\u542f\u7528",
    interval: "\u95f4\u9694",
    timeout: "\u8d85\u65f6",
    batchSize: "\u6279\u91cf\u5927\u5c0f",
    savePolicy: "\u4fdd\u5b58\u7b56\u7565",
    quickActions: "\u5feb\u6377\u64cd\u4f5c",
    recordsCount: "\u8fd0\u884c\u8bb0\u5f55",
    failedCount: "\u5931\u8d25\u8fd0\u884c",
    partialCount: "\u90e8\u5206\u6210\u529f",
    policyState: "\u7b56\u7565\u72b6\u6001",
    enabledState: "\u5df2\u542f\u7528",
    disabledState: "\u672a\u542f\u7528",
    saveSuccess: "\u4fdd\u5b58\u6210\u529f",
    requestFailed: "\u8bf7\u6c42\u5931\u8d25",
    unknown: "\u6682\u65e0"
  }
};

export default function RecordsSyncCenterPage({ locale, currentPath, onNavigate }: RecordsSyncCenterPageProps) {
  const text = copy[locale];
  const adminBase = useMemo(() => resolveAdminBase(currentPath), [currentPath]);
  const lightMode = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);

  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [ownerFilter, setOwnerFilter] = useState("");
  const [limit, setLimit] = useState("80");

  const [runs, setRuns] = useState<SyncRunRecord[]>([]);
  const [selectedRunID, setSelectedRunID] = useState<number>(0);
  const [detailPayload, setDetailPayload] = useState<Record<string, unknown> | null>(null);

  const [policy, setPolicy] = useState<SyncPolicyRecord>({
    enabled: false,
    interval: "30m",
    timeout: "10m",
    batch_size: 20
  });

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  async function loadDetail(runID: number) {
    if (!runID) {
      setDetailPayload(null);
      return;
    }
    try {
      const payload = await fetchConsoleJSON<{ item?: Record<string, unknown> }>(`/api/v1/admin/sync-jobs/${runID}`);
      setDetailPayload(asRecord(payload.item));
    } catch (detailError) {
      setDetailPayload(null);
      setError(detailError instanceof Error ? detailError.message : text.requestFailed);
    }
  }

  async function loadRuns(preferredRunID?: number) {
    const params = new URLSearchParams();
    const limitValue = Number(limit);
    if (Number.isFinite(limitValue) && limitValue > 0) {
      params.set("limit", String(Math.round(limitValue)));
    } else {
      params.set("limit", "80");
    }

    const ownerValue = Number(ownerFilter);
    if (Number.isFinite(ownerValue) && ownerValue > 0) {
      params.set("owner_id", String(Math.round(ownerValue)));
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";
    const payload = await fetchConsoleJSON<{ items?: unknown[] }>(`/api/v1/admin/sync-jobs${suffix}`);
    const parsedRuns = (Array.isArray(payload.items) ? payload.items : []).map((item) => parseSyncRun(item));

    setRuns(parsedRuns);

    let nextRunID = preferredRunID || selectedRunID;
    if (!nextRunID || !parsedRuns.some((item) => item.id === nextRunID)) {
      nextRunID = parsedRuns[0]?.id || 0;
    }
    setSelectedRunID(nextRunID);

    if (nextRunID) {
      await loadDetail(nextRunID);
    } else {
      setDetailPayload(null);
    }
  }

  async function loadPolicy() {
    try {
      const payload = await fetchConsoleJSON<SyncPolicyRecord>("/api/v1/admin/sync-policy/repository");
      setPolicy(parseSyncPolicy(payload));
    } catch (policyError) {
      setError(policyError instanceof Error ? policyError.message : text.requestFailed);
    }
  }

  async function refreshAll(preferredRunID?: number) {
    clearFeedback();
    setLoading(true);
    try {
      await Promise.all([loadRuns(preferredRunID), loadPolicy()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  async function savePolicy() {
    clearFeedback();
    const batchSize = Number(policy.batch_size);
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      setError(text.requestFailed);
      return;
    }

    setSavingPolicy(true);
    try {
      await postConsoleJSON("/api/v1/admin/sync-policy/repository", {
        enabled: policy.enabled,
        interval: policy.interval.trim(),
        timeout: policy.timeout.trim(),
        batch_size: Math.round(batchSize)
      });
      setMessage(text.saveSuccess);
      await refreshAll(selectedRunID || undefined);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.requestFailed);
    } finally {
      setSavingPolicy(false);
    }
  }

  const failedCount = runs.filter((item) => item.status.toLowerCase() === "failed").length;
  const partialCount = runs.filter((item) => item.status.toLowerCase() === "partial").length;
  const detailSummary = buildSyncRunDetailSummary(detailPayload, locale, text.unknown);

  if (loading) {
    return (
      <PrototypeLoadingCenter>
        <Spin description={text.loading} />
      </PrototypeLoadingCenter>
    );
  }

  const metricItems = [
    { key: "records", label: text.recordsCount, value: String(runs.length) },
    { key: "failed", label: text.failedCount, value: String(failedCount) },
    { key: "partial", label: text.partialCount, value: String(partialCount) },
    { key: "policy", label: text.policyState, value: policy.enabled ? text.enabledState : text.disabledState }
  ];

  return (
    <PrototypePageGrid>
      <Card
        variant="borderless"
        style={{ borderRadius: 16, border: `1px solid ${palette.headerBorder}`, background: palette.headerBackground }}
        styles={{ body: { padding: "14px 16px" } }}
      >
        <PrototypeHeaderLayout>
          <div>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: palette.headerTitle,
                fontFamily: "\"Syne\", sans-serif",
                fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)",
                lineHeight: 1.2
              }}
            >
              {text.title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: "6px 0 0", color: palette.headerSubtitle, fontSize: "0.8rem" }}>
              {text.subtitle}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button onClick={() => onNavigate(`${adminBase}/jobs`)}>{text.openJobs}</Button>
            <Button onClick={() => onNavigate(`${adminBase}/sync-policy/repository`)}>{text.openPolicy}</Button>
            <Button onClick={() => onNavigate(`${adminBase}/records/exports`)}>{text.openExports}</Button>
            <Button onClick={() => refreshAll(selectedRunID || undefined)} loading={savingPolicy}>
              {text.refresh}
            </Button>
          </Space>
        </PrototypeHeaderLayout>
      </Card>

      {error ? <Alert type="error" showIcon message={error} /> : null}
      {message ? <Alert type="success" showIcon message={message} /> : null}

      <PrototypeMetricGrid>
        {metricItems.map((item) => (
          <Card
            key={item.key}
            variant="borderless"
            style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 10, display: "grid", gap: 5 } }}
          >
            <Typography.Text
              style={{ color: palette.metricLabel, fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase" }}
            >
              {item.label}
            </Typography.Text>
            <Typography.Text strong style={{ color: palette.metricValue, fontSize: "1.06rem" }}>
              {item.value}
            </Typography.Text>
          </Card>
        ))}
      </PrototypeMetricGrid>

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
                <Input value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} />
              </PrototypeFormLabel>
              <PrototypeFormLabel>
                <PrototypeFieldLabel>{text.limit}</PrototypeFieldLabel>
                <Input value={limit} onChange={(event) => setLimit(event.target.value)} />
              </PrototypeFormLabel>
              <Button type="primary" onClick={() => refreshAll(selectedRunID || undefined)}>
                {text.apply}
              </Button>
            </PrototypeInlineForm>

            <PrototypeList>
              {runs.map((run) => (
                <PrototypeListRow key={run.id}>
                  <PrototypeListMain>
                    <Typography.Text strong style={{ color: "#f0f8ff", fontSize: "0.8rem" }}>
                      #{run.id} · {run.scope || text.unknown}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.trigger}: {run.trigger || text.unknown}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.candidates}: {run.candidates} · {text.synced}: {run.synced} · {text.failed}: {run.failed}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.owner}: {run.owner_username || text.unknown} · {text.actor}: {run.actor_username || text.unknown}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.started}: {parseDate(run.started_at, locale, text.unknown)}
                    </Typography.Text>
                    <Typography.Text style={{ color: "#bfd8fc", fontSize: "0.71rem", lineHeight: 1.42 }}>
                      {text.finished}: {parseDate(run.finished_at, locale, text.unknown)}
                    </Typography.Text>
                  </PrototypeListMain>
                  <PrototypeListActions>
                    <Tag color={statusColor(run.status)}>{run.status || text.unknown}</Tag>
                    <Tag>{Math.round(run.duration_ms)} ms</Tag>
                    <Button
                      size="small"
                      type={run.id === selectedRunID ? "primary" : "default"}
                      onClick={() => {
                        setSelectedRunID(run.id);
                        void loadDetail(run.id);
                      }}
                    >
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
              <Input
                value={policy.interval}
                onChange={(event) => setPolicy((previous) => ({ ...previous, interval: event.target.value }))}
                placeholder="30m"
              />
            </PrototypeFormLabel>
            <PrototypeFormLabel>
              <PrototypeFieldLabel>{text.timeout}</PrototypeFieldLabel>
              <Input
                value={policy.timeout}
                onChange={(event) => setPolicy((previous) => ({ ...previous, timeout: event.target.value }))}
                placeholder="10m"
              />
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
              <Button type="primary" onClick={() => savePolicy()} loading={savingPolicy}>
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
    </PrototypePageGrid>
  );
}
