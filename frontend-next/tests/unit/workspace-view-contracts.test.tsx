import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  renderWorkspaceSectionItem,
  resolveWorkspaceActionVariantClassName,
  resolveWorkspaceMetricToneClassName,
  resolveWorkspaceSectionVariantClassName
} from "@/src/features/workspace/workspaceViewContracts";

describe("workspace view contracts", () => {
  it("resolves workspace action variants from a centralized contract", () => {
    expect(resolveWorkspaceActionVariantClassName("default")).toBe("is-primary");
    expect(resolveWorkspaceActionVariantClassName("soft")).toBe("is-soft");
    expect(resolveWorkspaceActionVariantClassName("outline")).toBe("");
  });

  it("resolves metric and section variants without route-frame local duplication", () => {
    expect(resolveWorkspaceMetricToneClassName("warning")).toBe("is-warning");
    expect(resolveWorkspaceSectionVariantClassName("activity-list")).toBe("is-activity-list");
    expect(resolveWorkspaceSectionVariantClassName("default")).toBe("");
  });

  it("renders section items from a variant-to-renderer contract", () => {
    const signalMarkup = renderToStaticMarkup(
      renderWorkspaceSectionItem(
        {
          label: "Health",
          value: "Stable",
          description: "Signal description"
        },
        "signal-grid"
      )
    );
    const sessionMarkup = renderToStaticMarkup(
      renderWorkspaceSectionItem(
        {
          label: "Current Session",
          value: "42 minutes"
        },
        "session"
      )
    );

    expect(signalMarkup).toContain("is-signal");
    expect(sessionMarkup).toContain("is-session");
  });
});
