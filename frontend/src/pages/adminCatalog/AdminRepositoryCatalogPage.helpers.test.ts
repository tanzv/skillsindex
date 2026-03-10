import { describe, expect, it } from "vitest";

import { getAdminRepositoryCatalogCopy } from "./AdminRepositoryCatalogPage.copy";
import {
  buildRepositorySummaryMetrics,
  formatDateTime,
  formatRepositoryStatus,
  isAdminRepositoryCatalogRoute,
  resolveRepositoryStatusColor
} from "./AdminRepositoryCatalogPage.helpers";

describe("AdminRepositoryCatalogPage.helpers", () => {
  it("detects repository admin routes correctly", () => {
    expect(isAdminRepositoryCatalogRoute("/admin/jobs")).toBe(true);
    expect(isAdminRepositoryCatalogRoute("/admin/sync-jobs")).toBe(true);
    expect(isAdminRepositoryCatalogRoute("/admin/sync-policy/repository")).toBe(true);
    expect(isAdminRepositoryCatalogRoute("/admin/skills")).toBe(false);
  });

  it("maps status values to stable semantic colors", () => {
    expect(resolveRepositoryStatusColor("failed")).toBe("red");
    expect(resolveRepositoryStatusColor("running")).toBe("blue");
    expect(resolveRepositoryStatusColor("pending")).toBe("gold");
    expect(resolveRepositoryStatusColor("enabled")).toBe("green");
    expect(resolveRepositoryStatusColor("mystery")).toBe("default");
  });

  it("builds summary metrics for sync run pages", () => {
    const metrics = buildRepositorySummaryMetrics({
      locale: "en",
      route: "/admin/sync-jobs",
      jobs: [],
      jobsTotal: 0,
      syncJobs: [
        {
          id: 11,
          trigger: "manual",
          scope: "repo/a",
          status: "failed",
          candidates: 10,
          synced: 7,
          failed: 3,
          duration_ms: 420,
          started_at: "2026-03-07T08:00:00.000Z",
          finished_at: "2026-03-07T08:00:42.000Z"
        },
        {
          id: 12,
          trigger: "schedule",
          scope: "repo/b",
          status: "completed",
          candidates: 5,
          synced: 5,
          failed: 0,
          duration_ms: 120,
          started_at: "2026-03-07T09:00:00.000Z",
          finished_at: "2026-03-07T09:00:12.000Z"
        }
      ],
      syncJobsTotal: 14,
      policy: null
    });

    expect(metrics.map((metric) => metric.label)).toEqual([
      "Total Sync Runs",
      "Listed Rows",
      "Runs With Failures",
      "Total Synced Items"
    ]);
    expect(metrics[0]?.value).toBe(14);
    expect(metrics[2]?.value).toBe(1);
    expect(metrics[3]?.value).toBe(12);
  });

  it("localizes summary metrics and status labels for zh", () => {
    const text = getAdminRepositoryCatalogCopy("zh");
    const metrics = buildRepositorySummaryMetrics({
      locale: "zh",
      route: "/admin/sync-policy/repository",
      jobs: [],
      jobsTotal: 0,
      syncJobs: [],
      syncJobsTotal: 0,
      policy: {
        enabled: true,
        interval: "15m",
        timeout: "8m",
        batch_size: 50
      }
    });

    expect(metrics.map((metric) => metric.label)).toEqual([
      text.summaryMetrics.schedulerState,
      text.summaryMetrics.interval,
      text.summaryMetrics.timeout,
      text.summaryMetrics.batchSize
    ]);
    expect(metrics[0]?.value).toBe(text.enabledState);
    expect(formatRepositoryStatus("running", "zh")).toBe(text.statusLabels.running);
  });

  it("formats invalid timestamps defensively", () => {
    expect(formatDateTime("", "en")).toBe("-");
    expect(formatDateTime("not-a-date", "en")).toBe("-");
  });
});
