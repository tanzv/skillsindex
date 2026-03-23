import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";

describe("DetailFormSurface", () => {
  it("renders nothing when closed", () => {
    const markup = renderToStaticMarkup(
      createElement(
        DetailFormSurface,
        {
          open: false,
          title: "API Key",
          closeLabel: "Close panel",
          onClose: () => {}
        },
        "Body"
      )
    );

    expect(markup).toBe("");
  });

  it("renders an accessible drawer dialog when open", () => {
    const markup = renderToStaticMarkup(
      createElement(
        DetailFormSurface,
        {
          open: true,
          title: "API Key",
          description: "Manage lifecycle and scopes.",
          closeLabel: "Close panel",
          onClose: () => {},
          variant: "drawer",
          size: "wide",
          footer: createElement("button", { type: "button" }, "Save")
        },
        createElement("div", null, "Drawer body")
      )
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('data-variant="drawer"');
    expect(markup).toContain('data-size="wide"');
    expect(markup).toContain("API Key");
    expect(markup).toContain("Manage lifecycle and scopes.");
    expect(markup).toContain("Drawer body");
    expect(markup).toContain('aria-label="Close panel"');
    expect(markup).toContain("Save");
  });

  it("renders the modal variant contract when requested", () => {
    const markup = renderToStaticMarkup(
      createElement(
        DetailFormSurface,
        {
          open: true,
          title: "Confirm rotation",
          closeLabel: "Close modal",
          onClose: () => {},
          variant: "modal",
          actions: createElement("span", null, "Status")
        },
        "Modal body"
      )
    );

    expect(markup).toContain('data-variant="modal"');
    expect(markup).toContain("Confirm rotation");
    expect(markup).toContain("Status");
    expect(markup).toContain("Modal body");
  });
});
