import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WorkspaceCenterRoutePage from "./WorkspaceCenterRoutePage";

describe("WorkspaceCenterRoutePage", () => {
  it("renders workspace route content without prototype shell chrome", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceCenterRoutePage, {
        locale: "en",
        currentPath: "/workspace/activity",
        onNavigate: () => undefined,
        sessionUser: null
      })
    );

    expect(html).toContain("Loading workspace");
    expect(html).not.toContain("workspace-prototype-utility-frame");
    expect(html).not.toContain("workspace-shell-content-scroll");
  });
});
