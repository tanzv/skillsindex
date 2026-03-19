import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "@/src/lib/schemas/public";

vi.mock("@/src/lib/api/public", () => ({
  fetchSkillDetail: vi.fn(),
  fetchSkillResources: vi.fn(),
  fetchSkillVersions: vi.fn(),
  fetchSkillResourceContent: vi.fn()
}));

vi.mock("@/src/features/public/publicSkillDetailFallback", () => ({
  buildPublicSkillDetailFallback: vi.fn(),
  resolvePublicSkillFallback: vi.fn()
}));

import {
  fetchSkillDetail,
  fetchSkillResourceContent,
  fetchSkillResources,
  fetchSkillVersions
} from "@/src/lib/api/public";
import {
  buildPublicSkillDetailFallback,
  resolvePublicSkillFallback
} from "@/src/features/public/publicSkillDetailFallback";
import { loadInitialSkillDetailPageData } from "@/src/features/public/loadInitialSkillDetailPageData";

const detailPayload: PublicSkillDetailResponse = {
  skill: {
    id: 101,
    name: "Release Readiness Checklist",
    description: "Track release signals before production cutover.",
    content: "# Release Readiness Checklist",
    category: "operations",
    subcategory: "release",
    tags: ["release"],
    source_type: "manual",
    source_url: "",
    star_count: 120,
    quality_score: 9.3,
    install_command: "npx skillsindex install release-readiness",
    updated_at: "2026-03-14T08:00:00Z"
  },
  stats: {
    favorite_count: 20,
    rating_count: 10,
    rating_average: 9.3,
    comment_count: 2
  },
  viewer_state: {
    can_interact: false,
    favorited: false,
    rated: false,
    rating: 0
  },
  comments: [],
  comments_limit: 80
};

describe("loadInitialSkillDetailPageData", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("preloads resources and the first resource content when backend detail is available", async () => {
    const resourcesPayload = {
      skill_id: 101,
      repo_url: "https://example.com/repo",
      source_branch: "main",
      source_path: "SKILL.md",
      files: [
        {
          name: "SKILL.md",
          display_name: "SKILL.md",
          size_bytes: 100,
          size_label: "100 B",
          language: "Markdown"
        }
      ]
    } as PublicSkillResourcesResponse;
    const resourceContentPayload = {
      skill_id: 101,
      path: "SKILL.md",
      display_name: "SKILL.md",
      language: "Markdown",
      size_bytes: 100,
      size_label: "100 B",
      content: "# Release Readiness Checklist",
      updated_at: "2026-03-14T08:00:00Z"
    } as PublicSkillResourceContentResponse;

    vi.mocked(fetchSkillDetail).mockResolvedValue(detailPayload);
    vi.mocked(fetchSkillResources).mockResolvedValue(resourcesPayload);
    vi.mocked(fetchSkillResourceContent).mockResolvedValue(resourceContentPayload);

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(fetchSkillDetail).toHaveBeenCalledTimes(1);
    expect(fetchSkillResources).toHaveBeenCalledTimes(1);
    expect(fetchSkillVersions).not.toHaveBeenCalled();
    expect(fetchSkillResourceContent).toHaveBeenCalledWith(expect.any(Headers), 101, "SKILL.md");
    expect(payload.detail).toEqual(detailPayload);
    expect(payload.resources).toEqual(resourcesPayload);
    expect(payload.versions).toBeNull();
    expect(payload.initialResourceContent).toEqual(resourceContentPayload);
  });

  it("keeps detail available when resources preload fails", async () => {
    vi.mocked(fetchSkillDetail).mockResolvedValue(detailPayload);
    vi.mocked(fetchSkillResources).mockRejectedValue(new Error("resource preload failed"));

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(payload.detail).toEqual(detailPayload);
    expect(payload.resources).toBeNull();
    expect(payload.initialResourceContent).toBeNull();
  });

  it("falls back to the bundled skill payload when backend detail fails", async () => {
    const fallbackResources = { skill_id: 101, repo_url: "", source_branch: "main", source_path: "SKILL.md", files: [] } as PublicSkillResourcesResponse;
    const fallbackVersions = { items: [], total: 0 } as PublicSkillVersionsResponse;
    const fallbackResourceContent = {
      skill_id: 101,
      path: "SKILL.md",
      display_name: "SKILL.md",
      language: "Markdown",
      size_bytes: 10,
      size_label: "10 B",
      content: "# Release Readiness Checklist",
      updated_at: "2026-03-14T08:00:00Z"
    } as PublicSkillResourceContentResponse;

    vi.mocked(fetchSkillDetail).mockRejectedValue(new Error("backend down"));
    vi.mocked(resolvePublicSkillFallback).mockReturnValue(detailPayload.skill);
    vi.mocked(buildPublicSkillDetailFallback).mockReturnValue({
      detail: detailPayload,
      resources: fallbackResources,
      versions: fallbackVersions,
      resourceContent: fallbackResourceContent
    });

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(payload.detail).toEqual(detailPayload);
    expect(payload.resources).toEqual(fallbackResources);
    expect(payload.versions).toEqual(fallbackVersions);
    expect(payload.initialResourceContent).toEqual(fallbackResourceContent);
  });
});
