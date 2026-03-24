import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildWorkspacePageModel } from "@/src/features/workspace/model";
import { WorkspaceEntryDetailPane } from "@/src/features/workspace/WorkspaceRouteDetailSurface";
import { WorkspaceRoutePage } from "@/src/features/workspace/WorkspaceRoutePage";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { WorkspaceRoutePath } from "@/src/features/workspace/types";

import { createProtectedPageTestMessages } from "./protected-page-test-messages";
import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";

const workspacePayload = buildPublicMarketplaceFallback();

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
  }, workspacePayload, messages);

  return renderToStaticMarkup(createElement(WorkspaceRoutePage, { model }));
}

describe("workspace route page", () => {
  it("renders queue route as backlog plus inline detail entry actions", () => {
    const markup = renderWorkspaceRoute("/workspace/queue");

    expect(markup).toContain("Queue Backlog");
    expect(markup).toContain("Open Details");
    expect(markup).toContain("Queue Insights");
  });

  it("renders policy route with focused review queue and inline detail triggers", () => {
    const markup = renderWorkspaceRoute("/workspace/policy");

    expect(markup).toContain("Policy Focus Queue");
    expect(markup).toContain("Open Details");
    expect(markup).toContain("Governance Priorities");
    expect(markup).toContain("Review Pressure");
  });

  it("renders runbook route with explicit target selection and inline detail triggers", () => {
    const markup = renderWorkspaceRoute("/workspace/runbook");

    expect(markup).toContain("Runbook Targets");
    expect(markup).toContain("Open Details");
    expect(markup).toContain("Escalation Checklist");
  });

  it("renders runbook route using injected workspace response templates", () => {
    const testMessages = createProtectedPageTestMessages({
      workspace: {
        statusRunning: "running_custom",
        ownerCoverageValueTemplate: "{items} custom-items · {risk} custom-risk",
        topTagBadgeTemplate: "{tag} :: {count}",
        actionOpenDetails: "Open Details Now"
      }
    });

    const markup = renderWorkspaceRoute("/workspace/runbook", testMessages.workspace);

    expect(markup).toContain("running_custom");
    expect(markup).toContain("Open Details Now");
  });

  it("renders the workspace entry detail surface as an inline pane", () => {
    const model = buildWorkspacePageModel(
      "/workspace/queue",
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
      workspacePayload
    );

    const markup = renderToStaticMarkup(
      createElement(WorkspaceEntryDetailPane, {
        open: true,
        entry: model.snapshot.queueEntries[0],
        locale: model.locale,
        messages: model.messages,
        onClose: () => undefined
      })
    );

    expect(markup).toContain('data-testid="workspace-entry-detail-pane"');
    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain("Open Skill Detail");
    expect(markup).toContain("Close Panel");
  });
});
