import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import OrganizationManagementRoutePage from "./OrganizationManagementRoutePage";

describe("OrganizationManagementRoutePage", () => {
  it("renders account routes inside the shared workspace shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrganizationManagementRoutePage, {
        locale: "en",
        route: "/admin/accounts/new",
        currentPath: "/admin/accounts/new",
        onNavigate: () => undefined
      })
    );

    expect(html).toContain("workspace-prototype-utility-frame");
    expect(html).toContain("workspace-shell-content-scroll");
    expect(html).toContain("Loading account and role workbench");
  });

  it("renders role routes inside the shared workspace shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrganizationManagementRoutePage, {
        locale: "en",
        route: "/admin/roles",
        currentPath: "/admin/roles",
        onNavigate: () => undefined
      })
    );

    expect(html).toContain("workspace-prototype-utility-frame");
    expect(html).toContain("workspace-shell-content-scroll");
    expect(html).toContain("Loading account and role workbench");
  });
});
