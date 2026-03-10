import { describe, expect, it } from "vitest";

import marketplaceHomeResponsiveSource from "../marketplaceHome/MarketplaceHomePage.styles.responsive.ts?raw";
import marketplaceHomeThemeSource from "../marketplaceHome/MarketplaceHomePage.styles.theme.ts?raw";
import organizationManagementSubpageShellSource from "../organizationCenter/OrganizationManagementSubpageShell.tsx?raw";
import pageShellLayoutContractSource from "../prototype/pageShellLayoutContract.ts?raw";
import prototypeCssInJsSource from "../prototype/prototypeCssInJs.tsx?raw";
import publicSkillDetailTopbarSource from "../publicSkillDetail/PublicSkillDetailPage.styles.topbar.ts?raw";
import workspacePrototypePageShellSource from "./WorkspacePrototypePageShell.tsx?raw";
import workspacePrototypePageShellStylesSource from "./WorkspacePrototypePageShell.styles.ts?raw";
import marketplacePublicPageShellSource from "../marketplacePublic/MarketplacePublicPageShell.tsx?raw";

describe("workspace shell layout contract", () => {
  it("defines system-prefixed shell layout tokens in the shared contract module", () => {
    expect(pageShellLayoutContractSource).toContain("--si-layout-shell-inline-gap");
    expect(pageShellLayoutContractSource).toContain("--si-layout-shell-topbar-width");
    expect(pageShellLayoutContractSource).toContain("--si-layout-shell-content-width");
  });

  it("defines shared system shell stage class names and builder", () => {
    expect(pageShellLayoutContractSource).toContain("si-layout-shell-stage");
    expect(pageShellLayoutContractSource).toContain("si-layout-shell-surface");
    expect(pageShellLayoutContractSource).toContain("si-layout-shell-stage-mobile");
    expect(pageShellLayoutContractSource).toContain("buildShellStageClassName");
    expect(marketplacePublicPageShellSource).toContain("buildShellStageClassName");
    expect(marketplacePublicPageShellSource).toContain("stageClassName");
    expect(workspacePrototypePageShellSource).toContain("buildShellStageClassName");
    expect(workspacePrototypePageShellSource).not.toContain("prototype-shell");
    expect(workspacePrototypePageShellSource).not.toContain("marketplace-home-stage");
    expect(marketplacePublicPageShellSource).toContain("stageTestId = \"shell-stage\"");
  });

  it("removes page-specific legacy shell aliases from the shared workspace shell", () => {
    expect(workspacePrototypePageShellStylesSource).not.toContain("--workspace-shell-layout-inline-gap");
    expect(workspacePrototypePageShellStylesSource).not.toContain("--workspace-shell-layout-topbar-width");
    expect(workspacePrototypePageShellStylesSource).not.toContain("--workspace-shell-layout-content-width");
  });

  it("routes prototype and workspace sizing through the shared system shell contract", () => {
    expect(prototypeCssInJsSource).toContain("shellLayoutContractVars.contentWidth");
    expect(marketplaceHomeThemeSource).toContain("shellLayoutContractVars.topbarWidth");
    expect(marketplaceHomeResponsiveSource).toContain("shellLayoutContractVars.topbarWidth");
    expect(marketplaceHomeThemeSource).not.toContain("--prototype-shell-max-width");
  });

  it("allows public skill detail pages to override the shared contract with system tokens", () => {
    expect(publicSkillDetailTopbarSource).toContain("buildShellLayoutContract");
    expect(publicSkillDetailTopbarSource).toContain("--si-layout-shell-inline-gap: 0.75rem");
    expect(publicSkillDetailTopbarSource).not.toContain("--prototype-shell-horizontal-gap");
  });

  it("applies resolved layout variants from the shared shell root", () => {
    expect(workspacePrototypePageShellSource).toContain("resolveWorkspacePrototypeLayoutVariant");
    expect(workspacePrototypePageShellSource).toContain("$layoutVariant={resolvedLayoutVariant}");
  });

  it("keeps organization management pages free of page-level layout overrides", () => {
    expect(organizationManagementSubpageShellSource).not.toContain("layoutVariant=");
  });
});
