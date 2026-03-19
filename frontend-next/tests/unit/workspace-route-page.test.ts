import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildWorkspacePageModel } from "@/src/features/workspace/model";
import { WorkspaceRoutePage } from "@/src/features/workspace/WorkspaceRoutePage";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { WorkspaceRoutePath } from "@/src/features/workspace/types";

import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function renderWorkspaceRoute(route: WorkspaceRoutePath, messages?: Partial<WorkspaceMessages>) {
  const model = buildWorkspacePageModel(route, {
    user: {
      id: 7,
      username: "operator",
      displayName: "Operator",
      role: "admin",
      status: "active"
    },
    marketplacePublicAccess: true
  }, undefined, messages);

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

  it("renders runbook route using injected workspace response templates", () => {
    const testMessages = createProtectedPageTestMessages({
      workspace: {
        statusRunning: "running_custom",
        itemCategoryPathTemplate: "path::{category}>{subcategory}",
        ownerCoverageValueTemplate: "{items} custom-items · {risk} custom-risk",
        topTagBadgeTemplate: "{tag} :: {count}"
      }
    });

    const markup = renderWorkspaceRoute("/workspace/runbook", testMessages.workspace);

    expect(markup).toContain("running_custom");
    expect(markup).toContain("path::development&gt;frontend");
  });
});
