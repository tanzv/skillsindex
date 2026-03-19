import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceCategorySkillCard } from "@/src/features/public/marketplace/MarketplaceCategorySkillCard";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

vi.mock("next/navigation", () => ({
  usePathname: () => "/mobile/light/categories/operations",
  useRouter: () => ({
    refresh: () => {}
  })
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    as,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    as?: string;
    children: React.ReactNode;
  }) => createElement("a", { href, "data-as": as, ...props }, children)
}));

vi.mock("@/src/features/public/i18n/PublicI18nProvider", () => ({
  usePublicI18n: () => ({
    locale: "en",
    messages: {
      skillStarsSuffix: "stars",
      skillQualitySuffix: "quality",
      skillUpdatedPrefix: "updated",
      skillRecentlyUpdated: "recently updated"
    }
  })
}));

const marketplaceSkill: MarketplaceSkill = {
  id: 103,
  name: "Recovery Drill Planner",
  description: "Coordinate continuity rehearsals with evidence capture and rollback prompts.",
  content: "Recovery drill planner content.",
  category: "operations",
  subcategory: "recovery",
  tags: ["recovery", "drill", "continuity"],
  source_type: "manual",
  source_url: "",
  star_count: 141,
  quality_score: 8.9,
  install_command: "npx skillsindex install recovery-drill-planner",
  updated_at: "2026-03-07T15:45:00Z"
};

describe("MarketplaceCategorySkillCard", () => {
  it("renders canonical skill detail links for prefixed public category routes", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceCategorySkillCard, { item: marketplaceSkill }));

    expect(markup).toContain('aria-label="Recovery Drill Planner"');
    expect(markup).toContain('href="/skills/103"');
    expect(markup).toContain('data-as="/mobile/light/skills/103"');
    expect(markup).toContain("marketplace-category-skill-card");
    expect(markup).toContain("141");
  });
});
