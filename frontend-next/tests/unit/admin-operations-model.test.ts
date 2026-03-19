import { describe, expect, it } from "vitest";

import {
  buildOpsAlertsOverview,
  buildOpsMetricCards,
  buildOpsReleaseGatesOverview,
  normalizeOpsAlertsPayload,
  normalizeOpsMetricsPayload,
  normalizeOpsReleaseGatesPayload
} from "@/src/features/adminOperations/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const operationsMessages = createProtectedPageTestMessages({
  adminOperations: {
    metricOpenIncidentsLabel: "Open Incidents",
    metricOpenIncidentsDescription: "Open incidents in the current perimeter",
    metricPendingModerationLabel: "Pending Moderation",
    metricPendingModerationDescription: "Pending moderation cases",
    metricUnresolvedJobsLabel: "Unresolved Jobs",
    metricUnresolvedJobsDescription: "Jobs that still need operator action",
    metricFailedSyncRunsLabel: "Failed Sync Runs",
    metricFailedSyncRunsDescription: "Failed sync runs in the last 24h",
    metricDisabledAccountsLabel: "Disabled Accounts",
    metricDisabledAccountsDescription: "Disabled accounts in scope",
    metricStaleIntegrationsLabel: "Stale Integrations",
    metricStaleIntegrationsDescription: "Integrations beyond freshness threshold",
    alertsMetricTotalLabel: "Total",
    alertsMetricTriggeredLabel: "Triggered",
    alertsMetricCriticalLabel: "Critical",
    releaseGatesMetricChecksLabel: "Gate Checks",
    releaseGatesMetricPassedLabel: "Passed",
    releaseGatesMetricBlockedLabel: "Blocked",
    statePassed: "Passed",
    stateBlocked: "Blocked",
    valueNotAvailable: "n/a"
  }
}).adminOperations;

describe("admin operations model", () => {
  it("builds metric card severities from ops metrics snapshot", () => {
    const payload = normalizeOpsMetricsPayload({
      item: {
        open_incidents: 2,
        pending_moderation_cases: 10,
        unresolved_jobs: 13,
        failed_sync_runs_24h: 1,
        disabled_accounts: 4,
        stale_integrations: 9,
        total_audit_logs_24h: 80,
        total_sync_runs_24h: 22,
        retention_days: 30
      }
    });

    const cards = buildOpsMetricCards(payload, operationsMessages);

    expect(cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Pending Moderation", severity: "warning" }),
        expect.objectContaining({ label: "Unresolved Jobs", severity: "critical" }),
        expect.objectContaining({ label: "Stale Integrations", severity: "critical" })
      ])
    );
  });

  it("builds alert overview counts", () => {
    const payload = normalizeOpsAlertsPayload({
      total: 3,
      items: [
        { code: "ops.backlog", severity: "warning", message: "Backlog growing", triggered: true },
        { code: "ops.release", severity: "critical", message: "Release blocked", triggered: true },
        { code: "ops.normal", severity: "normal", message: "Healthy", triggered: false }
      ]
    });

    const overview = buildOpsAlertsOverview(payload, operationsMessages);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Triggered", value: "2" }),
        expect.objectContaining({ label: "Critical", value: "1" })
      ])
    );
  });

  it("builds release gate overview from snapshot", () => {
    const payload = normalizeOpsReleaseGatesPayload({
      item: {
        generated_at: "2026-03-14T10:00:00Z",
        passed: false,
        checks: [
          { code: "db.backup", severity: "critical", message: "Backup missing", passed: false },
          { code: "sync.health", severity: "normal", message: "Healthy", passed: true }
        ]
      }
    });

    const overview = buildOpsReleaseGatesOverview(payload, "en", operationsMessages);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Gate Checks", value: "2" }),
        expect.objectContaining({ label: "Blocked", value: "1" })
      ])
    );
    expect(overview.generatedAt).not.toBe("n/a");
    expect(overview.overallState).toBe("Blocked");
  });
});
