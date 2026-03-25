import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/src/components/ui/sheet";

describe("ui overlay primitives", () => {
  it("renders a dialog content contract with title and description wiring", () => {
    const markup = renderToStaticMarkup(
      createElement(
        Dialog,
        { open: true },
        createElement(
          DialogContent,
          null,
          createElement(
            DialogHeader,
            null,
            createElement(DialogTitle, null, "Confirm rotation"),
            createElement(DialogDescription, null, "Rotate the key for all active clients.")
          ),
          createElement("div", null, "Dialog body"),
          createElement(DialogFooter, null, createElement("button", { type: "button" }, "Confirm"))
        )
      )
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Confirm rotation");
    expect(markup).toContain("Rotate the key for all active clients.");
    expect(markup).toContain("Dialog body");
    expect(markup).toContain("Confirm");
  });

  it("renders a sheet content contract with side metadata", () => {
    const panelRef = createRef<HTMLDivElement>();
    const markup = renderToStaticMarkup(
      createElement(
        Sheet,
        { open: true },
        createElement(
          SheetContent,
          { ref: panelRef, side: "right" },
          createElement(
            SheetHeader,
            null,
            createElement(SheetTitle, null, "Skill detail"),
            createElement(SheetDescription, null, "Inspect the record without leaving the page.")
          ),
          createElement("div", null, "Sheet body"),
          createElement(SheetFooter, null, createElement("button", { type: "button" }, "Save"))
        )
      )
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('data-side="right"');
    expect(markup).toContain("Skill detail");
    expect(markup).toContain("Inspect the record without leaving the page.");
    expect(markup).toContain("Sheet body");
    expect(markup).toContain("Save");
  });
});
