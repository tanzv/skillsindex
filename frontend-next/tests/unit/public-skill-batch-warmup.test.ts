import { describe, expect, it, vi } from "vitest";

import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import {
  buildPublicSkillBatchWarmupTargets,
  warmPublicSkillBatchRoutes
} from "@/src/features/public/marketplace/publicSkillBatchWarmup";

const skills: MarketplaceSkill[] = [
  {
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
  {
    id: 102,
    name: "Repository Intake Guide",
    description: "Validate repository structure before ingestion.",
    content: "# Repository Intake Guide",
    category: "operations",
    subcategory: "repository",
    tags: ["repository"],
    source_type: "manual",
    source_url: "",
    star_count: 98,
    quality_score: 8.7,
    install_command: "npx skillsindex install repository-intake",
    updated_at: "2026-03-14T08:00:00Z"
  },
  {
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
  }
];

describe("public skill batch warmup", () => {
  it("builds deduplicated skill detail warmup targets and respects the limit", () => {
    expect(buildPublicSkillBatchWarmupTargets(skills, (route) => `/light${route}`, 1)).toEqual([
      "/light/skills/101"
    ]);

    expect(buildPublicSkillBatchWarmupTargets(skills, (route) => `/light${route}`, 4)).toEqual([
      "/light/skills/101",
      "/light/skills/102"
    ]);
  });

  it("warms each skill detail route once with HEAD requests", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await warmPublicSkillBatchRoutes(fetchImpl, ["/light/skills/101", "/light/skills/102", "/light/skills/101"]);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenNthCalledWith(1, "/light/skills/101", {
      method: "HEAD",
      credentials: "same-origin"
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(2, "/light/skills/102", {
      method: "HEAD",
      credentials: "same-origin"
    });
  });
});
