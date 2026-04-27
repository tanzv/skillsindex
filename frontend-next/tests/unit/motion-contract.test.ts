import { describe, expect, it } from "vitest";
import {
  expectFileContains,
  readRepoFile
} from "./routeEntrypointTestUtils";

describe("motion contract", () => {
  it("defines shared motion tokens in the global foundation", () => {
    const globals = readRepoFile("app/globals.css");

    expectFileContains(globals, [
      "--motion-duration-fast",
      "--motion-duration-medium",
      "--motion-duration-slow",
      "--motion-delay-xs",
      "--motion-delay-stagger-step",
      "--motion-ease-standard",
      "--motion-ease-emphasized"
    ]);
  });

  it("keeps reduced-motion fallbacks for continuous and shared shell animations", () => {
    const marketplaceAutoLoad = readRepoFile("app/public-marketplace-home-auto-load.css");
    const topbarOverflow = readRepoFile("src/components/shared/ProtectedTopbarOverflow.module.scss");

    expect(marketplaceAutoLoad).toContain("@media (prefers-reduced-motion: reduce)");
    expect(topbarOverflow).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("maps app-level interactive surfaces back to shared motion tokens", () => {
    const appFiles = [
      "app/public-marketplace-home.css",
      "app/public-marketplace-home-deck-card.css",
      "app/public-marketplace-category-hub.css",
      "app/public-marketplace-ranking.css",
      "app/public-marketplace-category-skill-card.css",
      "app/public-skill-detail-content.css",
      "app/public-skill-detail-content-lists.css",
      "app/public-skill-detail-directory.css",
      "app/public-skill-detail-resources-browser.css",
      "app/public-skill-detail-sidebar.css",
      "app/protected-shell-account.css",
      "app/admin-overview.css",
      "app/account-center.css",
      "app/workspace-overview.css"
    ];

    for (const relativePath of appFiles) {
      const source = readRepoFile(relativePath);

      expect(source).toContain("var(--motion-duration-fast)");
      expect(source).toContain("var(--motion-ease-standard)");
      expect(source).toContain("@media (prefers-reduced-motion: reduce)");
    }
  });

  it("uses shared loading-loop tokens for shimmer-based loading surfaces", () => {
    const rootLoading = readRepoFile("app/RootLoadingPage.module.scss");
    const skillDetailLoading = readRepoFile("app/public-skill-detail-loading.css");

    expectFileContains(rootLoading, ["var(--motion-duration-loading-loop)", "var(--motion-ease-standard)"]);
    expectFileContains(skillDetailLoading, ["var(--motion-duration-loading-loop)", "var(--motion-ease-standard)"]);
  });
});
