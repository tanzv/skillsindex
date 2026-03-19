import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedConsoleShell } from "@/src/components/shared/ProtectedConsoleShell";

describe("ProtectedConsoleShell", () => {
  it("renders desktop and drawer navigation containers through the shared shell contract", () => {
    const markup = renderToStaticMarkup(
      createElement(ProtectedConsoleShell, {
        scope: "workspace-shell",
        shellTestId: "workspace-shell",
        sideNavTestId: "workspace-side-nav",
        renderHeader: ({ openSidebar, isSidebarOpen }) =>
          createElement(
            "button",
            {
              type: "button",
              "data-testid": "workspace-shell-toggle",
              onClick: openSidebar
            },
            isSidebarOpen ? "Close Navigation" : "Open Navigation"
          ),
        sidebar: createElement("div", null, "sidebar")
      }, createElement("div", null, "content"))
    );

    expect(markup).toContain("workspace-shell-toggle");
    expect(markup).toContain("workspace-side-nav");
    expect(markup).toContain("workspace-side-nav-drawer");
    expect(markup).toContain("protected-console-drawer-backdrop");
  });
});
