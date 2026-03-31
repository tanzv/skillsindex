import { readFileSync } from "node:fs";
import path from "node:path";

import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/src/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  DialogContent: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
    createElement("div", { role: "dialog", "aria-modal": "true", ...props }, children)
}));

vi.mock("@/src/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetContent: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
    createElement("div", { role: "dialog", "aria-modal": "true", ...props }, children)
}));

import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";

describe("DetailFormSurface", () => {
  it("does not reference an undefined mount guard in runtime effects", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "src/components/shared/DetailFormSurface.tsx"),
      "utf8"
    );

    expect(source).not.toContain("if (!isMounted)");
  });

  it("delegates escape dismissal to the dialog primitive without a window-level keydown listener", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "src/components/shared/DetailFormSurface.tsx"),
      "utf8"
    );

    expect(source).not.toContain('window.addEventListener("keydown"');
    expect(source).toContain("onOpenChange={(nextOpen) => !nextOpen && onClose()}");
  });

  it("uses dialog auto focus hooks instead of forcing focus onto the panel container", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "src/components/shared/DetailFormSurface.tsx"),
      "utf8"
    );

    expect(source).toContain("onOpenAutoFocus");
    expect(source).not.toContain("panelRef.current");
    expect(source).toContain("resolveFirstFocusableElement(bodyRef.current)");
  });

  it("uses portaled dialog and sheet primitives so overlays escape local layout contexts", () => {
    const dialogSource = readFileSync(path.resolve(process.cwd(), "src/components/ui/dialog.tsx"), "utf8");
    const sheetSource = readFileSync(path.resolve(process.cwd(), "src/components/ui/sheet.tsx"), "utf8");

    expect(dialogSource).toContain("<DialogPortal>");
    expect(sheetSource).toContain("<SheetPortal>");
  });

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
          dataTestId: "detail-form-surface-test",
          footer: createElement("button", { type: "button" }, "Save")
        },
        createElement("div", null, "Drawer body")
      )
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('data-variant="drawer"');
    expect(markup).toContain('data-size="wide"');
    expect(markup).toContain('data-motion-state="open"');
    expect(markup).toContain('data-testid="detail-form-surface-test"');
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
    expect(markup).toContain('data-motion-state="open"');
    expect(markup).toContain("Confirm rotation");
    expect(markup).toContain("Status");
    expect(markup).toContain("Modal body");
  });
});
