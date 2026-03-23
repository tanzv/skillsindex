import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PublicComparePage } from "@/src/features/public/PublicComparePage";
import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";

vi.mock("next/navigation", () => ({
  usePathname: () => "/light/compare"
}));

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

describe("PublicComparePage", () => {
  it("renders the shared compare form and support cards", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const markup = renderToStaticMarkup(
      createElement(PublicComparePage, {
        marketplace,
        comparePayload: {
          left_skill: marketplace.items[0],
          right_skill: marketplace.items[1]
        },
        leftSkillId: marketplace.items[0].id,
        rightSkillId: marketplace.items[1].id
      })
    );

    expect(markup).toContain("Skill Compare");
    expect(markup).toContain("Selected skills");
    expect(markup).toContain("Compare skills");
    expect(markup).toContain("Continue exploring");
    expect(markup).toContain("Open rankings");
    expect(markup).toContain("Open results");
    expect(markup).toContain('href="/skills/101"');
    expect(markup).toContain('data-as="/light/skills/101"');
  });
});
