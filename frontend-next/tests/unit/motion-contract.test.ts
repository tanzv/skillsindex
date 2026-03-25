import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("motion contract", () => {
  it("defines shared motion tokens in the global foundation", () => {
    const globals = readAppFile("app/globals.css");

    expect(globals).toContain("--motion-duration-fast");
    expect(globals).toContain("--motion-duration-medium");
    expect(globals).toContain("--motion-duration-slow");
    expect(globals).toContain("--motion-delay-xs");
    expect(globals).toContain("--motion-delay-stagger-step");
    expect(globals).toContain("--motion-ease-standard");
    expect(globals).toContain("--motion-ease-emphasized");
  });

  it("keeps reduced-motion fallbacks for continuous and shared shell animations", () => {
    const marketplaceAutoLoad = readAppFile("app/public-marketplace-home-auto-load.css");
    const topbarOverflow = readAppFile("src/components/shared/ProtectedTopbarOverflow.module.scss");

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
      const source = readAppFile(relativePath);

      expect(source).toContain("var(--motion-duration-fast)");
      expect(source).toContain("var(--motion-ease-standard)");
      expect(source).toContain("@media (prefers-reduced-motion: reduce)");
    }
  });

  it("uses shared loading-loop tokens for shimmer-based loading surfaces", () => {
    const rootLoading = readAppFile("app/RootLoadingPage.module.scss");
    const skillDetailLoading = readAppFile("app/public-skill-detail-loading.css");

    expect(rootLoading).toContain("var(--motion-duration-loading-loop)");
    expect(rootLoading).toContain("var(--motion-ease-standard)");
    expect(skillDetailLoading).toContain("var(--motion-duration-loading-loop)");
    expect(skillDetailLoading).toContain("var(--motion-ease-standard)");
  });
});
