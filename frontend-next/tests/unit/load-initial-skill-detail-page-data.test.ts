import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "@/src/lib/schemas/public";

vi.mock("@/src/lib/api/publicSkillDetail", () => ({
  fetchSkillDetail: vi.fn()
}));

vi.mock("@/src/features/public/publicSkillDetailFallback", () => ({
  buildPublicSkillDetailFallback: vi.fn(),
  buildPublicSkillFallbackRelatedSkills: vi.fn(),
  resolvePublicSkillFallback: vi.fn()
}));

import {
  fetchSkillDetail
} from "@/src/lib/api/publicSkillDetail";
import {
  buildPublicSkillDetailFallback,
  buildPublicSkillFallbackRelatedSkills,
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
    vi.mocked(buildPublicSkillFallbackRelatedSkills).mockReturnValue([
      {
        ...detailPayload.skill,
        id: 202,
        name: "Fallback Related Skill"
      }
    ]);
  });

  it("keeps the initial payload focused on detail when backend detail is available", async () => {
    vi.mocked(fetchSkillDetail).mockResolvedValue(detailPayload);

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(fetchSkillDetail).toHaveBeenCalledTimes(1);
    expect(buildPublicSkillFallbackRelatedSkills).not.toHaveBeenCalled();
    expect(payload.detail).toEqual(detailPayload);
    expect(payload.resources).toBeNull();
    expect(payload.versions).toBeNull();
    expect(payload.initialResourceContent).toBeNull();
  });

  it("keeps detail available when backend detail succeeds without preloading deferred data", async () => {
    vi.mocked(fetchSkillDetail).mockResolvedValue(detailPayload);

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(payload.detail).toEqual(detailPayload);
    expect(payload.resources).toBeNull();
    expect(payload.initialResourceContent).toBeNull();
  });

  it("keeps API related skills when they are already present", async () => {
    const apiRelatedSkill = {
      ...detailPayload.skill,
      id: 303,
      name: "API Related Skill"
    };
    vi.mocked(fetchSkillDetail).mockResolvedValue({
      ...detailPayload,
      related_skills: [apiRelatedSkill]
    });

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(buildPublicSkillFallbackRelatedSkills).not.toHaveBeenCalled();
    expect(payload.detail?.related_skills).toEqual([apiRelatedSkill]);
  });

  it("returns an explicit load failure instead of bundled fallback detail when backend detail fails", async () => {
    vi.mocked(fetchSkillDetail).mockRejectedValue(new Error("backend down"));
    vi.mocked(resolvePublicSkillFallback).mockReturnValue(detailPayload.skill);
    vi.mocked(buildPublicSkillDetailFallback).mockReturnValue({
      detail: detailPayload,
      resources: { skill_id: 101, repo_url: "", source_branch: "main", source_path: "SKILL.md", files: [] } as PublicSkillResourcesResponse,
      versions: { items: [], total: 0 } as PublicSkillVersionsResponse,
      resourceContent: {
        skill_id: 101,
        path: "SKILL.md",
        display_name: "SKILL.md",
        language: "Markdown",
        size_bytes: 10,
        size_label: "10 B",
        content: "# Release Readiness Checklist",
        updated_at: "2026-03-14T08:00:00Z"
      } as PublicSkillResourceContentResponse
    });

    const payload = await loadInitialSkillDetailPageData(new Headers(), 101);

    expect(resolvePublicSkillFallback).not.toHaveBeenCalled();
    expect(buildPublicSkillDetailFallback).not.toHaveBeenCalled();
    expect(payload.detail).toBeNull();
    expect(payload.resources).toBeNull();
    expect(payload.versions).toBeNull();
    expect(payload.initialResourceContent).toBeNull();
    expect(payload.errorMessage).toBe("backend down");
  });
});
