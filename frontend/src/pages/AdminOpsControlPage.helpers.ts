import { AdminOpsControlRoute, Primitive, Row, RouteDefinition, ViewData } from "./AdminOpsControlPage.types";

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

function boolValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return false;
}

export function labelFromKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "string") {
    return value.trim() || "-";
  }
  return JSON.stringify(value);
}

function normalizeRow(item: unknown): Row {
  const source = asRecord(item);
  const row: Row = {};

  Object.entries(source).forEach(([key, value]) => {
    if (["string", "number", "boolean"].includes(typeof value) || value === null) {
      row[key] = value as Primitive;
      return;
    }
    if (Array.isArray(value)) {
      row[key] = value.length;
      return;
    }
    row[key] = stringifyValue(value);
  });

  return row;
}

function findRows(payload: unknown, candidateKeys: string[]): Row[] {
  const source = asRecord(payload);
  for (const key of candidateKeys) {
    const rows = asArray(source[key]);
    if (rows.length > 0) {
      return rows.map(normalizeRow);
    }
  }

  if (source.item) {
    const item = normalizeRow(source.item);
    if (Object.keys(item).length > 0) {
      return [item];
    }
  }

  return [];
}

function countRowsByAnyValue(rows: Row[], keys: string[], values: string[]): number {
  const target = values.map((value) => value.toLowerCase());
  return rows.filter((row) => {
    return keys.some((key) => {
      const text = stringifyValue(row[key]).toLowerCase();
      return target.includes(text);
    });
  }).length;
}

function buildAlertsView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "alerts"]);
  const total = rows.length || asNumber(source.total);
  const triggered = rows.filter((row) => boolValue(row.triggered)).length;
  const critical = countRowsByAnyValue(rows, ["severity", "level"], ["critical", "high"]);

  return {
    metrics: [
      { label: "Total Alerts", value: String(total), help: "Active and historical alert entries returned by endpoint." },
      { label: "Triggered", value: String(triggered), help: "Alerts currently marked as triggered." },
      { label: "Critical", value: String(critical), help: "Alerts with critical or high severity labels." }
    ],
    rows,
    emptyHint: "No alerts are available for the selected environment."
  };
}

function buildAuditExportView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "entries", "events", "records"]);
  const actorCount = new Set(rows.map((row) => stringifyValue(row.actor_id || row.actor || row.user_id))).size;
  const uniqueActions = new Set(rows.map((row) => stringifyValue(row.action || row.event || row.operation))).size;

  return {
    metrics: [
      { label: "Exported Records", value: String(rows.length), help: "Number of audit rows in JSON export payload." },
      { label: "Distinct Actors", value: String(actorCount), help: "Unique users or service actors observed in result set." },
      { label: "Action Types", value: String(uniqueActions), help: "Distinct operation names in exported records." }
    ],
    rows,
    emptyHint: "The audit export returned no records for the current query window."
  };
}

function buildReleaseGatesView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "gates", "checks"]);
  const passed = countRowsByAnyValue(rows, ["status", "result", "state"], ["passed", "pass", "ok"]);
  const blocked = countRowsByAnyValue(rows, ["status", "result", "state"], ["blocked", "failed", "fail", "error"]);

  return {
    metrics: [
      { label: "Gate Checks", value: String(rows.length), help: "Total release gate checks returned by backend." },
      { label: "Passed", value: String(passed), help: "Checks currently passing." },
      { label: "Blocked", value: String(blocked), help: "Checks in blocked or failed state." }
    ],
    rows,
    emptyHint: "No release gate records are available yet."
  };
}

function buildRecoveryDrillsView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "drills", "runs"]);
  const rpoReady = rows.filter((row) => asNumber(row.rpo_hours) > 0).length;
  const rtoReady = rows.filter((row) => asNumber(row.rto_hours) > 0).length;

  return {
    metrics: [
      { label: "Recorded Drills", value: String(rows.length), help: "Total disaster recovery drill entries." },
      { label: "RPO Captured", value: String(rpoReady), help: "Entries with explicit RPO evidence." },
      { label: "RTO Captured", value: String(rtoReady), help: "Entries with explicit RTO evidence." }
    ],
    rows,
    emptyHint: "No recovery drill evidence is currently available."
  };
}

function buildReleasesView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "releases", "deployments"]);
  const successful = countRowsByAnyValue(rows, ["status", "result", "state"], ["success", "succeeded", "completed"]);
  const failed = countRowsByAnyValue(rows, ["status", "result", "state"], ["failed", "error", "rollback"]);

  return {
    metrics: [
      { label: "Release Records", value: String(rows.length), help: "Total release records in the payload." },
      { label: "Successful", value: String(successful), help: "Records in successful/completed state." },
      { label: "Failed", value: String(failed), help: "Records in failed/error/rollback state." }
    ],
    rows,
    emptyHint: "No release records are available for this environment."
  };
}

function buildChangeApprovalsView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "approvals", "requests"]);
  const pending = countRowsByAnyValue(rows, ["status", "state"], ["pending", "requested", "waiting"]);
  const approved = countRowsByAnyValue(rows, ["status", "state"], ["approved", "accepted", "granted"]);

  return {
    metrics: [
      { label: "Approval Requests", value: String(rows.length), help: "Total change approval entries from backend." },
      { label: "Pending", value: String(pending), help: "Requests waiting for reviewer decision." },
      { label: "Approved", value: String(approved), help: "Requests already approved." }
    ],
    rows,
    emptyHint: "No change approval requests were returned by the API."
  };
}

function buildBackupPlansView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "plans"]);
  const enabled = rows.filter((row) => boolValue(row.enabled || row.is_enabled)).length;
  const scheduled = rows.filter((row) => stringifyValue(row.schedule || row.cron) !== "-").length;

  return {
    metrics: [
      { label: "Backup Plans", value: String(rows.length), help: "Total configured backup plans." },
      { label: "Enabled", value: String(enabled), help: "Plans currently enabled." },
      { label: "Scheduled", value: String(scheduled), help: "Plans with schedule or cron value." }
    ],
    rows,
    emptyHint: "No backup plans are configured yet."
  };
}

function buildBackupRunsView(payload: unknown): ViewData {
  const source = asRecord(payload);
  const rows = findRows(source, ["items", "runs", "jobs"]);
  const success = countRowsByAnyValue(rows, ["status", "result", "state"], ["success", "succeeded", "completed"]);
  const failed = countRowsByAnyValue(rows, ["status", "result", "state"], ["failed", "error"]);

  return {
    metrics: [
      { label: "Backup Runs", value: String(rows.length), help: "Total backup run records." },
      { label: "Successful", value: String(success), help: "Runs completed successfully." },
      { label: "Failed", value: String(failed), help: "Runs in failed or error state." }
    ],
    rows,
    emptyHint: "No backup run history is currently available."
  };
}

export const routeViewBuilders: Record<AdminOpsControlRoute, RouteDefinition["buildView"]> = {
  "/admin/ops/alerts": buildAlertsView,
  "/admin/ops/audit-export": buildAuditExportView,
  "/admin/ops/release-gates": buildReleaseGatesView,
  "/admin/ops/recovery-drills": buildRecoveryDrillsView,
  "/admin/ops/releases": buildReleasesView,
  "/admin/ops/change-approvals": buildChangeApprovalsView,
  "/admin/ops/backup/plans": buildBackupPlansView,
  "/admin/ops/backup/runs": buildBackupRunsView
};
