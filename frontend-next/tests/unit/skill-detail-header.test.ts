import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SkillDetailHeader } from "@/src/features/public/skill-detail/SkillDetailHeader";
import type { PublicSkillDetailModel } from "@/src/features/public/publicSkillDetailModel";

describe("SkillDetailHeader", () => {
  it("renders a compact identity block with derived monogram and source label", () => {
    const model: PublicSkillDetailModel = {
      summaryMetrics: [
        { label: "Quality", value: "9.6" },
        { label: "Favorites", value: "104" }
      ],
      overviewFacts: [],
      installationSteps: [],
      resourceInsights: [],
      versionHighlights: [],
      relatedSkills: []
    };

    const markup = renderToStaticMarkup(
      createElement(SkillDetailHeader, {
        detail: {
          skill: {
            id: 101,
            name: "Release Readiness Checklist",
            description: "Review release gates, rollout blockers, and owner readiness before shipping.",
            content: "# Release Readiness Checklist",
            category: "programming-development",
            subcategory: "devops-cloud",
            tags: ["release", "ops"],
            source_type: "repository",
            source_url: "https://github.com/skillsindex/release-readiness-checklist",
            star_count: 1204,
            quality_score: 9.6,
            install_command: "npx skill install",
            updated_at: "2026-03-14T08:00:00Z"
          },
          stats: {
            favorite_count: 104,
            rating_count: 22,
            rating_average: 9.6,
            comment_count: 3
          },
          viewer_state: {
            can_interact: false,
            favorited: false,
            rated: false,
            rating: 0
          },
          comments: [],
          comments_limit: 80
        },
        locale: "en",
        messages: {
          stageSkillDetail: "Skill Detail",
          skillDetailFactUpdated: "Updated",
          skillDetailFactStars: "Stars",
          skillDetailNotAvailable: "Not available",
          skillDetailFactCategory: "Category",
          skillDetailFactSourceType: "Source"
        },
        model
      })
    );

    expect(markup).toContain('data-testid="skill-detail-header-identity"');
    expect(markup).toContain(">RR<");
    expect(markup).toContain(">repository<");
    expect(markup).toContain(">skillsindex/release-readiness-checklist<");
    expect(markup).toContain(">9.6<");
  });
});
