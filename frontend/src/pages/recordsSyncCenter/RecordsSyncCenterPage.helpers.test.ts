import { describe, expect, it } from "vitest";

import {
  buildSyncRunsQuery,
  parseSyncPolicy,
  resolveAdminBase,
  resolveRecordsSyncActiveMenuID,
  resolveRecordsSyncSidebarGroups,
  resolveRecordsSyncViewKind
} from "./RecordsSyncCenterPage.helpers";

describe("RecordsSyncCenterPage.helpers", () => {
  it("resolves the correct sidebar menu item for ingestion and records routes", () => {
    expect(resolveRecordsSyncActiveMenuID("/admin/ingestion/repository")).toBe("skill-code-repository");
    expect(resolveRecordsSyncActiveMenuID("/light/admin/ingestion/manual")).toBe("skill-code-repository");
    expect(resolveRecordsSyncActiveMenuID("/mobile/light/admin/ingestion/upload")).toBe("skill-code-repository");
    expect(resolveRecordsSyncActiveMenuID("/admin/records/imports")).toBe("skill-sync-records");
    expect(resolveRecordsSyncActiveMenuID("/light/admin/records/sync-jobs")).toBe("skill-sync-records");
  });

  it("keeps admin base prefixes aligned with prototype route families", () => {
    expect(resolveAdminBase("/admin/ingestion/repository")).toBe("/admin");
    expect(resolveAdminBase("/light/admin/records/exports")).toBe("/light/admin");
    expect(resolveAdminBase("/mobile/admin/records/imports")).toBe("/mobile/admin");
    expect(resolveAdminBase("/mobile/light/admin/records/sync-jobs")).toBe("/mobile/light/admin");
  });

  it("builds sync run query strings with the live owner filter contract", () => {
    expect(buildSyncRunsQuery({ ownerFilter: "7", limit: "120" })).toBe("owner_id=7&limit=120");
    expect(buildSyncRunsQuery({ ownerFilter: "", limit: "999" })).toBe("limit=200");
    expect(buildSyncRunsQuery({ ownerFilter: " ", limit: "oops" })).toBe("limit=80");
  });

  it("accepts both wrapped and raw repository sync policy payloads", () => {
    expect(
      parseSyncPolicy({
        enabled: true,
        interval: "15m",
        timeout: "8m",
        batch_size: 50
      })
    ).toEqual({ enabled: true, interval: "15m", timeout: "8m", batch_size: 50 });

    expect(
      parseSyncPolicy({
        item: {
          enabled: false,
          interval: "30m",
          timeout: "10m",
          batch_size: 20
        }
      })
    ).toEqual({ enabled: false, interval: "30m", timeout: "10m", batch_size: 20 });
  });

  it("resolves repository routes as the repository view kind", () => {
    expect(resolveRecordsSyncViewKind("/admin/ingestion/repository")).toBe("repository");
    expect(resolveRecordsSyncViewKind("/light/admin/records/exports")).toBe("records");
  });

  it("keeps only skill management sidebar group for records sync pages", () => {
    const groups = [
      { id: "skill-management", title: "Skill Management", items: [] },
      { id: "user-management", title: "User Management", items: [] },
      { id: "system-settings", title: "System Settings", items: [] }
    ];

    expect(resolveRecordsSyncSidebarGroups(groups).map((group) => group.id)).toEqual(["skill-management"]);
    expect(resolveRecordsSyncSidebarGroups(groups.filter((group) => group.id !== "skill-management"))).toHaveLength(2);
  });
});
