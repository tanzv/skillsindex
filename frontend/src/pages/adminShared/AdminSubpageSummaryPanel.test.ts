import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminSubpageSummaryPanel from "./AdminSubpageSummaryPanel";

describe("AdminSubpageSummaryPanel", () => {
  it("renders grouped title, status, actions, controls, and metrics", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminSubpageSummaryPanel, {
        title: "Account Management List",
        status: React.createElement(React.Fragment, null, React.createElement("span", { className: "pill active" }, "Live backend data")),
        actions: React.createElement("button", { type: "button", className: "panel-action-button" }, "Refresh"),
        controls: React.createElement("div", null, "Filters"),
        notice: "Degraded mode: fallback",
        metrics: [
          { id: "accounts", label: "Total Accounts", value: 24 },
          { id: "roles", label: "Distinct Roles", value: 6, help: "Coverage by current assignment." }
        ]
      })
    );

    expect(html).toContain("panel-hero-compact");
    expect(html).toContain("panel-hero-title");
    expect(html).toContain("Account Management List");
    expect(html).toContain("Live backend data");
    expect(html).toContain("panel-action-button");
    expect(html).toContain("Filters");
    expect(html).toContain("Degraded mode: fallback");
    expect(html).toContain("Total Accounts");
    expect(html).toContain("Distinct Roles");
    expect(html).toContain("Coverage by current assignment.");
  });

  it("omits optional regions when not provided", () => {
    const html = renderToStaticMarkup(React.createElement(AdminSubpageSummaryPanel, { metrics: [] }));

    expect(html).toContain("panel-hero-compact");
    expect(html).not.toContain("panel-hero-title");
    expect(html).not.toContain("metric-card");
    expect(html).not.toContain("panel-hero-toolbar");
  });
});
