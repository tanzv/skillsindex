import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MarketplaceHomeBrand,
  MarketplaceHomePrimaryNavigation,
  MarketplaceHomeTopbarActions,
  MarketplaceSectionTopbarActions,
  MarketplaceTopbarStageStatus
} from "@/src/features/public/marketplace/MarketplaceHomeTopbar";

const { mockUsePublicViewerSession } = vi.hoisted(() => ({
  mockUsePublicViewerSession: vi.fn(() => ({
    isAuthenticated: false
  }))
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("q=release")
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
  usePublicViewerSession: mockUsePublicViewerSession
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

describe("MarketplaceHomeTopbar", () => {
  beforeEach(() => {
    mockUsePublicViewerSession.mockReturnValue({
      isAuthenticated: false
    });
  });

  it("renders the homepage brand as a single-line title with subtitle", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceHomeBrand));

    expect(markup).toContain("SkillsIndex");
    expect(markup).toContain("Team Skill Marketplace");
    expect(markup).toContain('href="/"');
  });

  it("renders compact homepage navigation with categories and rankings", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceHomePrimaryNavigation));

    expect(markup).toContain("Categories");
    expect(markup).toContain("Rankings");
    expect(markup).toContain("TOP");
    expect(markup).toContain('data-testid="landing-topbar-nav-categories"');
    expect(markup).toContain('data-testid="landing-topbar-nav-rankings"');
  });

  it("renders the signed-out status and sign-in action inside a unified auth cluster", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceHomeTopbarActions));

    expect(markup).toContain('data-testid="landing-topbar-auth-cluster"');
    expect(markup).toContain("Not Signed In");
    expect(markup).toContain(">Sign In<");
    expect(markup).toMatch(
      /data-testid="landing-topbar-auth-cluster"[\s\S]*data-testid="landing-topbar-status"[\s\S]*>Sign In</
    );
    expect(markup).toContain("data-testid=\"topbar-theme-switch-dark\"");
    expect(markup).toContain("data-testid=\"topbar-theme-switch-light\"");
  });

  it("renders workspace access for authenticated viewers", async () => {
    mockUsePublicViewerSession.mockReturnValue({
      isAuthenticated: true
    });

    const markup = renderToStaticMarkup(createElement(MarketplaceHomeTopbarActions));

    expect(markup).toContain("Signed In");
    expect(markup).toContain(">Workspace<");
    expect(markup).not.toContain(">Sign In<");
  });

  it("renders a compact section action cluster without the signed-out pill", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceSectionTopbarActions));

    expect(markup).not.toContain("Not Signed In");
    expect(markup).toContain(">Sign In<");
    expect(markup).toContain("marketplace-topbar-button is-primary");
  });

  it("renders a reusable marketplace stage status pill", () => {
    const markup = renderToStaticMarkup(createElement(MarketplaceTopbarStageStatus, { label: "Results" }));

    expect(markup).toContain("Results");
    expect(markup).toContain("marketplace-topbar-status");
  });
});
