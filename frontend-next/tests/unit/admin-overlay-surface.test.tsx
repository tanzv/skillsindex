import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AdminConfirmModal,
  AdminDetailDrawer,
  AdminOverlayMetaList,
  AdminOverlaySection
} from "@/src/components/admin/AdminOverlaySurface";

describe("AdminOverlaySurface", () => {
  it("renders a drawer contract with admin section primitives", () => {
    const markup = renderToStaticMarkup(
      createElement(
        AdminDetailDrawer,
        {
          open: true,
          title: "Manual Skill",
          description: "Inspect inventory metadata.",
          closeLabel: "Close panel",
          onClose: () => {}
        },
        createElement(
          AdminOverlaySection,
          { title: "Metadata", description: "Normalized record detail." },
          createElement(AdminOverlayMetaList, {
            items: [
              { label: "Source", value: "manual" },
              { label: "Visibility", value: "private" }
            ]
          })
        )
      )
    );

    expect(markup).toContain('data-variant="drawer"');
    expect(markup).toContain("Manual Skill");
    expect(markup).toContain("Metadata");
    expect(markup).toContain("Visibility");
  });

  it("renders a standardized confirm modal footer", () => {
    const markup = renderToStaticMarkup(
      createElement(AdminConfirmModal, {
        open: true,
        title: "Confirm retry",
        description: "Retry the failed import job.",
        closeLabel: "Close modal",
        cancelLabel: "Cancel",
        confirmLabel: "Retry",
        onClose: () => {},
        onConfirm: () => {}
      }, createElement("p", null, "The job will be queued again."))
    );

    expect(markup).toContain('data-variant="modal"');
    expect(markup).toContain("Confirm retry");
    expect(markup).toContain("Retry the failed import job.");
    expect(markup).toContain("The job will be queued again.");
    expect(markup).toContain("Cancel");
    expect(markup).toContain("Retry");
  });
});
