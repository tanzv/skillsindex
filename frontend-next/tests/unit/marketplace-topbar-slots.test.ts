import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { buildMarketplaceTopbarSlots } from "@/src/features/public/marketplace/marketplaceTopbarSlots";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("")
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) =>
    createElement("a", { href, ...props }, children)
}));

vi.mock("@/src/features/public/i18n/PublicI18nProvider", () => ({
  usePublicI18n: () => ({
    locale: "en",
    messages: {
      shellBrandTitle: "SkillsIndex",
      shellBrandSubtitle: "Team Skill Marketplace",
      shellNavigationAriaLabel: "Marketplace navigation",
      shellCategories: "Categories",
      shellRankings: "Rankings",
      shellWorkspace: "Workspace",
      shellSearch: "Search",
      shellSignIn: "Sign In",
      shellSignedIn: "Signed In",
      shellSignedOut: "Not Signed In",
      shellLocaleZh: "ZH",
      shellLocaleEn: "EN",
      themeDark: "Dark",
      themeLight: "Light",
      themeSwitchAriaLabel: "Theme switch",
      localeSwitchAriaLabel: "Locale switch"
    },
    setLocale: () => {}
  })
}));

vi.mock("@/src/features/public/PublicViewerSessionProvider", () => ({
  usePublicViewerSession: () => ({
    isAuthenticated: false
  })
}));

vi.mock("@/src/lib/auth/usePublicLoginTarget", () => ({
  usePublicLoginTarget: () => ({
    href: "/login?redirect=%2F",
    as: undefined
  })
}));

vi.mock("@/src/lib/routing/usePublicRouteState", () => ({
  usePublicRouteState: () => ({
    corePath: "/",
    isLightTheme: false,
    isMobileLayout: false,
    toPublicPath: (route: string) => route,
    toPublicLinkTarget: (route: string) => ({ href: route })
  })
}));

function renderSlots(variant: "landing" | "market" | "skill-detail") {
  const slots = buildMarketplaceTopbarSlots({ variant });

  return renderToStaticMarkup(
    createElement(
      "div",
      null,
      slots.brandContent,
      slots.primaryNavigationContent,
      slots.actionsContent
    )
  );
}

describe("marketplaceTopbarSlots", () => {
  it("renders a shared marketplace topbar primitive across landing and section variants", () => {
    const landingMarkup = renderSlots("landing");
    const marketMarkup = renderSlots("market");
    const skillDetailMarkup = renderSlots("skill-detail");

    expect(landingMarkup).toContain('data-marketplace-topbar-slot="brand"');
    expect(landingMarkup).toContain('data-marketplace-topbar-slot="primary-navigation"');
    expect(landingMarkup).toContain('data-marketplace-topbar-slot="actions"');

    expect(marketMarkup).toContain('data-marketplace-topbar-slot="brand"');
    expect(marketMarkup).toContain('data-marketplace-topbar-slot="primary-navigation"');
    expect(marketMarkup).toContain('data-marketplace-topbar-slot="actions"');

    expect(skillDetailMarkup).toContain('data-marketplace-topbar-slot="brand"');
    expect(skillDetailMarkup).toContain('data-marketplace-topbar-slot="primary-navigation"');
    expect(skillDetailMarkup).toContain('data-marketplace-topbar-slot="actions"');
  });
});
