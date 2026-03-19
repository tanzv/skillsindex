import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

describe("ui tabs", () => {
  it("renders accessible trigger state for active and inactive tabs", () => {
    const markup = renderToStaticMarkup(
      createElement(
        TabsList,
        { "aria-label": "Skill sections" },
        createElement(
          TabsTrigger,
          {
            value: "overview",
            activeValue: "overview",
            triggerId: "tab-overview",
            controlsId: "panel-overview",
            className: "skill-detail-tab-button"
          },
          "Overview"
        ),
        createElement(
          TabsTrigger,
          {
            value: "resources",
            activeValue: "overview",
            triggerId: "tab-resources",
            controlsId: "panel-resources",
            className: "skill-detail-tab-button"
          },
          "Resources"
        )
      )
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('id="tab-overview"');
    expect(markup).toContain('aria-controls="panel-overview"');
    expect(markup).toContain('data-state="active"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('data-state="inactive"');
    expect(markup).toContain('aria-selected="false"');
    expect(markup).toContain('tabindex="-1"');
  });

  it("renders the active panel and skips inactive panels unless force mounted", () => {
    const activeMarkup = renderToStaticMarkup(
      createElement(
        TabsContent,
        {
          value: "overview",
          activeValue: "overview",
          panelId: "panel-overview",
          labelledBy: "tab-overview",
          className: "skill-detail-workbench-panel"
        },
        "Overview content"
      )
    );
    const inactiveMarkup = renderToStaticMarkup(
      createElement(
        TabsContent,
        {
          value: "resources",
          activeValue: "overview",
          panelId: "panel-resources",
          labelledBy: "tab-resources"
        },
        "Resources content"
      )
    );
    const forceMountedMarkup = renderToStaticMarkup(
      createElement(
        TabsContent,
        {
          value: "resources",
          activeValue: "overview",
          panelId: "panel-resources",
          labelledBy: "tab-resources",
          forceMount: true
        },
        "Resources content"
      )
    );

    expect(activeMarkup).toContain('role="tabpanel"');
    expect(activeMarkup).toContain('id="panel-overview"');
    expect(activeMarkup).toContain('aria-labelledby="tab-overview"');
    expect(activeMarkup).toContain('data-state="active"');
    expect(activeMarkup).toContain("Overview content");
    expect(inactiveMarkup).toBe("");
    expect(forceMountedMarkup).toContain('data-state="inactive"');
    expect(forceMountedMarkup).toContain("Resources content");
    expect(forceMountedMarkup).toContain("hidden");
  });
});
