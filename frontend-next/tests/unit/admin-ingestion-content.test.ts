import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminIngestionContent } from "@/src/features/adminIngestion/AdminIngestionContent";
import type { AdminIngestionRoute } from "@/src/features/adminIngestion/model";

function renderAdminIngestionRoute(route: AdminIngestionRoute) {
  return renderToStaticMarkup(
    createElement(AdminIngestionContent, {
      route,
      title: "Ingestion",
      description: "Route specific ingestion view",
      loading: false,
      error: "",
      message: "",
      metrics: [{ label: "Inventory", value: "2" }],
      onRefresh: () => undefined,
      manualView: {
        draft: {
          name: "Manual Skill",
          description: "Manual description",
          content: "skill content",
          tags: "manual ops",
          visibility: "private",
          install_command: "uvx install manual"
        },
        skills: [
          {
            id: 11,
            name: "Manual Skill",
            description: "Manual description",
            sourceType: "manual",
            visibility: "private",
            ownerUsername: "ops.lead",
            updatedAt: "2026-03-16T08:00:00Z"
          }
        ],
        busyAction: "",
        onDraftChange: () => undefined,
        onSubmit: () => undefined
      },
      repositoryView: {
        draft: {
          repo_url: "https://github.com/example/repo",
          repo_branch: "main",
          repo_path: "skills/catalog",
          tags: "repository",
          visibility: "public",
          install_command: "uvx install repo"
        },
        skills: [
          {
            id: 21,
            name: "Repository Skill",
            description: "Repository description",
            sourceType: "repository",
            visibility: "public",
            ownerUsername: "repo.bot",
            updatedAt: "2026-03-16T08:00:00Z"
          }
        ],
        policy: {
          enabled: true,
          interval: "15m",
          timeout: "5m",
          batchSize: 30
        },
        syncRuns: [
          {
            id: 41,
            trigger: "schedule",
            scope: "repository",
            status: "success",
            failed: 0,
            synced: 12,
            startedAt: "2026-03-16T08:10:00Z"
          }
        ],
        busyAction: "",
        onDraftChange: () => undefined,
        onPolicyChange: () => undefined,
        onSubmit: () => undefined,
        onSavePolicy: () => undefined
      },
      importsView: {
        draft: {
          archive_tags: "archive",
          archive_visibility: "private",
          archive_install_command: "npx import archive",
          skillmp_url: "https://skillmp.example.com/42",
          skillmp_id: "skillmp-42",
          skillmp_token: "token",
          skillmp_tags: "skillmp",
          skillmp_visibility: "public",
          skillmp_install_command: "npx import skillmp"
        },
        selectedArchiveName: "archive-42.zip",
        skills: [
          {
            id: 31,
            name: "Imported Skill",
            description: "Imported description",
            sourceType: "upload",
            visibility: "private",
            ownerUsername: "import.bot",
            updatedAt: "2026-03-16T08:00:00Z"
          }
        ],
        jobs: [
          {
            id: 81,
            jobType: "import_archive",
            status: "failed",
            targetSkillId: 31,
            errorMessage: "archive parse failed",
            createdAt: "2026-03-16T08:00:00Z",
            updatedAt: "2026-03-16T08:01:00Z"
          }
        ],
        busyAction: "",
        onDraftChange: () => undefined,
        onArchiveFileChange: () => undefined,
        onSubmitArchive: () => undefined,
        onSubmitSkillMP: () => undefined,
        onRunJobAction: () => undefined
      }
    })
  );
}

describe("admin ingestion content", () => {
  it("renders the manual route as authoring plus manual inventory", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/manual");

    expect(markup).toContain("Manual Authoring");
    expect(markup).toContain("Manual Inventory");
    expect(markup).toContain("Publishing Guardrails");
    expect(markup).not.toContain("Scheduler Policy");
  });

  it("renders the repository route as intake, inventory, policy, and sync evidence", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/repository");

    expect(markup).toContain("Repository Intake");
    expect(markup).toContain("Repository Inventory");
    expect(markup).toContain("Scheduler Policy");
    expect(markup).toContain("Recent Sync Runs");
    expect(markup).not.toContain("Import Jobs");
  });

  it("renders the imports route as source forms plus import jobs", () => {
    const markup = renderAdminIngestionRoute("/admin/records/imports");

    expect(markup).toContain("Archive Import");
    expect(markup).toContain("SkillMP Import");
    expect(markup).toContain("Imported Inventory");
    expect(markup).toContain("Import Jobs");
    expect(markup).toContain("Selected archive: archive-42.zip");
  });
});
