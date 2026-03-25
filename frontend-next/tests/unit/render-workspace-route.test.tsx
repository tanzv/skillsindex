import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import type { WorkspacePageModel } from "@/src/features/workspace/types";
import type { SessionContext } from "@/src/lib/schemas/session";

vi.mock("@/src/features/workspace/loadWorkspaceRouteModel", () => ({
  loadWorkspaceRouteModel: vi.fn()
}));

import { loadWorkspaceRouteModel } from "@/src/features/workspace/loadWorkspaceRouteModel";
import { renderWorkspaceRoute } from "@/src/features/workspace/renderWorkspaceRoute";

const session: SessionContext = {
  user: {
    id: 9,
    username: "workspace-admin",
    displayName: "Workspace Admin",
    role: "admin",
    status: "active"
  },
  marketplacePublicAccess: false
};

const model = {
  locale: "en",
  route: "/workspace",
  eyebrow: "Workspace",
  title: "Workspace Overview",
  description: "Live workspace state",
  messages: {} as WorkspacePageModel["messages"],
  snapshot: {} as WorkspacePageModel["snapshot"],
  summaryMetrics: [],
  quickActions: [],
  primarySections: [],
  railSections: []
} satisfies WorkspacePageModel;

describe("renderWorkspaceRoute", () => {
  it("renders the route page when the workspace model loads", async () => {
    vi.mocked(loadWorkspaceRouteModel).mockResolvedValue(model);

    const element = await renderWorkspaceRoute("/workspace", session);
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("Workspace Overview");
  });

  it("renders an error state when the workspace model load fails", async () => {
    vi.mocked(loadWorkspaceRouteModel).mockRejectedValue(new Error("workspace marketplace down"));

    const element = await renderWorkspaceRoute("/workspace", session);
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("Request failed");
    expect(markup).toContain("Failed to load workspace data.");
  });
});
