import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";

export type AdminCatalogRoute =
  | "/admin/skills"
  | "/admin/jobs"
  | "/admin/sync-jobs"
  | "/admin/sync-policy/repository";

interface AdminCatalogPageProps {
  route: AdminCatalogRoute;
}

interface AdminSkillItem {
  id: number;
  name: string;
  category: string;
  source_type: string;
  visibility: string;
  owner_username: string;
  star_count: number;
  quality_score: number;
  updated_at: string;
}

interface AsyncJobItem {
  id: number;
  job_type: string;
  status: string;
  owner_user_id: number;
  actor_user_id: number;
  target_skill_id: number;
  attempt: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

interface SyncJobRunItem {
  id: number;
  trigger: string;
  scope: string;
  status: string;
  candidates: number;
  synced: number;
  failed: number;
  duration_ms: number;
  started_at: string;
  finished_at: string;
}

interface RepositorySyncPolicy {
  enabled: boolean;
  interval: string;
  timeout: string;
  batch_size: number;
}

interface ViewState {
  skills: AdminSkillItem[];
  skillsTotal: number;
  jobs: AsyncJobItem[];
  jobsTotal: number;
  syncJobs: SyncJobRunItem[];
  syncJobsTotal: number;
  policy: RepositorySyncPolicy | null;
}

interface TableViewModel {
  title: string;
  rowCount: number;
  columns: string[];
  rows: ReactNode[][];
}

interface PageViewModel {
  empty: boolean;
  metrics: Array<{ label: string; value: string | number }>;
  table?: TableViewModel;
  editor?: ReactNode;
}

const pageMeta: Record<AdminCatalogRoute, { title: string; subtitle: string; endpoint: string }> = {
  "/admin/skills": {
    title: "Skills Catalog",
    subtitle: "Monitor indexed skills, source channels, and visibility posture.",
    endpoint: "GET /api/v1/admin/skills"
  },
  "/admin/jobs": {
    title: "Async Jobs Monitor",
    subtitle: "Track orchestration jobs and execution throughput by current state.",
    endpoint: "GET /api/v1/admin/jobs"
  },
  "/admin/sync-jobs": {
    title: "Repository Sync Runs",
    subtitle: "Inspect synchronization run health, volume, and timing.",
    endpoint: "GET /api/v1/admin/sync-jobs"
  },
  "/admin/sync-policy/repository": {
    title: "Repository Sync Policy",
    subtitle: "Review and update scheduler controls for repository synchronization.",
    endpoint: "GET/POST /api/v1/admin/sync-policy/repository"
  }
};

const initialViewState: ViewState = {
  skills: [],
  skillsTotal: 0,
  jobs: [],
  jobsTotal: 0,
  syncJobs: [],
  syncJobsTotal: 0,
  policy: null
};

function formatDateTime(value: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleString();
}

function statusPillClass(active: boolean): string {
  return active ? "pill active" : "pill muted";
}


function renderTable(model: TableViewModel): ReactNode {
  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3>{model.title}</h3>
        <span className="pill muted">{model.rowCount} rows</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{model.columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {model.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminCatalogPage({ route }: AdminCatalogPageProps) {
  const meta = pageMeta[route];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [viewState, setViewState] = useState<ViewState>(initialViewState);
  const [policyForm, setPolicyForm] = useState<RepositorySyncPolicy>({ enabled: false, interval: "30m", timeout: "10m", batch_size: 20 });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (route === "/admin/skills") {
        const payload = await fetchConsoleJSON<{ items?: AdminSkillItem[]; total?: number }>("/api/v1/admin/skills");
        const items = Array.isArray(payload.items) ? payload.items : [];
        setViewState({ ...initialViewState, skills: items, skillsTotal: Number(payload.total || items.length) });
      } else if (route === "/admin/jobs") {
        const payload = await fetchConsoleJSON<{ items?: AsyncJobItem[]; total?: number }>("/api/v1/admin/jobs");
        const items = Array.isArray(payload.items) ? payload.items : [];
        setViewState({ ...initialViewState, jobs: items, jobsTotal: Number(payload.total || items.length) });
      } else if (route === "/admin/sync-jobs") {
        const payload = await fetchConsoleJSON<{ items?: SyncJobRunItem[]; total?: number }>("/api/v1/admin/sync-jobs");
        const items = Array.isArray(payload.items) ? payload.items : [];
        setViewState({ ...initialViewState, syncJobs: items, syncJobsTotal: Number(payload.total || items.length) });
      } else {
        const payload = await fetchConsoleJSON<RepositorySyncPolicy>("/api/v1/admin/sync-policy/repository");
        const parsed = {
          enabled: Boolean(payload.enabled),
          interval: String(payload.interval || "30m"),
          timeout: String(payload.timeout || "10m"),
          batch_size: Number(payload.batch_size || 20)
        };
        setPolicyForm(parsed);
        setViewState({ ...initialViewState, policy: parsed });
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Request failed");
      setViewState(initialViewState);
    } finally {
      setLoading(false);
    }
  }, [route]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSavePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (route !== "/admin/sync-policy/repository") return;
    const parsedBatch = Number(policyForm.batch_size);
    if (!Number.isFinite(parsedBatch) || parsedBatch <= 0) {
      setError("Batch size must be a positive integer.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await postConsoleJSON("/api/v1/admin/sync-policy/repository", {
        enabled: policyForm.enabled,
        interval: policyForm.interval.trim(),
        timeout: policyForm.timeout.trim(),
        batch_size: Math.round(parsedBatch)
      });
      setMessage("Policy saved.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Request failed");
    } finally {
      setSaving(false);
    }
  }

  const viewModel = useMemo<PageViewModel>(() => {
    if (route === "/admin/skills") {
      const listed = viewState.skills.length;
      const publicCount = viewState.skills.filter((item) => item.visibility.toLowerCase() === "public").length;
      const avgQuality = listed ? (viewState.skills.reduce((sum, item) => sum + Number(item.quality_score || 0), 0) / listed).toFixed(2) : "0.00";
      return {
        empty: listed === 0,
        metrics: [
          { label: "Total Skills", value: viewState.skillsTotal },
          { label: "Listed Rows", value: listed },
          { label: "Public Skills", value: publicCount },
          { label: "Average Quality", value: avgQuality }
        ],
        table: {
          title: "Skill Inventory",
          rowCount: listed,
          columns: ["ID", "Name", "Category", "Source", "Visibility", "Owner", "Stars", "Updated"],
          rows: viewState.skills.map((item) => [
            item.id,
            item.name || "-",
            item.category || "-",
            item.source_type || "-",
            <span className={statusPillClass(item.visibility.toLowerCase() === "public")}>{item.visibility || "unknown"}</span>,
            item.owner_username || "-",
            item.star_count ?? 0,
            formatDateTime(item.updated_at)
          ])
        }
      };
    }
    if (route === "/admin/jobs") {
      const listed = viewState.jobs.length;
      const runningCount = viewState.jobs.filter((item) => item.status.toLowerCase() === "running").length;
      const failedCount = viewState.jobs.filter((item) => item.status.toLowerCase() === "failed").length;
      return {
        empty: listed === 0,
        metrics: [
          { label: "Total Jobs", value: viewState.jobsTotal },
          { label: "Listed Rows", value: listed },
          { label: "Running", value: runningCount },
          { label: "Failed", value: failedCount }
        ],
        table: {
          title: "Job Queue",
          rowCount: listed,
          columns: ["ID", "Type", "Status", "Attempt", "Owner", "Actor", "Target Skill", "Updated"],
          rows: viewState.jobs.map((item) => [
            item.id,
            item.job_type || "-",
            <span className={statusPillClass(item.status.toLowerCase() !== "failed")}>{item.status || "unknown"}</span>,
            `${item.attempt}/${item.max_attempts}`,
            item.owner_user_id || "-",
            item.actor_user_id || "-",
            item.target_skill_id || "-",
            formatDateTime(item.updated_at || item.created_at)
          ])
        }
      };
    }
    if (route === "/admin/sync-jobs") {
      const listed = viewState.syncJobs.length;
      const failedRuns = viewState.syncJobs.filter((item) => item.failed > 0 || item.status.toLowerCase() === "failed").length;
      const totalSynced = viewState.syncJobs.reduce((sum, item) => sum + Number(item.synced || 0), 0);
      return {
        empty: listed === 0,
        metrics: [
          { label: "Total Sync Runs", value: viewState.syncJobsTotal },
          { label: "Listed Rows", value: listed },
          { label: "Runs With Failures", value: failedRuns },
          { label: "Total Synced Items", value: totalSynced }
        ],
        table: {
          title: "Sync Run History",
          rowCount: listed,
          columns: ["ID", "Trigger", "Scope", "Status", "Candidates", "Synced", "Failed", "Duration (ms)", "Started"],
          rows: viewState.syncJobs.map((item) => [
            item.id,
            item.trigger || "-",
            item.scope || "-",
            <span className={statusPillClass(item.status.toLowerCase() !== "failed")}>{item.status || "unknown"}</span>,
            item.candidates ?? 0,
            item.synced ?? 0,
            item.failed ?? 0,
            item.duration_ms ?? 0,
            formatDateTime(item.started_at || item.finished_at)
          ])
        }
      };
    }

    const policy = viewState.policy;
    return {
      empty: !policy,
      metrics: [
        { label: "Scheduler State", value: policy?.enabled ? "Enabled" : "Disabled" },
        { label: "Interval", value: policy?.interval || "-" },
        { label: "Timeout", value: policy?.timeout || "-" },
        { label: "Batch Size", value: policy?.batch_size ?? 0 }
      ],
      editor: (
        <section className="panel">
          <h3>Policy Editor</h3>
          <form onSubmit={handleSavePolicy} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}><span>Enabled</span><select value={policyForm.enabled ? "true" : "false"} onChange={(event) => setPolicyForm((previous) => ({ ...previous, enabled: event.target.value === "true" }))}><option value="true">Enabled</option><option value="false">Disabled</option></select></label>
            <label style={{ display: "grid", gap: 6 }}><span>Interval</span><input type="text" value={policyForm.interval} onChange={(event) => setPolicyForm((previous) => ({ ...previous, interval: event.target.value }))} /></label>
            <label style={{ display: "grid", gap: 6 }}><span>Timeout</span><input type="text" value={policyForm.timeout} onChange={(event) => setPolicyForm((previous) => ({ ...previous, timeout: event.target.value }))} /></label>
            <label style={{ display: "grid", gap: 6 }}><span>Batch Size</span><input type="number" min={1} value={String(policyForm.batch_size)} onChange={(event) => setPolicyForm((previous) => ({ ...previous, batch_size: Number(event.target.value) || 0 }))} /></label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" className="panel-action-button" data-variant="emphasis" disabled={saving}>{saving ? "Saving..." : "Save Policy"}</button>
              {message ? <span className="pill active">{message}</span> : null}
            </div>
          </form>
        </section>
      )
    };
  }, [route, viewState, policyForm, saving, message]);

  if (loading) return <div className="page-grid"><section className="panel panel-hero loading">Loading {meta.title}...</section></div>;
  if (error) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero error">
          <h2>{meta.title}</h2><p>{error}</p>
          <button type="button" className="panel-action-button" onClick={() => void loadData()}>Retry request</button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <AdminSubpageSummaryPanel
        title={meta.title}
        status={
          <>
            <span className="pill active">Catalog route</span>
            <span className="pill muted">{meta.endpoint}</span>
          </>
        }
        actions={
          <button type="button" className="panel-action-button" onClick={() => void loadData()}>
            Refresh
          </button>
        }
        metrics={viewModel.metrics.map((metric) => ({ id: metric.label, label: metric.label, value: metric.value }))}
      />
      {viewModel.empty ? <section className="panel"><h3>Empty State</h3><p>No records were returned for this route.</p></section> : null}
      {viewModel.table ? renderTable(viewModel.table) : null}
      {viewModel.editor || null}
    </div>
  );
}
