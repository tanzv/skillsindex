import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import OrganizationManagementRoutePage from "./OrganizationManagementRoutePage";

describe("OrganizationManagementRoutePage", () => {
  it("renders account routes as content-only workbench pages", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrganizationManagementRoutePage, {
        route: "/admin/accounts/new"
      })
    );

    expect(html).not.toContain("workspace-prototype-utility-frame");
    expect(html).toContain("Loading account and role workbench");
  });

  it("renders role routes as content-only workbench pages", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrganizationManagementRoutePage, {
        route: "/admin/roles"
      })
    );

    expect(html).not.toContain("workspace-prototype-utility-frame");
    expect(html).toContain("Loading account and role workbench");
  });
});
