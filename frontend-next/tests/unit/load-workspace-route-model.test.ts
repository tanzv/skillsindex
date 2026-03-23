import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";
import type { SessionContext } from "@/src/lib/schemas/session";

vi.mock("next/headers", () => ({
  headers: vi.fn()
}));

vi.mock("@/src/features/workspace/workspaceRouteDataLoader", () => ({
  loadWorkspaceRouteData: vi.fn()
}));

vi.mock("@/src/lib/i18n/protectedPageMessages.server", () => ({
  loadProtectedPageMessages: vi.fn()
}));

vi.mock("@/src/lib/i18n/serverLocale", () => ({
  resolveServerLocale: vi.fn()
}));

import { headers } from "next/headers";

import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";
import { loadWorkspaceRouteModel } from "@/src/features/workspace/loadWorkspaceRouteModel";
import { loadWorkspaceRouteData } from "@/src/features/workspace/workspaceRouteDataLoader";

import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const marketplacePayload = {
  filters: {},
  stats: {
    total_skills: 2,
    matching_skills: 2
  },
  pagination: {
    page: 1,
    page_size: 2,
    total_items: 2,
    total_pages: 1,
    prev_page: 0,
    next_page: 0
  },
  categories: [],
  top_tags: [{ name: "release", count: 2 }],
  items: [
    {
      id: 201,
      name: "Release Control",
      description: "Track release posture.",
      content: "content",
      category: "operations",
      subcategory: "release",
      tags: ["release"],
      source_type: "manual",
      source_url: "",
      star_count: 5,
      quality_score: 9.2,
      install_command: "npx skillsindex install release-control",
      updated_at: "2026-03-20T08:00:00Z"
    },
    {
      id: 202,
      name: "Policy Sentinel",
      description: "Review policy drift.",
      content: "content",
      category: "governance",
      subcategory: "policy",
      tags: ["policy"],
      source_type: "manual",
      source_url: "",
      star_count: 3,
      quality_score: 8.7,
      install_command: "npx skillsindex install policy-sentinel",
      updated_at: "2026-03-19T08:00:00Z"
    }
  ],
  summary: {
    landing: {
      total_skills: 2,
      category_count: 2,
      top_tag_count: 1,
      featured_skill_count: 2,
      latest_skill_count: 2
    },
    category_hub: {
      total_categories: 2,
      total_skills: 2,
      top_tag_count: 1,
      spotlight_category_count: 2
    },
    category_detail: null
  },
  session_user: null,
  can_access_dashboard: true
} satisfies PublicMarketplaceResponse;

const session: SessionContext = {
  user: {
    id: 9,
    username: "workspace-admin",
    displayName: "Workspace Admin",
    role: "admin",
    status: "active"
  },
  marketplacePublicAccess: false
};

describe("loadWorkspaceRouteModel", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(headers).mockResolvedValue(new Headers({ cookie: "session=test" }));
    vi.mocked(resolveServerLocale).mockResolvedValue("en");
    vi.mocked(loadProtectedPageMessages).mockResolvedValue(createProtectedPageTestMessages());
  });

  it("builds the workspace model from the real marketplace payload", async () => {
    vi.mocked(loadWorkspaceRouteData).mockResolvedValue(marketplacePayload);

    const model = await loadWorkspaceRouteModel("/workspace", session);

    expect(loadWorkspaceRouteData).toHaveBeenCalledTimes(1);
    const [route, requestHeaders] = vi.mocked(loadWorkspaceRouteData).mock.calls[0];
    expect(route).toBe("/workspace");
    expect(requestHeaders).toBeInstanceOf(Headers);
    expect(requestHeaders.get("cookie")).toBe("session=test");
    expect(model.summaryMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "metricInstalledSkillsLabel",
          value: "2"
        })
      ])
    );
  });

  it("throws when the marketplace payload cannot be loaded", async () => {
    vi.mocked(loadWorkspaceRouteData).mockRejectedValue(new Error("workspace marketplace down"));

    await expect(loadWorkspaceRouteModel("/workspace", session)).rejects.toThrow("workspace marketplace down");
  });

  it("uses the resolved workspace child route to scope marketplace loading", async () => {
    vi.mocked(loadWorkspaceRouteData).mockResolvedValue(marketplacePayload);

    await loadWorkspaceRouteModel("/workspace/policy", session);

    const [route, requestHeaders] = vi.mocked(loadWorkspaceRouteData).mock.calls[0];
    expect(route).toBe("/workspace/policy");
    expect(requestHeaders).toBeInstanceOf(Headers);
    expect(requestHeaders.get("cookie")).toBe("session=test");
  });
});
