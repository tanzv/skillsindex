import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const shellSpy = vi.hoisted(() => vi.fn());

vi.mock("../workspace/WorkspacePrototypePageShell", () => ({
  default: (props: Record<string, unknown>) => {
    shellSpy(props);
    return React.createElement("div", null, props.children as React.ReactNode);
  }
}));

import GovernanceCenterPage from "./GovernanceCenterPage";
import { getWorkspaceCenterCopy } from "../workspace/WorkspaceCenterPage.copy";

describe("GovernanceCenterPage", () => {
  afterEach(() => {
    shellSpy.mockReset();
  });

  it("uses the unified workspace subpage shell configuration", () => {
    renderToStaticMarkup(
      React.createElement(GovernanceCenterPage, {
        locale: "en",
        currentPath: "/governance",
        onNavigate: () => undefined,
        sessionUser: null
      })
    );

    expect(shellSpy).toHaveBeenCalledTimes(1);

    const props = shellSpy.mock.calls[0]?.[0] as {
      hideSummaryHeader?: boolean;
      sidebarTitle?: string;
      sidebarMeta?: unknown[];
      summaryMetrics?: unknown[];
      summaryActions?: unknown;
    };
    const text = getWorkspaceCenterCopy("en");

    expect(props.hideSummaryHeader).toBe(true);
    expect(props.sidebarTitle).toBe(text.sidebarMenuTitle);
    expect(props.sidebarMeta ?? []).toHaveLength(0);
    expect(props.summaryMetrics ?? []).toHaveLength(0);
    expect(props.summaryActions).toBeUndefined();
  });

  it("renders governance content inside the shared display area with empty-state fallbacks", () => {
    const html = renderToStaticMarkup(
      React.createElement(GovernanceCenterPage, {
        locale: "en",
        currentPath: "/governance",
        onNavigate: () => undefined,
        sessionUser: null
      })
    );

    expect(html).toContain("Control Plane");
    expect(html).toContain("Governance Center");
    expect(html).toContain("Open Workspace");
    expect(html).toContain("Open Dashboard");
    expect(html).toContain("Visibility Gates");
    expect(html).toContain("Access Management");
    expect(html).toContain("Capture");
    expect(html).toContain("untagged");
    expect(html).toContain("No queue entries under this filter.");
  });
});
