import { describe, expect, it } from "vitest";

import { buildPublicTopbarModel } from "@/src/components/shared/publicShellModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  shellCategories: "Categories",
  shellRankings: "Rankings",
  shellDocs: "Docs",
  shellSearch: "Search",
  shellWorkspace: "Workspace",
  shellSignIn: "Sign In",
  shellLocaleZh: "ZH",
  shellLocaleEn: "EN",
  themeDark: "Dark",
  themeLight: "Light",
  layoutCompact: "Compact",
  layoutDesktop: "Desktop",
  stageLanding: "Landing",
  stageCategories: "Categories Stage",
  stageRankings: "Rankings Stage",
  stageSkillDetail: "Skill Detail",
  stageResults: "Results",
  stageAccess: "Access",
  stageMarketplace: "Marketplace"
} as PublicMarketplaceMessages;

describe("public shell model", () => {
  it("builds active navigation and stage labels for category routes", () => {
    const model = buildPublicTopbarModel({
      prefix: "",
      corePath: "/categories/operations",
      searchSuffix: "?subcategory=recovery",
      isLightTheme: false,
      isMobileLayout: false,
      isAuthenticated: false,
      locale: "en",
      messages
    });

    expect(model.statusLabels).toEqual(["Categories Stage", "Desktop"]);
    expect(model.navItems).toEqual([
      { href: "/categories", label: "Categories", isActive: true },
      { href: "/rankings", label: "Rankings", isActive: false },
      { href: "/docs", label: "Docs", isActive: false }
    ]);
    expect(model.themeLinks).toEqual([
      { href: "/categories/operations?subcategory=recovery", label: "Dark", isActive: true },
      { href: "/light/categories/operations?subcategory=recovery", label: "Light", isActive: false }
    ]);
  });

  it("maps legacy compare into the rankings stage and keeps docs active on governance routes", () => {
    const rankingsModel = buildPublicTopbarModel({
      prefix: "",
      corePath: "/compare",
      searchSuffix: "?left=101&right=102",
      isLightTheme: true,
      isMobileLayout: true,
      isAuthenticated: false,
      locale: "zh",
      messages
    });

    expect(rankingsModel.statusLabels).toEqual(["Rankings Stage", "Compact"]);
    expect(rankingsModel.navItems[1]).toEqual({
      href: "/rankings",
      label: "Rankings",
      isActive: true
    });

    const docsModel = buildPublicTopbarModel({
      prefix: "",
      corePath: "/governance",
      searchSuffix: "",
      isLightTheme: false,
      isMobileLayout: false,
      isAuthenticated: false,
      locale: "en",
      messages
    });

    expect(docsModel.navItems[2]).toEqual({
      href: "/docs",
      label: "Docs",
      isActive: true
    });
  });

  it("switches the primary utility action from sign-in to workspace for authenticated viewers", () => {
    const anonymousModel = buildPublicTopbarModel({
      prefix: "",
      corePath: "/skills/101",
      searchSuffix: "",
      isLightTheme: false,
      isMobileLayout: false,
      locale: "en",
      messages,
      isAuthenticated: false
    });

    const authenticatedModel = buildPublicTopbarModel({
      prefix: "",
      corePath: "/skills/101",
      searchSuffix: "",
      isLightTheme: false,
      isMobileLayout: false,
      locale: "en",
      messages,
      isAuthenticated: true
    });

    expect(anonymousModel.utilityLinks.map((item) => item.label)).toContain("Sign In");
    expect(authenticatedModel.utilityLinks.map((item) => item.label)).not.toContain("Sign In");
    expect(authenticatedModel.utilityLinks).toContainEqual({
      href: "/workspace",
      label: "Workspace",
      variant: "primary"
    });
  });

  it("builds login utility links with the current public route as the redirect target", () => {
    const model = buildPublicTopbarModel({
      prefix: "/light",
      corePath: "/skills/101",
      searchSuffix: "?tab=files",
      isLightTheme: true,
      isMobileLayout: false,
      isAuthenticated: false,
      locale: "en",
      messages
    });

    expect(model.utilityLinks).toContainEqual({
      href: "/login?redirect=%2Flight%2Fskills%2F101%3Ftab%3Dfiles",
      label: "Sign In",
      variant: "primary"
    });
  });
});
