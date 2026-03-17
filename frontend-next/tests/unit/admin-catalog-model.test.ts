import { describe, expect, it } from "vitest";

import {
  buildAdminCatalogViewModel,
  normalizeJobsPayload,
  normalizeSkillsPayload,
  normalizeSyncJobsPayload,
  normalizeSyncPolicyPayload
} from "@/src/features/adminCatalog/model";

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
          updated_at: "2026-03-10T08:00:00Z"
        },
        {
          id: 2,
          name: "Repository Sync Auditor",
          category: "engineering",
          source_type: "repository",
          visibility: "private",
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
        expect.objectContaining({ label: "Public Skills", value: "1" })
      ])
    );
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
});
