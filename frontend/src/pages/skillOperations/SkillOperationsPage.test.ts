import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SkillOperationsPage, { SkillOperationsPageContent } from "./SkillOperationsPage";

const baseProps = {
  locale: "en" as const,
  loading: false,
  error: "",
  message: "",
  submittingAction: "" as const,
  skills: [],
  importJobs: [],
  syncRuns: [],
  selectedRunID: 0,
  syncDetail: null,
  policy: {
    enabled: false,
    interval: "30m",
    timeout: "10m",
    batch_size: 20
  },
  onRefresh: () => undefined,
  onSubmitManual: async () => undefined,
  onSubmitRepository: async () => undefined,
  onSubmitArchiveImport: async () => undefined,
  onSubmitSkillMPImport: async () => undefined,
  onRunRepositorySyncBatch: async () => undefined,
  onRetryImportJob: async () => undefined,
  onCancelImportJob: async () => undefined,
  onSelectRun: () => undefined,
  onSavePolicy: async () => undefined,
  onPolicyChange: () => undefined,
  onNavigate: () => undefined
};

describe("SkillOperationsPageContent", () => {
  it("renders skill operations routes as content-only pages", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsPage, {
        locale: "en",
        route: "/admin/ingestion/repository",
        onNavigate: () => undefined
      })
    );

    expect(html).not.toContain("workspace-prototype-utility-frame");
    expect(html).toContain("Loading skill operations workbench...");
  });

  it("renders the manual ingestion workbench", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsPageContent, {
        ...baseProps,
        route: "/admin/ingestion/manual"
      })
    );

    expect(html).toContain("Manual Ingestion");
    expect(html).toContain("Create Manual Skill");
  });

  it("renders the repository ingestion workbench", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsPageContent, {
        ...baseProps,
        route: "/admin/ingestion/repository"
      })
    );

    expect(html).toContain("Repository Ingestion");
    expect(html).toContain("Sync Repository Skill");
    expect(html).toContain("Run Repository Sync");
    expect(html).toContain("Repository Sync Policy");
  });

  it("renders the imports workbench", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsPageContent, {
        ...baseProps,
        route: "/admin/records/imports"
      })
    );

    expect(html).toContain("Import Center");
    expect(html).toContain("Import Archive");
    expect(html).toContain("Import SkillMP");
    expect(html).toContain("Import Jobs");
  });

  it("renders the sync runs workbench", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsPageContent, {
        ...baseProps,
        route: "/admin/sync-jobs"
      })
    );

    expect(html).toContain("Sync Runs");
    expect(html).toContain("Refresh Runs");
    expect(html).toContain("Selected Run Detail");
  });
});
