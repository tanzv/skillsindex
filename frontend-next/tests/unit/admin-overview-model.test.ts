import { describe, expect, it } from "vitest";

import { buildAdminOverviewMetrics, normalizeAdminOverviewPayload } from "@/src/features/adminOverview/model";

describe("admin overview model", () => {
  it("normalizes counts and capability flags", () => {
    const snapshot = normalizeAdminOverviewPayload({
      counts: {
        total: 120,
        public: 48,
        private: 72,
        syncable: 33,
        org_count: 9,
        account_count: 64
      },
      capabilities: {
        can_manage_users: true,
        can_view_all: false
      }
    });

    expect(snapshot).toEqual({
      totalSkills: 120,
      publicSkills: 48,
      privateSkills: 72,
      syncableSkills: 33,
      organizationCount: 9,
      accountCount: 64,
      canManageUsers: true,
      canViewAllSkills: false
    });
  });

  it("builds overview metrics from normalized snapshot", () => {
    const metrics = buildAdminOverviewMetrics({
      totalSkills: 120,
      publicSkills: 48,
      privateSkills: 72,
      syncableSkills: 33,
      organizationCount: 9,
      accountCount: 64,
      canManageUsers: true,
      canViewAllSkills: false
    });

    expect(metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Total Skills", value: "120" }),
        expect.objectContaining({ label: "Organizations", value: "9" }),
        expect.objectContaining({ label: "Manage Users", value: "Enabled" })
      ])
    );
  });
});
