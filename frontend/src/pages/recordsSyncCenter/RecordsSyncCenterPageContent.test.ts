import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getRecordsSyncCenterCopy } from "./RecordsSyncCenterPage.copy";
import RecordsSyncCenterPageContent from "./RecordsSyncCenterPageContent";
import { parseDate } from "./RecordsSyncCenterPage.helpers";

describe("RecordsSyncCenterPageContent", () => {
  it("renders repository ingestion content with real run metadata", () => {
    const html = renderToStaticMarkup(
      React.createElement(RecordsSyncCenterPageContent, {
        locale: "en",
        text: getRecordsSyncCenterCopy("en", "/admin/ingestion/repository"),
        adminBase: "/admin",
        ownerFilter: "",
        onOwnerFilterChange: () => undefined,
        limit: "80",
        onLimitChange: () => undefined,
        onRefresh: () => undefined,
        refreshing: false,
        runs: [
          {
            id: 9001,
            trigger: "manual",
            scope: "skillsindex/repository",
            status: "partial",
            candidates: 24,
            synced: 22,
            failed: 2,
            duration_ms: 22000,
            started_at: "2026-03-07T08:00:00.000Z",
            finished_at: "2026-03-07T08:00:22.000Z",
            error_summary: "2 failed items",
            owner_username: "owner.user",
            actor_username: "admin.user"
          }
        ],
        selectedRunID: 9001,
        onSelectRun: () => undefined,
        detailSummary: {
          status: "partial",
          durationMs: "22000",
          started: "3/7/2026, 8:00:00 AM",
          finished: "3/7/2026, 8:00:22 AM"
        },
        detailPayload: { id: 9001, status: "partial" },
        policy: {
          enabled: true,
          interval: "15m",
          timeout: "8m",
          batch_size: 50
        },
        setPolicy: () => undefined,
        onSavePolicy: () => undefined,
        savingPolicy: false,
        onNavigate: () => undefined
      })
    );

    expect(html).toContain("Repository Run Ledger");
    expect(html).toContain("Repository Sync Policy");
    expect(html).toContain("owner.user");
    expect(html).toContain("2 failed items");
    expect(html).toContain("Repository Shortcuts");
  });

  it("renders localized repository labels for zh copy", () => {
    const html = renderToStaticMarkup(
      React.createElement(RecordsSyncCenterPageContent, {
        locale: "zh",
        text: getRecordsSyncCenterCopy("zh", "/admin/ingestion/repository"),
        adminBase: "/admin",
        ownerFilter: "",
        onOwnerFilterChange: () => undefined,
        limit: "80",
        onLimitChange: () => undefined,
        onRefresh: () => undefined,
        refreshing: false,
        runs: [],
        selectedRunID: 0,
        onSelectRun: () => undefined,
        detailSummary: {
          status: "\u6682\u65e0",
          durationMs: "\u6682\u65e0",
          started: "\u6682\u65e0",
          finished: "\u6682\u65e0"
        },
        detailPayload: null,
        policy: {
          enabled: false,
          interval: "30m",
          timeout: "10m",
          batch_size: 20
        },
        setPolicy: () => undefined,
        onSavePolicy: () => undefined,
        savingPolicy: false,
        onNavigate: () => undefined
      })
    );

    expect(html).toContain("\u4ed3\u5e93\u8fd0\u884c\u8d26\u672c");
    expect(html).toContain("\u4ed3\u5e93\u540c\u6b65\u7b56\u7565");
    expect(html).toContain("\u4ed3\u5e93\u5feb\u6377\u5165\u53e3");
    expect(html).toContain("\u5f53\u524d\u6ca1\u6709\u8fd4\u56de\u4ed3\u5e93\u540c\u6b65\u8fd0\u884c\u8bb0\u5f55\u3002");
  });

  it("renders each run row with its own started timestamp, even when not selected", () => {
    const html = renderToStaticMarkup(
      React.createElement(RecordsSyncCenterPageContent, {
        locale: "en",
        text: getRecordsSyncCenterCopy("en", "/admin/ingestion/repository"),
        adminBase: "/admin",
        ownerFilter: "",
        onOwnerFilterChange: () => undefined,
        limit: "80",
        onLimitChange: () => undefined,
        onRefresh: () => undefined,
        refreshing: false,
        runs: [
          {
            id: 9001,
            trigger: "manual",
            scope: "skillsindex/repository-a",
            status: "partial",
            candidates: 24,
            synced: 22,
            failed: 2,
            duration_ms: 22000,
            started_at: "2026-03-07T08:00:00.000Z",
            finished_at: "2026-03-07T08:00:22.000Z",
            error_summary: "2 failed items",
            owner_username: "owner.user",
            actor_username: "admin.user"
          },
          {
            id: 9002,
            trigger: "schedule",
            scope: "skillsindex/repository-b",
            status: "completed",
            candidates: 16,
            synced: 16,
            failed: 0,
            duration_ms: 12000,
            started_at: "2026-03-07T09:00:00.000Z",
            finished_at: "2026-03-07T09:00:12.000Z",
            error_summary: "",
            owner_username: "owner.two",
            actor_username: "system"
          }
        ],
        selectedRunID: 9002,
        onSelectRun: () => undefined,
        detailSummary: {
          status: "completed",
          durationMs: "12000",
          started: "3/7/2026, 9:00:00 AM",
          finished: "3/7/2026, 9:00:12 AM"
        },
        detailPayload: { id: 9002, status: "completed" },
        policy: {
          enabled: true,
          interval: "15m",
          timeout: "8m",
          batch_size: 50
        },
        setPolicy: () => undefined,
        onSavePolicy: () => undefined,
        savingPolicy: false,
        onNavigate: () => undefined
      })
    );

    expect(html).toContain(parseDate("2026-03-07T08:00:00.000Z", "en", "n/a"));
    expect(html).toContain(parseDate("2026-03-07T09:00:00.000Z", "en", "n/a"));
    expect(html).toContain(parseDate("2026-03-07T08:00:22.000Z", "en", "n/a"));
    expect(html).toContain(parseDate("2026-03-07T09:00:12.000Z", "en", "n/a"));
  });

});
