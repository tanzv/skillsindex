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

  it("exposes controlled open state for shared topbar overlays", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "dark"
    });

    const html = renderToStaticMarkup(
      React.createElement(GlobalUserControlDropdown, {
        service,
        displayName: "Alice Lee",
        subtitle: "Platform Admin",
        open: true
      })
    );

    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("workspace-topbar-user-trigger is-open");
  });

  it("keeps user center panel content in the service model for registered extensions", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "light",
      registrations: [
        {
          key: "workspace-links",
          order: 30,
          resolve: () => ({
            kind: "action",
            key: "account-center",
            section: {
              id: "workspace",
              label: "Workspace",
              order: 15
            },
            order: 10,
            label: "Account Center",
            disabled: false,
            execute: () => undefined
          })
        }
      ]
    });

    expect(service.sections.map((section) => section.id)).toEqual(["preferences", "workspace", "session"]);
    expect(service.sections[1]?.items[0]?.key).toBe("account-center");
  });
});
