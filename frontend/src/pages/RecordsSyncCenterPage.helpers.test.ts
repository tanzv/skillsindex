import { describe, expect, it } from "vitest";

import { resolveAdminBase, resolveRecordsSyncActiveMenuID } from "./RecordsSyncCenterPage.helpers";

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
});
