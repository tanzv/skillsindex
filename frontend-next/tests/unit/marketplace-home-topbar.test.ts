import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MarketplaceHomeTopbarActions
} from "@/src/features/public/marketplace/MarketplaceHomeTopbar";
import {
  MarketplaceHomeBrand,
  MarketplaceHomePrimaryNavigation,
  MarketplaceSectionTopbarActions,
  MarketplaceTopbarStageStatus
} from "@/src/features/public/marketplace/MarketplaceTopbarPrimitives";

const { mockUsePublicViewerSession } = vi.hoisted(() => ({
  mockUsePublicViewerSession: vi.fn(() => ({
    isAuthenticated: false
  }))
}));

const { mockUsePublicRouteState } = vi.hoisted(() => ({
  mockUsePublicRouteState: vi.fn(() => ({
    corePath: "/",
    isLightTheme: false,
    isMobileLayout: false,
    toPublicPath: (route: string) => route,
    toPublicLinkTarget: (route: string) => ({ href: route })
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
      shellSearch: "Search",
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
  usePublicRouteState: mockUsePublicRouteState
}));

function renderMarkup(element: ReactNode) {
  return renderToStaticMarkup(createElement(() => element));
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

function findElementMarkup(markup: string, testID: string) {
  const escapedTestID = testID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const elementMatch = markup.match(new RegExp(`<[^>]*data-testid="${escapedTestID}"[^>]*>`, "u"));
  expect(elementMatch?.[0]).toBeDefined();
  return elementMatch?.[0] ?? "";
}

describe("MarketplaceHomeTopbar", () => {
  beforeEach(() => {
    mockUsePublicViewerSession.mockReturnValue({
      isAuthenticated: false
    });
    mockUsePublicRouteState.mockReturnValue({
      corePath: "/",
      isLightTheme: false,
      isMobileLayout: false,
      toPublicPath: (route: string) => route,
      toPublicLinkTarget: (route: string) => ({ href: route })
    });
  });

  it("renders the homepage brand as a single-line title with subtitle", () => {
    const markup = renderMarkup(createElement(MarketplaceHomeBrand));

    expectMarkupToContainAll(markup, [
      "SkillsIndex",
      "Team Skill Marketplace",
      'href="/"',
      'aria-label="SkillsIndex"',
      'data-marketplace-topbar-slot="brand"',
      'data-marketplace-topbar-variant="landing"'
    ]);
  });

  it("renders compact homepage navigation with categories and rankings", () => {
    const markup = renderMarkup(createElement(MarketplaceHomePrimaryNavigation));

    expectMarkupToContainAll(markup, [
      'aria-label="Marketplace navigation"',
      "Categories",
      "Rankings",
      "TOP",
      'href="/categories"',
      'href="/rankings"',
      'data-testid="landing-topbar-nav-categories"',
      'data-testid="landing-topbar-nav-rankings"',
      'data-marketplace-topbar-slot="primary-navigation"',
      'data-marketplace-topbar-variant="landing"'
    ]);
  });

  it("marks categories and compare routes active through the shared public navigation registry", () => {
    mockUsePublicRouteState.mockReturnValue({
      corePath: "/categories/operations",
      isLightTheme: false,
      isMobileLayout: false,
      toPublicPath: (route: string) => route,
      toPublicLinkTarget: (route: string) => ({ href: route })
    });

    const categoriesMarkup = renderMarkup(createElement(MarketplaceHomePrimaryNavigation));
    const categoriesLinkMarkup = findElementMarkup(categoriesMarkup, "landing-topbar-nav-categories");
    const rankingsLinkMarkup = findElementMarkup(categoriesMarkup, "landing-topbar-nav-rankings");

    expectMarkupToContainAll(categoriesLinkMarkup, [
      'href="/categories"',
      'class="marketplace-nav-button is-active"',
      'aria-current="page"'
    ]);
    expectMarkupToContainAll(rankingsLinkMarkup, [
      'href="/rankings"',
      'class="marketplace-nav-button"'
    ]);
    expect(rankingsLinkMarkup).not.toContain('aria-current="page"');

    mockUsePublicRouteState.mockReturnValue({
      corePath: "/compare",
      isLightTheme: false,
      isMobileLayout: false,
      toPublicPath: (route: string) => route,
      toPublicLinkTarget: (route: string) => ({ href: route })
    });

    const compareMarkup = renderMarkup(createElement(MarketplaceHomePrimaryNavigation));
    const compareCategoriesLinkMarkup = findElementMarkup(compareMarkup, "landing-topbar-nav-categories");
    const compareRankingsLinkMarkup = findElementMarkup(compareMarkup, "landing-topbar-nav-rankings");

    expectMarkupToContainAll(compareRankingsLinkMarkup, [
      'href="/rankings"',
      'class="marketplace-nav-button is-active"',
      'aria-current="page"'
    ]);
    expectMarkupToContainAll(compareCategoriesLinkMarkup, [
      'href="/categories"',
      'class="marketplace-nav-button"'
    ]);
    expect(compareCategoriesLinkMarkup).not.toContain('aria-current="page"');
  });

  it("renders the signed-out status and sign-in action inside a unified auth cluster", () => {
    const markup = renderMarkup(createElement(MarketplaceHomeTopbarActions));

    expectMarkupToContainAll(markup, [
      'data-marketplace-topbar-slot="actions"',
      'data-marketplace-topbar-variant="landing"',
      'data-testid="landing-topbar-auth-cluster"',
      'data-testid="landing-topbar-status"',
      "Not Signed In",
      ">Sign In<",
      'data-testid="topbar-theme-switch-dark"',
      'data-testid="topbar-theme-switch-light"',
      'data-testid="topbar-locale-switch-zh"',
      'data-testid="topbar-locale-switch-en"'
    ]);
    expectMarkupToExcludeAll(markup, [">Workspace<"]);
  });

  it("renders workspace access for authenticated viewers", async () => {
    mockUsePublicViewerSession.mockReturnValue({
      isAuthenticated: true
    });

    const markup = renderMarkup(createElement(MarketplaceHomeTopbarActions));

    expectMarkupToContainAll(markup, [
      "Signed In",
      ">Workspace<",
      'data-testid="landing-topbar-auth-cluster"',
      'data-testid="landing-topbar-status"'
    ]);
    expectMarkupToExcludeAll(markup, [">Sign In<", "Not Signed In"]);
  });

  it("renders a compact section action cluster without the signed-out pill", () => {
    const markup = renderMarkup(createElement(MarketplaceSectionTopbarActions));

    expectMarkupToContainAll(markup, [
      'data-marketplace-topbar-slot="actions"',
      'data-marketplace-topbar-variant="market"',
      ">Search<",
      ">Sign In<",
      'class="marketplace-topbar-button is-subtle"',
      'class="marketplace-topbar-button is-primary"'
    ]);
    expectMarkupToExcludeAll(markup, ["Not Signed In", 'data-testid="landing-topbar-auth-cluster"']);
  });

  it("renders a reusable marketplace stage status pill", () => {
    const markup = renderMarkup(createElement(MarketplaceTopbarStageStatus, { label: "Results" }));

    expectMarkupToContainAll(markup, ["Results", 'class="marketplace-topbar-status"']);
  });
});
