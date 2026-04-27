import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { resolveRouteSections } from "@/src/features/workspace/pageSections";
import { buildWorkspaceSnapshot } from "@/src/features/workspace/snapshot";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";

import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const messages = createProtectedPageTestMessages().workspace;
const snapshot = buildWorkspaceSnapshot(buildPublicMarketplaceFallback(), {
  user: {
    id: 7,
    username: "operator",
    displayName: "Operator",
    role: "admin",
    status: "active"
  },
  marketplacePublicAccess: true
}, messages);

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function resolveSections(route: Parameters<typeof resolveRouteSections>[0], workspaceMessages: WorkspaceMessages = messages) {
  return resolveRouteSections(
    route,
    {
      user: {
        id: 7,
        username: "operator",
        displayName: "Operator",
        role: "admin",
        status: "active"
      },
      marketplacePublicAccess: true
    },
    snapshot,
    workspaceMessages
  );
}

describe("workspace route sections", () => {
  it("resolves only the overview sections for the overview route", () => {
    const sections = resolveSections("/workspace");

    expect(sections.primarySections.map((section) => section.id)).toEqual([
      "workspace-signals",
      "execution-spotlight",
      "recent-activity"
    ]);
    expect(sections.railSections.map((section) => section.id)).toEqual([
      "owner-coverage",
      "risk-watchlist",
      "policy-coverage",
      "current-session"
    ]);
  });

  it("resolves policy-specific sections without building overview-only section ids", () => {
    const sections = resolveSections("/workspace/policy");

    expect(sections.primarySections.map((section) => section.id)).toEqual([
      "governance-priorities",
      "review-pressure"
    ]);
    expect(sections.primarySections.map((section) => section.id)).not.toContain("workspace-signals");
  });

  it("keeps workspace section selection centralized in a route-to-builder map", () => {
    const source = readRepoFile("src/features/workspace/pageSections.ts");

    expect(source).toContain("workspaceRouteSectionBuilders");
    expect(source).not.toContain("switch (route)");
  });
});
