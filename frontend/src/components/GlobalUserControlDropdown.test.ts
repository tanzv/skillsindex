import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createGlobalUserControlService } from "../lib/globalUserControlService";
import GlobalUserControlDropdown from "./GlobalUserControlDropdown";

describe("GlobalUserControlDropdown", () => {
  it("renders display name, subtitle, and avatar initials", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "dark"
    });

    const html = renderToStaticMarkup(
      React.createElement(GlobalUserControlDropdown, {
        service,
        displayName: "Alice Lee",
        subtitle: "Platform Admin"
      })
    );

    expect(html).toContain("Alice Lee");
    expect(html).toContain("Platform Admin");
    expect(html).toContain("AL");
    expect(html).toContain('data-testid="workspace-user-center-trigger"');
  });
});
