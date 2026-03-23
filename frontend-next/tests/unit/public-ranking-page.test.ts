import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PublicRankingPage } from "@/src/features/public/PublicRankingPage";

import { buildPublicRankingResponseFixture } from "./stubs/publicRankingFixture";

vi.mock("next/link", () => ({
  default: ({
    href,
    as,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    as?: string;
    children: ReactNode;
  }) => createElement("a", { href, "data-as": as, ...props }, children)
}));

vi.mock("@/src/lib/routing/usePublicRouteState", () => ({
  usePublicRouteState: () => ({
    prefix: "/mobile/light",
    toPublicPath: (route: string) => `/mobile/light${route}`,
    toPublicLinkTarget: (route: string) => ({ href: route, as: `/mobile/light${route}` })
  })
}));

vi.mock("@/src/features/public/i18n/PublicI18nProvider", () => ({
  usePublicI18n: () => ({
    locale: "en",
    messages: {
      categoryBreadcrumbAriaLabel: "Category breadcrumb",
      rankingTitle: "Download Ranking",
      rankingDescription: "Compare the most installed and highest rated skills.",
      rankingComparedSuffix: "compared",
      rankingTopStarsPrefix: "Top stars",
      rankingAverageQualityPrefix: "Average quality",
      statTopQuality: "Top quality",
      statTopStars: "Stars",
      searchSortLabel: "Sort",
      rankingSortByStars: "Sort by stars",
      rankingSortByQuality: "Sort by quality",
      rankingTopHighlightsTitle: "Highlights",
      rankingTopHighlightsDescription: "Top marketplace entries.",
      rankingFullTitle: "Full ranking",
      rankingFullDescription: "All ranked skills.",
      rankingRankPrefix: "Rank",
      rankingSkillColumn: "Skill",
      shellCategories: "Categories",
      skillDetailFactUpdated: "Updated",
      rankingOpenSkillLabel: "Open skill",
      rankingCompareContextTitle: "Compare context",
      rankingCompareContextDescription: "Compare selected skills.",
      rankingCompareLeftSkillAriaLabel: "Left skill",
      rankingCompareRightSkillAriaLabel: "Right skill",
      rankingCompareButton: "Compare",
      rankingCategoryLeadersTitle: "Category leaders",
      rankingCategoryLeadersDescription: "Category leader board.",
      skillCountSuffix: "skills",
      rankingLeadingSkillPrefix: "Leading skill",
      shellHome: "Home",
      stageRankings: "Rankings",
      skillStarsSuffix: "stars",
      skillQualitySuffix: "quality",
      skillUpdatedPrefix: "Updated",
      searchRecentTitle: "Recent searches",
      searchRecentDescription: "Recent query history."
    }
  })
}));

vi.mock("@/src/features/public/marketplace/useMarketplaceTopbarSlots", () => ({
  useMarketplaceTopbarSlots: () => null
}));

vi.mock("@/src/features/public/marketplace/MarketplaceTopbarBreadcrumb", () => ({
  MarketplaceTopbarBreadcrumb: () => createElement("div", { "data-testid": "ranking-breadcrumb" }, "breadcrumb")
}));

vi.mock("@/src/features/public/marketplace/MarketplaceChipControlGroup", () => ({
  MarketplaceChipControlGroup: ({ items }: { items: Array<{ label: string }> }) =>
    createElement("div", null, items.map((item) => item.label).join(" | "))
}));

vi.mock("@/src/features/public/marketplace/MarketplaceResultsStage", () => ({
  MarketplaceResultsStage: ({ mainContent, sideContent }: { mainContent: ReactNode; sideContent: ReactNode }) =>
    createElement("div", null, mainContent, sideContent)
}));

vi.mock("@/src/features/public/marketplace/MarketplaceSupportCard", () => ({
  MarketplaceSupportCard: ({ title, children }: { title: string; children: ReactNode }) =>
    createElement("section", null, createElement("h3", null, title), children)
}));

vi.mock("@/src/features/public/marketplace/MarketplaceCompareForm", () => ({
  MarketplaceCompareForm: () => createElement("form", null, "compare form")
}));

vi.mock("@/src/features/public/marketplace/MarketplaceCompareSelectionList", () => ({
  MarketplaceCompareSelectionList: () => createElement("div", null, "compare selections")
}));

vi.mock("@/src/features/public/marketplace/MarketplaceCategoryLeadersList", () => ({
  MarketplaceCategoryLeadersList: () => createElement("div", null, "leaders")
}));

vi.mock("@/src/features/public/marketplace/MarketplaceRecentSearchesCard", () => ({
  MarketplaceRecentSearchesCard: () => createElement("div", null, "recent searches")
}));

describe("PublicRankingPage", () => {
  it("renders canonical skill detail links for prefixed ranking routes", () => {
    const ranking = buildPublicRankingResponseFixture("stars");
    const markup = renderToStaticMarkup(
      createElement(PublicRankingPage, {
        ranking,
        sortKey: "stars",
        comparePayload: null,
        leftSkillId: 0,
        rightSkillId: 0
      })
    );

    expect(markup).toContain("marketplace-ranking-highlight-card");
    expect(markup).toContain('href="/skills/101"');
    expect(markup).toContain('data-as="/mobile/light/skills/101"');
    expect(markup).toContain('class="marketplace-ranking-table-row"');
  });
});
