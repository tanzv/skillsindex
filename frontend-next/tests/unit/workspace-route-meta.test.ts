import { describe, expect, it } from "vitest";

import {
  buildWorkspaceRouteMeta,
  isWorkspaceRoute,
  resolveWorkspaceMarketplaceQuery,
  resolveWorkspaceNavigationDescription,
  resolveWorkspaceNavigationLabel,
  resolveWorkspaceRoute
} from "@/src/lib/routing/workspaceRouteMeta";
import { workspaceMessageFallbacks } from "@/src/lib/i18n/protectedPageMessages.workspace";

describe("workspace route meta", () => {
  it("keeps workspace route validation in shared routing", () => {
    expect(isWorkspaceRoute("/workspace/queue")).toBe(true);
    expect(isWorkspaceRoute("/workspace/unknown")).toBe(false);
    expect(resolveWorkspaceRoute("/workspace/unknown")).toBe("/workspace");
  });

  it("builds localized route meta keyed by shared workspace routes", () => {
    const meta = buildWorkspaceRouteMeta(workspaceMessageFallbacks);

    expect(meta["/workspace/policy"]).toEqual({
      title: workspaceMessageFallbacks.routePolicyTitle,
      description: workspaceMessageFallbacks.routePolicyDescription
    });
  });

  it("derives workspace navigation labels and marketplace queries from the shared route contract", () => {
    expect(resolveWorkspaceNavigationLabel("/workspace/runbook", workspaceMessageFallbacks)).toBe(
      workspaceMessageFallbacks.navRunbookLabel
    );
    expect(resolveWorkspaceNavigationDescription("/workspace/actions", workspaceMessageFallbacks)).toBe(
      workspaceMessageFallbacks.navActionsDescription
    );
    expect(resolveWorkspaceMarketplaceQuery("/workspace/activity")).toEqual({
      sort: "recent",
      page: "1",
      page_size: "8"
    });
  });
});
