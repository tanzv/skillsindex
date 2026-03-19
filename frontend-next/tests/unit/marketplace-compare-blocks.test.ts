import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceCategoryLeadersList } from "@/src/features/public/marketplace/MarketplaceCategoryLeadersList";
import { MarketplaceCompareForm } from "@/src/features/public/marketplace/MarketplaceCompareForm";
import { MarketplaceCompareSelectionList } from "@/src/features/public/marketplace/MarketplaceCompareSelectionList";

describe("MarketplaceCompareForm", () => {
  it("renders compare controls with hidden fields", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceCompareForm, {
        action: "/rankings",
        items: [
          { id: 101, name: "Deploy Guard" },
          { id: 102, name: "Repository Radar" }
        ],
        leftValue: "101",
        rightValue: "102",
        leftAriaLabel: "Left skill",
        rightAriaLabel: "Right skill",
        submitLabel: "Compare",
        hiddenFields: [{ name: "sort", value: "stars" }]
      })
    );

    expect(markup).toContain("name=\"sort\"");
    expect(markup).toContain("Deploy Guard");
    expect(markup).toContain("Repository Radar");
    expect(markup).toContain(">Compare<");
  });
});

describe("MarketplaceCompareSelectionList", () => {
  it("renders selected skills and summary chips", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceCompareSelectionList, {
        items: [
          {
            key: "left-101",
            label: "Left skill",
            title: "Deploy Guard",
            description: "Checks release readiness.",
            metrics: ["Operations", "240 stars", "4.9 quality"]
          }
        ]
      })
    );

    expect(markup).toContain("Left skill");
    expect(markup).toContain("Deploy Guard");
    expect(markup).toContain("Checks release readiness.");
    expect(markup).toContain("240 stars");
  });
});

describe("MarketplaceCategoryLeadersList", () => {
  it("renders ranking category summaries", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceCategoryLeadersList, {
        leaders: [
          {
            category: "Operations",
            count: 6,
            averageQuality: 4.8,
            leadingSkillName: "Deploy Guard"
          }
        ],
        skillCountSuffix: "skills",
        leadingSkillPrefix: "Leading skill",
        averageQualityPrefix: "Average quality"
      })
    );

    expect(markup).toContain("Operations");
    expect(markup).toContain("6 skills");
    expect(markup).toContain("Leading skill: Deploy Guard");
    expect(markup).toContain("Average quality 4.8");
  });
});
