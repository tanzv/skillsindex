import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("route style imports", () => {
  it("keeps protected route family styles out of the root globals stylesheet", () => {
    const globalsCSS = readAppFile("app/globals.css");

    expect(globalsCSS).not.toContain('@import "./workspace-shell.scss";');
    expect(globalsCSS).not.toContain('@import "./workspace-topbar.css";');
    expect(globalsCSS).not.toContain('@import "./workspace-overview.css";');
    expect(globalsCSS).not.toContain('@import "./account-shell.scss";');
    expect(globalsCSS).not.toContain('@import "./account-center.css";');
    expect(globalsCSS).not.toContain('@import "./admin-shell.scss";');
    expect(globalsCSS).not.toContain('@import "./admin-overview.css";');
    expect(globalsCSS).not.toContain('@import "./protected-theme.css";');
    expect(globalsCSS).not.toContain('@import "./protected-shell-layout.scss";');
    expect(globalsCSS).not.toContain('@import "./protected-shell.css";');
    expect(globalsCSS).not.toContain('@import "./protected-content-theme.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-loading.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-overview.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-light-theme.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-light.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-content.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-content-lists.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-resources.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-resources-browser.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-directory.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-sidebar.css";');
    expect(globalsCSS).not.toContain('@import "./public-skill-detail-topbar.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-theme.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-shell-header.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-shell.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-primitives.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-hero.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-deck-card.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-landing-theme.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-baseline.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-auto-load.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-topbar-baseline.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-home-search-baseline.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-layout.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-controls.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-support.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-categories.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-category-collections.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-category-showcase.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-category-hub.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-section-topbar.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-category-skill-card.css";');
    expect(globalsCSS).not.toContain('@import "./public-marketplace-ranking.css";');
  });

  it("loads protected route family styles from the route layouts", () => {
    const workspaceLayout = readAppFile("app/(workspace)/workspace/layout.tsx");
    const adminLayout = readAppFile("app/(admin)/admin/layout.tsx");
    const accountLayout = readAppFile("app/(account)/account/layout.tsx");
    const publicLayout = readAppFile("app/(public)/layout.tsx");
    const publicLandingPage = readAppFile("app/(public)/page.tsx");
    const loginPage = readAppFile("app/login/page.tsx");
    const publicCategoriesLayout = readAppFile("app/(public)/categories/layout.tsx");
    const publicRankingsLayout = readAppFile("app/(public)/rankings/layout.tsx");
    const publicSkillDetailLayout = readAppFile("app/(public)/skills/[skillId]/layout.tsx");

    expect(workspaceLayout).toContain('import "../../protected-shell-route.scss";');
    expect(workspaceLayout).toContain('import "../../workspace-shell-route.scss";');

    expect(adminLayout).toContain('import "../../protected-shell-route.scss";');
    expect(adminLayout).toContain('import "../../admin-shell-route.scss";');

    expect(accountLayout).toContain('import "../../protected-shell-route.scss";');
    expect(accountLayout).toContain('import "../../account-shell-route.scss";');

    expect(publicLayout).toContain('import "../public-marketplace-route.css";');
    expect(publicLandingPage).toContain('import "../public-marketplace-landing-route.css";');
    expect(loginPage).toContain('import styles from "./LoginPageRoute.module.scss";');
    expect(publicCategoriesLayout).toContain('import "../../public-marketplace-categories-route.css";');
    expect(publicRankingsLayout).toContain('import "../../public-marketplace-rankings-route.css";');
    expect(publicSkillDetailLayout).toContain('import "../../../public-skill-detail-route.css";');
  });

  it("uses SCSS-native imports for protected shell route entry files", () => {
    const adminRouteStyles = readAppFile("app/admin-shell-route.scss");
    const workspaceRouteStyles = readAppFile("app/workspace-shell-route.scss");
    const accountRouteStyles = readAppFile("app/account-shell-route.scss");
    const protectedRouteStyles = readAppFile("app/protected-shell-route.scss");

    expect(adminRouteStyles).toContain('@use "./admin-shell";');
    expect(workspaceRouteStyles).toContain('@use "./workspace-shell";');
    expect(accountRouteStyles).toContain('@use "./account-shell";');
    expect(protectedRouteStyles).toContain('@use "./protected-shell-layout";');
    expect(protectedRouteStyles).toContain('@use "./protected-theme";');
    expect(protectedRouteStyles).toContain('@use "./protected-content-theme";');
  });

  it("keeps protected shell layout focused on structure instead of sidebar visuals", () => {
    const protectedShellLayout = readAppFile("app/protected-shell-layout.scss");

    expect(protectedShellLayout).not.toContain(".workspace-shell-panel");
    expect(protectedShellLayout).not.toContain(".admin-shell-panel");
    expect(protectedShellLayout).not.toContain(".account-shell-panel");
    expect(protectedShellLayout).not.toContain(".workspace-shell-side-link");
    expect(protectedShellLayout).not.toContain(".admin-shell-group-link");
    expect(protectedShellLayout).not.toContain(".admin-shell-side-link");
    expect(protectedShellLayout).not.toContain(".account-shell-side-link");
  });
});
