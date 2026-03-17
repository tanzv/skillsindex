import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildWorkspacePageModel } from "@/src/features/workspace/model";
import { WorkspaceRoutePage } from "@/src/features/workspace/WorkspaceRoutePage";
import type { WorkspaceRoutePath } from "@/src/features/workspace/types";

function renderWorkspaceRoute(route: WorkspaceRoutePath) {
  const model = buildWorkspacePageModel(route, {
    user: {
      id: 7,
      username: "operator",
      displayName: "Operator",
      role: "admin",
      status: "active"
    },
    marketplacePublicAccess: true
  });

  return renderToStaticMarkup(createElement(WorkspaceRoutePage, { model }));
}

describe("workspace route page", () => {
  it("renders queue route as list-detail workspace", () => {
    const markup = renderWorkspaceRoute("/workspace/queue");

    expect(markup).toContain("Queue Backlog");
    expect(markup).toContain("Execution Spotlight");
    expect(markup).toContain("Queue Insights");
  });

  it("renders policy route with focused review queue", () => {
    const markup = renderWorkspaceRoute("/workspace/policy");

    expect(markup).toContain("Policy Focus Queue");
    expect(markup).toContain("Governance Priorities");
    expect(markup).toContain("Review Pressure");
  });

  it("renders runbook route with explicit target selection", () => {
    const markup = renderWorkspaceRoute("/workspace/runbook");

    expect(markup).toContain("Runbook Targets");
    expect(markup).toContain("Response Script");
    expect(markup).toContain("Escalation Checklist");
  });
});
