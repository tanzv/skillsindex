import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getAdminRepositoryCatalogCopy } from "./AdminRepositoryCatalogPage.copy";
import AdminRepositoryCatalogPageContent from "./AdminRepositoryCatalogPageContent";

describe("AdminRepositoryCatalogPageContent", () => {
  it("renders repository navigation and jobs content inside the shared shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminRepositoryCatalogPageContent, {
        locale: "en",
        route: "/admin/jobs",
        loading: false,
        saving: false,
        error: "",
        success: "",
        jobs: [
          {
            id: 88,
            job_type: "repo_sync",
            status: "running",
            owner_user_id: 7,
            actor_user_id: 9,
            target_skill_id: 42,
            attempt: 1,
            max_attempts: 3,
            created_at: "2026-03-07T08:00:00.000Z",
            updated_at: "2026-03-07T08:10:00.000Z"
          }
        ],
        jobsTotal: 5,
        syncJobs: [],
        syncJobsTotal: 0,
        policy: null,
        policyForm: {
          enabled: false,
          interval: "30m",
          timeout: "10m",
          batch_size: 20
        },
        onRefresh: () => undefined,
        onNavigate: () => undefined,
        onPolicyFormChange: () => undefined,
        onSavePolicy: () => undefined
      })
    );

    expect(html).toContain("Asynchronous Jobs");
    expect(html).toContain("Job Queue");
    expect(html).toContain("Sync Runs");
    expect(html).toContain("Sync Policy");
    expect(html).toContain("repo_sync");
    expect(html).toContain("Repository Navigation");
  });

  it("renders policy editor with the unified repository chrome", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminRepositoryCatalogPageContent, {
        locale: "en",
        route: "/admin/sync-policy/repository",
        loading: false,
        saving: false,
        error: "",
        success: "Policy updated successfully",
        jobs: [],
        jobsTotal: 0,
        syncJobs: [],
        syncJobsTotal: 0,
        policy: {
          enabled: true,
          interval: "15m",
          timeout: "8m",
          batch_size: 50
        },
        policyForm: {
          enabled: true,
          interval: "15m",
          timeout: "8m",
          batch_size: 50
        },
        onRefresh: () => undefined,
        onNavigate: () => undefined,
        onPolicyFormChange: () => undefined,
        onSavePolicy: () => undefined
      })
    );

    expect(html).toContain("Repository Sync Policy");
    expect(html).toContain("Policy Editor");
    expect(html).toContain("Current Policy Snapshot");
    expect(html).toContain("Save Policy");
    expect(html).toContain("Policy updated successfully");
  });

  it("renders localized repository copy when locale is zh", () => {
    const text = getAdminRepositoryCatalogCopy("zh");
    const html = renderToStaticMarkup(
      React.createElement(AdminRepositoryCatalogPageContent, {
        locale: "zh",
        route: "/admin/sync-policy/repository",
        loading: false,
        saving: false,
        error: "",
        success: text.policyUpdatedSuccessfully,
        jobs: [],
        jobsTotal: 0,
        syncJobs: [],
        syncJobsTotal: 0,
        policy: {
          enabled: true,
          interval: "15m",
          timeout: "8m",
          batch_size: 50
        },
        policyForm: {
          enabled: true,
          interval: "15m",
          timeout: "8m",
          batch_size: 50
        },
        onRefresh: () => undefined,
        onNavigate: () => undefined,
        onPolicyFormChange: () => undefined,
        onSavePolicy: () => undefined
      })
    );

    expect(html).toContain(text.routeMeta["/admin/sync-policy/repository"].title);
    expect(html).toContain(text.policy.editorTitle);
    expect(html).toContain(text.repositoryNavigationTitle);
    expect(html).toContain(text.summaryMetrics.schedulerState);
    expect(html).toContain(text.policyUpdatedSuccessfully);
  });
});
