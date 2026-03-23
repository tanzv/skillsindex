import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminCatalogContent } from "@/src/features/adminCatalog/AdminCatalogContent";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type { AdminCatalogRoute, AdminCatalogViewModel } from "@/src/features/adminCatalog/model";
import styles from "@/src/features/adminCatalog/AdminCatalogSurface.module.scss";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

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
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: createProtectedPageTestMessages({
          adminCommon: {
            adminEyebrow: "Admin",
            refresh: "Refresh",
            refreshing: "Refreshing..."
          },
          adminCatalog: {
            loadingData: "Loading admin catalog data...",
            emptyRows: "No catalog rows are available for the current route and filters.",
            filtersTitle: "Filters",
            filtersDescription: "Scope the current collection before refreshing the route-specific admin view.",
            keywordLabel: "Catalog keyword",
            keywordPlaceholder: "Keyword",
            sourceLabel: "Catalog source",
            sourcePlaceholder: "Source",
            statusLabel: "Catalog status",
            statusPlaceholder: "Status",
            visibilityLabel: "Catalog visibility",
            visibilityPlaceholder: "Visibility",
            jobTypeLabel: "Catalog job type",
            jobTypePlaceholder: "Job Type",
            applyFiltersAction: "Apply Filters",
            resetFiltersAction: "Reset",
            inspectAction: "Inspect",
            selectedAction: "Selected",
            openDetailAction: "Open Details",
            closePanelAction: "Close Panel",
            skillsInventoryTitle: "Governed Inventory",
            skillsInventoryDescription: "Use this route as the searchable catalog list, then inspect one governed skill at a time.",
            skillsEmpty: "No governed skills were returned by the backend.",
            selectedSkillTitle: "Selected Skill",
            selectedSkillDescription: "Keep governance decisions anchored to one skill at a time instead of scanning anonymous rows.",
            selectedSkillEmpty: "Select a skill from the governed inventory to inspect ownership, quality, and exposure.",
            syncNowAction: "Sync now",
            syncingAction: "Syncing...",
            openSkillDetailAction: "Open Skill Detail",
            openIntakeAction: "Open Intake",
            jobsQueueTitle: "Execution Queue",
            jobsQueueDescription: "Review the async job queue as an action list, not only a metric strip.",
            jobsEmpty: "No async jobs were returned by the backend.",
            selectedJobTitle: "Selected Job",
            selectedJobDescription: "Inspect the currently selected queue item before applying retry or cancel decisions.",
            selectedJobEmpty: "Select a job from the queue to inspect retry pressure and failure context.",
            retryAction: "Retry",
            retryingAction: "Retrying...",
            cancelAction: "Cancel",
            cancelingAction: "Canceling...",
            retrySelectedAction: "Retry Selected",
            cancelSelectedAction: "Cancel Selected",
            syncRunsTitle: "Run History",
            syncRunsDescription: "Read repository synchronization as an operational history with one focused run at a time.",
            syncRunsEmpty: "No synchronization runs were returned by the backend.",
            selectedSyncRunTitle: "Selected Sync Run",
            selectedSyncRunDescription: "Use the focused run detail to understand cadence, duration, and delivery quality.",
            selectedSyncRunEmpty: "Select a sync run to inspect throughput and completion details.",
            openSyncPolicyAction: "Open Sync Policy",
            policyEditorTitle: "Policy Editor",
            policyEditorDescription: "Use this route as a configuration surface rather than a generic data table.",
            schedulerEnabledLabel: "Scheduler enabled",
            schedulerEnabledHelp: "Scheduler enabled",
            intervalLabel: "Interval",
            intervalPlaceholder: "Interval",
            timeoutLabel: "Timeout",
            timeoutPlaceholder: "Timeout",
            batchSizeLabel: "Batch Size",
            batchSizePlaceholder: "Batch Size",
            savePolicyAction: "Save Policy",
            savingPolicyAction: "Saving...",
            resetDraftAction: "Reset Draft",
            policyPostureTitle: "Current Policy Posture",
            policyPostureDescription: "Read the effective scheduler posture before publishing a new draft."
          }
        })
      },
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
    )
  );
}

describe("admin catalog content", () => {
  it("renders the skills route as governed inventory with explicit detail triggers", () => {
    const markup = renderCatalogRoute("/admin/skills");

    expect(markup).toContain("Governed Inventory");
    expect(markup).toContain("Open Details");
    expect(markup).toContain("Sync now");
    expect(markup).toContain(styles.splitLayout);
    expect(markup).toContain(styles.rowLayout);
  });

  it("renders the jobs route as execution queue with row actions", () => {
    const markup = renderCatalogRoute("/admin/jobs");

    expect(markup).toContain("Execution Queue");
    expect(markup).toContain("Open Details");
    expect(markup).toContain("Retry");
    expect(markup).toContain("Cancel");
  });

  it("renders the sync run route as history with drawer entry actions", () => {
    const markup = renderCatalogRoute("/admin/sync-jobs");

    expect(markup).toContain("Run History");
    expect(markup).toContain("Open Details");
  });

  it("renders the policy route as editor plus posture summary", () => {
    const markup = renderCatalogRoute("/admin/sync-policy/repository");

    expect(markup).toContain("Policy Editor");
    expect(markup).toContain("Current Policy Posture");
    expect(markup).toContain("Save Policy");
  });
});
