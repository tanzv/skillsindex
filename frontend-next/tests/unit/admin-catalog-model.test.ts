import { describe, expect, it } from "vitest";

import {
  buildAdminCatalogViewModel,
  normalizeJobsPayload,
  normalizeSkillsPayload,
  normalizeSyncJobsPayload,
  normalizeSyncPolicyPayload
} from "@/src/features/adminCatalog/model";

import { createProtectedPageTestMessages } from "./protected-page-test-messages";

describe("admin catalog model", () => {
  it("builds skill inventory metrics and rows", () => {
    const payload = normalizeSkillsPayload({
      total: 2,
      items: [
        {
          id: 1,
          name: "Release Readiness Checklist",
          category: "operations",
          source_type: "manual",
          visibility: "public",
          owner_username: "ops.lead",
          star_count: 184,
          quality_score: 9.3,
          updated_at: "2026-03-10T08:00:00Z",
          source_analysis: {
            entry_file: "README.md",
            mechanism: "skill_manifest",
            metadata_sources: ["README.md", "package.json"],
            reference_paths: ["skills/release"],
            dependencies: [
              { kind: "skill", target: "repository-sync-auditor" },
              { kind: "skill", target: "using-superpowers" }
            ]
          }
        },
        {
          id: 2,
          name: "Repository Sync Auditor",
          category: "engineering",
          source_type: "repository",
          visibility: "public",
          owner_username: "platform.owner",
          star_count: 163,
          quality_score: 9.1,
          updated_at: "2026-03-08T10:30:00Z"
        }
      ]
    });

    const model = buildAdminCatalogViewModel("/admin/skills", payload);

    expect(model.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Total Skills", value: "2" }),
        expect.objectContaining({ label: "Public Skills", value: "2" })
      ])
    );
    expect(payload.items[0]?.sourceAnalysis).toEqual({
      entryFile: "README.md",
      mechanism: "skill_manifest",
      metadataSources: ["README.md", "package.json"],
      referencePaths: ["skills/release"],
      dependencies: [
        { kind: "skill", target: "repository-sync-auditor" },
        { kind: "skill", target: "using-superpowers" }
      ]
    });
    expect(payload.items[1]?.sourceAnalysis).toEqual({
      entryFile: "",
      mechanism: "",
      metadataSources: [],
      referencePaths: [],
      dependencies: []
    });
    expect(model.table?.rows[0]?.detailTopology).toEqual({
      title: "Topology",
      rootLabel: "Skill Entry",
      rootValue: "README.md",
      rootMetaLabel: "Mechanism",
      rootMetaValue: "skill_manifest",
      lanes: [
        {
          title: "Metadata Sources",
          nodes: [
            { value: "README.md", href: "/admin/skills?q=README.md" },
            { value: "package.json", href: "/admin/skills?q=package.json" }
          ],
          emptyValue: "No metadata sources detected"
        },
        {
          title: "Reference Paths",
          nodes: [{ value: "skills/release", href: "/admin/skills?q=skills%2Frelease" }],
          emptyValue: "No reference paths detected"
        },
        {
          title: "Dependencies",
          nodes: [
            { label: "skill", value: "repository-sync-auditor", href: "/skills/2" },
            { label: "skill", value: "using-superpowers", href: "/admin/skills?q=using-superpowers" }
          ],
          emptyValue: "No dependencies detected"
        }
      ]
    });
    expect(model.table?.rows[0]?.detailSections).toEqual([
      {
        title: "Source Analysis",
        items: [
          { label: "Entry File", value: "README.md" },
          { label: "Mechanism", value: "skill_manifest" }
        ]
      },
      {
        title: "Metadata Sources",
        items: [
          { value: "README.md", href: "/admin/skills?q=README.md" },
          { value: "package.json", href: "/admin/skills?q=package.json" }
        ]
      },
      {
        title: "Reference Paths",
        items: [{ value: "skills/release", href: "/admin/skills?q=skills%2Frelease" }]
      },
      {
        title: "Dependencies",
        items: [
          { label: "skill", value: "repository-sync-auditor", href: "/skills/2" },
          { label: "skill", value: "using-superpowers", href: "/admin/skills?q=using-superpowers" }
        ]
      }
    ]);
    expect(model.table?.rows[1]?.detailTopology).toBeUndefined();
    expect(model.table?.rows[1]?.detailSections).toBeUndefined();
    expect(model.table?.rows[0]?.name).toBe("Release Readiness Checklist");
  });

  it("builds job health metrics and highlights retry pressure", () => {
    const payload = normalizeJobsPayload({
      total: 3,
      items: [
        {
          id: 31,
          job_type: "repo_sync",
          status: "running",
          owner_user_id: 7,
          actor_user_id: 7,
          target_skill_id: 101,
          attempt: 1,
          max_attempts: 3,
          created_at: "2026-03-10T08:00:00Z",
          updated_at: "2026-03-10T08:10:00Z"
        },
        {
          id: 32,
          job_type: "import_skillmp",
          status: "failed",
          owner_user_id: 8,
          actor_user_id: 8,
          target_skill_id: 102,
          attempt: 3,
          max_attempts: 3,
          created_at: "2026-03-10T09:00:00Z",
          updated_at: "2026-03-10T09:03:00Z"
        }
      ]
    });

    const model = buildAdminCatalogViewModel("/admin/jobs", payload);

    expect(model.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Running Jobs", value: "1" }),
        expect.objectContaining({ label: "Failed Jobs", value: "1" })
      ])
    );
    expect(model.sidePanel[0]?.title).toBe("Execution Signals");
  });

  it("builds sync policy editor values from the current policy payload", () => {
    const payload = normalizeSyncPolicyPayload({
      enabled: true,
      interval: "15m",
      timeout: "5m",
      batch_size: 25
    });

    const model = buildAdminCatalogViewModel("/admin/sync-policy/repository", payload);

    expect(model.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Scheduler Enabled", value: "Yes" }),
        expect.objectContaining({ label: "Batch Size", value: "25" })
      ])
    );
    expect(model.editor).toEqual(
      expect.objectContaining({
        interval: "15m",
        timeout: "5m",
        batchSize: 25,
        enabled: true
      })
    );
  });

  it("normalizes sync run totals and durations", () => {
    const payload = normalizeSyncJobsPayload({
      total: 1,
      items: [
        {
          id: 41,
          trigger: "schedule",
          scope: "repository",
          status: "success",
          candidates: 12,
          synced: 11,
          failed: 1,
          duration_ms: 6200,
          started_at: "2026-03-10T08:00:00Z",
          finished_at: "2026-03-10T08:00:06Z"
        }
      ]
    });

    const model = buildAdminCatalogViewModel("/admin/sync-jobs", payload);

    expect(model.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Sync Runs", value: "1" }),
        expect.objectContaining({ label: "Failed Items", value: "1" })
      ])
    );
    expect(model.table?.rows[0]?.summary).toContain("11 synced");
  });

  it("localizes catalog display labels and fallbacks with injected page messages", () => {
    const messages = createProtectedPageTestMessages({
      adminCatalog: {
        valueUnnamedSkill: "catalog_name_custom",
        valueGeneralCategory: "catalog_category_custom",
        valueUnknownOwner: "catalog_owner_custom",
        sourceTypeRepository: "catalog_repository_custom",
        visibilityPrivate: "catalog_private_custom",
        statusFailed: "catalog_status_failed_custom",
        statusSuccess: "catalog_status_success_custom",
        triggerSchedule: "catalog_trigger_schedule_custom",
        scopeRepository: "catalog_scope_repository_custom",
        jobTypeRepositorySync: "catalog_job_repo_sync_custom"
      }
    }).adminCatalog;

    const skillsModel = buildAdminCatalogViewModel(
      "/admin/skills",
      normalizeSkillsPayload({
        total: 1,
        items: [
          {
            id: 8,
            name: "",
            category: "",
            source_type: "repository",
            visibility: "private",
            owner_username: "",
            star_count: 0,
            quality_score: 0,
            updated_at: ""
          }
        ]
      }),
      { messages }
    );
    const jobsModel = buildAdminCatalogViewModel(
      "/admin/jobs",
      normalizeJobsPayload({
        total: 1,
        items: [
          {
            id: 9,
            job_type: "repo_sync",
            status: "failed",
            owner_user_id: 7,
            actor_user_id: 8,
            target_skill_id: 108,
            attempt: 1,
            max_attempts: 3,
            created_at: "",
            updated_at: ""
          }
        ]
      }),
      { messages }
    );
    const syncRunsModel = buildAdminCatalogViewModel(
      "/admin/sync-jobs",
      normalizeSyncJobsPayload({
        total: 1,
        items: [
          {
            id: 10,
            trigger: "schedule",
            scope: "repository",
            status: "success",
            candidates: 2,
            synced: 2,
            failed: 0,
            duration_ms: 1000,
            started_at: "",
            finished_at: ""
          }
        ]
      }),
      { messages }
    );

    expect(skillsModel.table?.rows[0]).toEqual(
      expect.objectContaining({
        name: "catalog_name_custom",
        summary: "catalog_category_custom · catalog_repository_custom · catalog_owner_custom",
        statusLabel: "catalog_private_custom"
      })
    );
    expect(jobsModel.table?.rows[0]).toEqual(
      expect.objectContaining({
        name: "catalog_job_repo_sync_custom #9",
        statusLabel: "catalog_status_failed_custom"
      })
    );
    expect(syncRunsModel.table?.rows[0]).toEqual(
      expect.objectContaining({
        name: "catalog_trigger_schedule_custom · catalog_scope_repository_custom",
        statusLabel: "catalog_status_success_custom"
      })
    );
  });
});
