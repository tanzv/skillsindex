import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicShell } from "@/src/components/shared/PublicShell";

const { mockResolvedPathname } = vi.hoisted(() => ({
  mockResolvedPathname: vi.fn(() => "/")
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("")
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) =>
    createElement("a", { href, ...props }, children)
}));

vi.mock("@/src/lib/routing/useResolvedPublicPathname", () => ({
  useResolvedPublicPathname: mockResolvedPathname
}));

vi.mock("@/src/features/public/i18n/PublicI18nProvider", () => ({
  usePublicI18n: () => ({
    locale: "en",
    messages: {
      shellBrandTitle: "SkillsIndex",
      shellBrandSubtitle: "Team Skill Marketplace",
      shellNavigationAriaLabel: "Marketplace navigation",
      shellHome: "Home",
      shellCategories: "Categories",
      shellRankings: "Rankings",
      shellDocs: "Docs",
      shellSearch: "Search",
      shellWorkspace: "Workspace",
      shellSignIn: "Sign In",
      shellSignedIn: "Signed In",
      shellSignedOut: "Not Signed In",
      shellLocaleZh: "ZH",
      shellLocaleEn: "EN",
      themeDark: "Dark",
      themeLight: "Light",
      layoutCompact: "Compact",
      layoutDesktop: "Desktop",
      stageLanding: "Landing",
      stageCategories: "Categories",
      stageRankings: "Rankings",
      stageSkillDetail: "Skill Detail",
      stageResults: "Results",
      stageAccess: "Access",
      stageMarketplace: "Marketplace",
      resultsLedgerTitle: "Search Results",
      categoryBrowseTitle: "Browse Categories",
      rankingTitle: "Rankings",
      categoryBreadcrumbAriaLabel: "Category breadcrumb",
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

describe("PublicShell initial topbar rendering", () => {
  beforeEach(() => {
    mockResolvedPathname.mockReturnValue("/");
  });

  it("renders marketplace landing controls on the first render for the homepage", () => {
    const markup = renderToStaticMarkup(createElement(PublicShell, null, createElement("div", null, "home")));

    expect(markup).toContain('data-testid="landing-topbar-nav-categories"');
    expect(markup).toContain('data-testid="landing-topbar-nav-rankings"');
    expect(markup).toContain('data-testid="topbar-theme-switch-dark"');
    expect(markup).not.toContain(">Docs<");
    expect(markup).not.toContain(">ZH<");
  });

  it("renders marketplace section controls on the first render for results routes", () => {
    mockResolvedPathname.mockReturnValue("/results");

    const markup = renderToStaticMarkup(createElement(PublicShell, null, createElement("div", null, "results")));

    expect(markup).toContain("Results");
    expect(markup).toContain('data-testid="landing-topbar-nav-categories"');
    expect(markup).toContain('data-testid="search-shell-breadcrumb"');
    expect(markup).toContain(">Search Results<");
    expect(markup).toContain(">Search<");
    expect(markup).not.toContain(">Docs<");
    expect(markup).not.toContain(">ZH<");
  });

  it("keeps the default public topbar for non-marketplace routes", () => {
    mockResolvedPathname.mockReturnValue("/docs");

    const markup = renderToStaticMarkup(createElement(PublicShell, null, createElement("div", null, "docs")));

    expect(markup).toContain(">Docs<");
    expect(markup).toContain(">ZH<");
    expect(markup).not.toContain('data-testid="landing-topbar-nav-categories"');
  });
});
