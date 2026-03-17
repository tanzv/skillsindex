import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminCatalogContent } from "@/src/features/adminCatalog/AdminCatalogContent";
import type { AdminCatalogRoute, AdminCatalogViewModel } from "@/src/features/adminCatalog/model";

function createViewModel(route: AdminCatalogRoute): AdminCatalogViewModel {
  if (route === "/admin/skills") {
    return {
      metrics: [{ label: "Total Skills", value: "2" }],
      sidePanel: [{ title: "Catalog Signals", items: [{ label: "Repository-backed", value: "1" }] }],
      table: {
        title: "Skill Inventory",
        rows: [
          {
            id: 11,
            name: "Release Readiness Checklist",
            summary: "operations · repository · ops.lead",
            meta: ["184 stars", "9.3 quality"],
            status: "public",
            syncable: true
          }
        ]
      },
      editor: null
    };
  }

  if (route === "/admin/jobs") {
    return {
      metrics: [{ label: "Queued Jobs", value: "2" }],
      sidePanel: [{ title: "Execution Signals", items: [{ label: "Latest running", value: "repo_sync" }] }],
      table: {
        title: "Async Job Queue",
        rows: [
          {
            id: 81,
            name: "import_archive #81",
            summary: "Skill 101 · owner 7 · actor 7",
            meta: ["Attempt 1/3", "Mar 10, 08:10 AM"],
            status: "failed",
            detail: "archive parse failed"
          },
          {
            id: 82,
            name: "repo_sync #82",
            summary: "Skill 102 · owner 7 · actor 7",
            meta: ["Attempt 1/3", "Mar 10, 08:15 AM"],
            status: "running"
          }
        ]
      },
      editor: null
    };
  }

  if (route === "/admin/sync-jobs") {
    return {
      metrics: [{ label: "Sync Runs", value: "1" }],
      sidePanel: [{ title: "Run Distribution", items: [{ label: "Scheduled runs", value: "1" }] }],
      table: {
        title: "Repository Sync Runs",
        rows: [
          {
            id: 41,
            name: "schedule · repository",
            summary: "11 synced / 1 failed / 12 candidates",
            meta: ["6.2 s", "Mar 10, 08:10 AM"],
            status: "success"
          }
        ]
      },
      editor: null
    };
  }

  return {
    metrics: [{ label: "Scheduler Enabled", value: "Yes" }],
    sidePanel: [{ title: "Policy Notes", items: [{ label: "Execution mode", value: "Scheduled sync enabled" }] }],
    table: null,
    editor: {
      enabled: true,
      interval: "15m",
      timeout: "5m",
      batchSize: 25
    }
  };
}

function renderCatalogRoute(route: AdminCatalogRoute) {
  return renderToStaticMarkup(
    createElement(AdminCatalogContent, {
      route,
      title: "Catalog",
      description: "Route specific catalog view",
      loading: false,
      busyAction: "",
      error: "",
      message: "",
      query: {},
      viewModel: createViewModel(route),
      policyDraft: {
        enabled: true,
        interval: "15m",
        timeout: "5m",
        batchSize: 25
      },
      onQueryChange: () => undefined,
      onResetQuery: () => undefined,
      onRefresh: () => undefined,
      onSyncSkill: () => undefined,
      onRunJobAction: () => undefined,
      onPolicyDraftChange: () => undefined,
      onResetPolicyDraft: () => undefined,
      onSavePolicy: () => undefined
    })
  );
}

describe("admin catalog content", () => {
  it("renders the skills route as governed inventory plus selected detail", () => {
    const markup = renderCatalogRoute("/admin/skills");

    expect(markup).toContain("Governed Inventory");
    expect(markup).toContain("Selected Skill");
    expect(markup).toContain("Open Skill Detail");
    expect(markup).toContain("Sync now");
  });

  it("renders the jobs route as execution queue with row actions", () => {
    const markup = renderCatalogRoute("/admin/jobs");

    expect(markup).toContain("Execution Queue");
    expect(markup).toContain("Selected Job");
    expect(markup).toContain("Retry");
    expect(markup).toContain("Cancel");
  });

  it("renders the sync run route as history plus selected run detail", () => {
    const markup = renderCatalogRoute("/admin/sync-jobs");

    expect(markup).toContain("Run History");
    expect(markup).toContain("Selected Sync Run");
    expect(markup).toContain("Open Sync Policy");
  });

  it("renders the policy route as editor plus posture summary", () => {
    const markup = renderCatalogRoute("/admin/sync-policy/repository");

    expect(markup).toContain("Policy Editor");
    expect(markup).toContain("Current Policy Posture");
    expect(markup).toContain("Save Policy");
  });
});
