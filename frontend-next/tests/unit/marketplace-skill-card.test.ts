import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceSkillCard } from "@/src/features/public/marketplace/MarketplaceSkillCard";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

vi.mock("next/navigation", () => ({
  usePathname: () => "/categories/operations",
  useRouter: () => ({
    refresh: () => {}
  })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) =>
    createElement("a", { href, ...props }, children)
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

describe("MarketplaceSkillCard", () => {
  it("uses the skill name as the primary link accessible label", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceSkillCard, { item: marketplaceSkill }));

    expect(markup).toContain('aria-label="Recovery Drill Planner"');
    expect(markup).toContain('href="/skills/103"');
  });
});
