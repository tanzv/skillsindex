import { describe, expect, it } from "vitest";

import {
  buildAdminIngestionMetrics,
  normalizeImportJobsPayload,
  normalizeRepositorySyncPolicyPayload,
  normalizeSkillInventoryPayload,
  normalizeSyncRunsPayload
} from "@/src/features/adminIngestion/model";

describe("admin ingestion model", () => {
  it("normalizes skill inventory and repository policy", () => {
    const skills = normalizeSkillInventoryPayload({
      total: 2,
      items: [
        { id: 1, name: "Manual Skill", source_type: "manual", visibility: "public", owner_username: "alice", updated_at: "2026-03-14T10:00:00Z" },
        { id: 2, name: "Repository Skill", source_type: "repository", visibility: "private", owner_username: "bob", updated_at: "2026-03-14T11:00:00Z" }
      ]
    });

    const policy = normalizeRepositorySyncPolicyPayload({
      enabled: true,
      interval: "15m",
      timeout: "5m",
      batch_size: 30
    });

    expect(skills.total).toBe(2);
    expect(skills.items[0]).toEqual(expect.objectContaining({ name: "Manual Skill", sourceType: "manual" }));
    expect(policy).toEqual({
      enabled: true,
      interval: "15m",
      timeout: "5m",
      batchSize: 30
    });
  });

  it("builds repository and import metrics", () => {
    const skills = normalizeSkillInventoryPayload({
      total: 4,
      items: [
        { id: 1, name: "Repo A", source_type: "repository", visibility: "private", owner_username: "alice", updated_at: "2026-03-14T10:00:00Z" },
        { id: 2, name: "Repo B", source_type: "repository", visibility: "public", owner_username: "alice", updated_at: "2026-03-14T11:00:00Z" },
        { id: 3, name: "Archive A", source_type: "upload", visibility: "private", owner_username: "bob", updated_at: "2026-03-14T12:00:00Z" },
        { id: 4, name: "SkillMP A", source_type: "skillmp", visibility: "public", owner_username: "carol", updated_at: "2026-03-14T13:00:00Z" }
      ]
    });
    const jobs = normalizeImportJobsPayload({
      total: 2,
      items: [
        { id: 5, job_type: "import_upload", status: "failed", target_skill_id: 3, created_at: "2026-03-14T10:00:00Z", updated_at: "2026-03-14T10:05:00Z" },
        { id: 6, job_type: "import_skillmp", status: "running", target_skill_id: 4, created_at: "2026-03-14T11:00:00Z", updated_at: "2026-03-14T11:05:00Z" }
      ]
    });
    const syncRuns = normalizeSyncRunsPayload({
      total: 2,
      items: [
        { id: 7, trigger: "manual", scope: "repository", status: "success", failed: 0, synced: 12, started_at: "2026-03-14T10:00:00Z" },
        { id: 8, trigger: "scheduler", scope: "repository", status: "failed", failed: 3, synced: 2, started_at: "2026-03-14T11:00:00Z" }
      ]
    });

    const repositoryMetrics = buildAdminIngestionMetrics("/admin/ingestion/repository", {
      skills: skills.items,
      importJobs: jobs.items,
      syncRuns: syncRuns.items,
      policy: { enabled: true, interval: "15m", timeout: "5m", batchSize: 30 }
    });
    const importMetrics = buildAdminIngestionMetrics("/admin/records/imports", {
      skills: skills.items,
      importJobs: jobs.items,
      syncRuns: syncRuns.items,
      policy: { enabled: true, interval: "15m", timeout: "5m", batchSize: 30 }
    });

    expect(repositoryMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Repository Skills", value: "2" }),
        expect.objectContaining({ label: "Failed Runs", value: "1" })
      ])
    );
    expect(importMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Archive Imports", value: "1" }),
        expect.objectContaining({ label: "SkillMP Imports", value: "1" }),
        expect.objectContaining({ label: "Import Jobs", value: "2" })
      ])
    );
  });
});
