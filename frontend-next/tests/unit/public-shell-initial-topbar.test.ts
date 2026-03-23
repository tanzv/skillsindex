import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicMarketWebclient } from "@/src/features/public/PublicMarketWebclient";

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

function renderWebclientAtPath(pathname: string, childLabel: string) {
  mockResolvedPathname.mockReturnValue(pathname);

  return renderToStaticMarkup(createElement(PublicMarketWebclient, null, createElement("div", null, childLabel)));
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function expectMarkupToExcludeAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).not.toContain(fragment);
  }
}

describe("PublicMarketWebclient initial topbar rendering", () => {
  beforeEach(() => {
    mockResolvedPathname.mockReturnValue("/");
  });

  it("renders the landing route contract with compact marketplace navigation", () => {
    const markup = renderWebclientAtPath("/", "home");

    expectMarkupToContainAll(markup, [
      'data-marketplace-route-kind="landing"',
      'data-marketplace-content-width="default"',
      'data-testid="landing-topbar-nav-categories"',
      'data-testid="landing-topbar-nav-rankings"',
      "SkillsIndex",
      'data-marketplace-topbar-slot="actions"',
      'data-marketplace-topbar-variant="landing"',
      'aria-hidden="true"'
    ]);
    expectMarkupToExcludeAll(markup, [">Docs<", ">ZH<", 'data-testid="search-shell-breadcrumb"']);
  });

  it("renders the results route contract with section breadcrumb and search action", () => {
    const markup = renderWebclientAtPath("/results", "results");

    expectMarkupToContainAll(markup, [
      'data-marketplace-route-kind="section"',
      'data-marketplace-content-width="default"',
      "Results",
      'data-testid="landing-topbar-nav-categories"',
      'data-testid="search-shell-breadcrumb"',
      ">Search Results<",
      ">Search<"
    ]);
    expectMarkupToExcludeAll(markup, [">Docs<", ">ZH<"]);
  });

  it("keeps the narrative route contract for non-marketplace pages", () => {
    const markup = renderWebclientAtPath("/docs", "docs");

    expectMarkupToContainAll(markup, [
      'data-marketplace-route-kind="narrative"',
      'data-marketplace-content-width="expanded"',
      ">Docs<",
      ">ZH<"
    ]);
    expectMarkupToExcludeAll(markup, ['data-testid="landing-topbar-nav-categories"', 'data-testid="search-shell-breadcrumb"']);
  });

  it("marks skill detail routes as expanded marketplace detail surfaces", () => {
    const markup = renderWebclientAtPath("/skills/14", "skill detail");

    expectMarkupToContainAll(markup, [
      'data-marketplace-route-kind="skill-detail"',
      'data-marketplace-content-width="expanded"',
      'data-testid="skill-detail-topbar-breadcrumb"',
      "Skill Detail"
    ]);
  });
});
