import { describe, expect, it } from "vitest";

import {
  buildModuleActions,
  computeAdminOverviewScale,
  fallbackErrorMessage,
  normalizeOverview,
  parseBoolean,
  parseNumber,
  parseString,
  ratioPart,
  type OverviewState
} from "./AdminOverviewPage.helpers";

function createOverview(overrides: Partial<OverviewState> = {}): OverviewState {
  return {
    username: "admin",
    role: "administrator",
    totalSkills: 100,
    publicSkills: 40,
    privateSkills: 60,
    syncableSkills: 55,
    organizationCount: 12,
    accountCount: 88,
    canManageUsers: true,
    canViewAllSkills: true,
    ...overrides
  };
}

describe("parseNumber", () => {
  it("parses finite numbers and numeric strings", () => {
    expect(parseNumber(8)).toBe(8);
    expect(parseNumber("12.5")).toBe(12.5);
  });

  it("falls back for invalid values", () => {
    expect(parseNumber("abc", 7)).toBe(7);
    expect(parseNumber(NaN, 3)).toBe(3);
    expect(parseNumber(undefined, 9)).toBe(9);
  });
});

describe("parseString", () => {
  it("trims input string and preserves content", () => {
    expect(parseString("  admin  ")).toBe("admin");
  });

  it("falls back for empty-like values", () => {
    expect(parseString("", "viewer")).toBe("viewer");
    expect(parseString(undefined, "-")).toBe("-");
  });
});

describe("parseBoolean", () => {
  it("handles native booleans and string booleans", () => {
    expect(parseBoolean(true)).toBe(true);
    expect(parseBoolean(false)).toBe(false);
    expect(parseBoolean("true")).toBe(true);
    expect(parseBoolean("false")).toBe(false);
  });

  it("falls back for unsupported values", () => {
    expect(parseBoolean("TRUE", true)).toBe(true);
    expect(parseBoolean(1, false)).toBe(false);
  });
});

describe("normalizeOverview", () => {
  it("normalizes payload values and clamps negative counts", () => {
    const normalized = normalizeOverview({
      user: { username: "  owner  ", role: "  super-admin " },
      counts: {
        total: "30",
        public: 11,
        private: "19",
        syncable: -2,
        org_count: "-3",
        account_count: "12"
      },
      capabilities: {
        can_manage_users: "true",
        can_view_all: false
      }
    });

    expect(normalized).toEqual({
      username: "owner",
      role: "super-admin",
      totalSkills: 30,
      publicSkills: 11,
      privateSkills: 19,
      syncableSkills: 0,
      organizationCount: 0,
      accountCount: 12,
      canManageUsers: true,
      canViewAllSkills: false
    });
  });

  it("uses default fallback values when payload is null", () => {
    expect(normalizeOverview(null)).toEqual({
      username: "-",
      role: "viewer",
      totalSkills: 0,
      publicSkills: 0,
      privateSkills: 0,
      syncableSkills: 0,
      organizationCount: 0,
      accountCount: 0,
      canManageUsers: false,
      canViewAllSkills: false
    });
  });
});

describe("ratioPart", () => {
  it("computes rounded percentage and clamps range", () => {
    expect(ratioPart(5, 20)).toBe(25);
    expect(ratioPart(13, 33)).toBe(39);
    expect(ratioPart(120, 100)).toBe(100);
  });

  it("returns zero for non-positive totals or negative values", () => {
    expect(ratioPart(5, 0)).toBe(0);
    expect(ratioPart(-5, 20)).toBe(0);
  });
});

describe("progress computations from normalized state", () => {
  it("supports public/private/sync coverage calculations", () => {
    const overview = createOverview({ totalSkills: 20, publicSkills: 5, privateSkills: 15, syncableSkills: 8 });
    const normalizedTotal = Math.max(overview.totalSkills, 1);

    expect(ratioPart(overview.publicSkills, normalizedTotal)).toBe(25);
    expect(ratioPart(overview.privateSkills, normalizedTotal)).toBe(75);
    expect(ratioPart(overview.syncableSkills, normalizedTotal)).toBe(40);
  });
});

describe("fallbackErrorMessage", () => {
  it("exposes stable fallback error copy", () => {
    expect(fallbackErrorMessage).toBe("Failed to load admin overview");
  });
});

describe("buildModuleActions", () => {
  it("builds six module cards with expected route mapping", () => {
    const actions = buildModuleActions("/admin");
    expect(actions).toHaveLength(6);
    expect(actions[0]).toEqual({
      title: "Import Center",
      subtitle: "records · dialog · validation",
      path: "/admin/records/exports"
    });
    expect(actions[3]?.path).toBe("/admin/integrations/list");
    expect(actions[4]?.path).toBe("/admin/incidents/list");
  });
});

describe("computeAdminOverviewScale", () => {
  it("returns one for full canvas viewport", () => {
    expect(computeAdminOverviewScale(1440, 900)).toBe(1);
  });

  it("shrinks for smaller viewports", () => {
    expect(computeAdminOverviewScale(512, 342)).toBeCloseTo(0.356, 3);
  });

  it("returns positive fallback for invalid values", () => {
    expect(computeAdminOverviewScale(0, 0)).toBeGreaterThan(0);
  });
});
