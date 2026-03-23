import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";

describe("admin page load state", () => {
  it("resolves loading while a request is in flight", () => {
    expect(resolveAdminPageLoadState({ loading: true, error: "", hasData: false })).toBe("loading");
  });

  it("resolves ready when live data is present", () => {
    expect(resolveAdminPageLoadState({ loading: false, error: "", hasData: true })).toBe("ready");
  });

  it("resolves error when the request failed before any live data loaded", () => {
    expect(resolveAdminPageLoadState({ loading: false, error: "admin overview down", hasData: false })).toBe("error");
  });

  it("renders the page header and request failure details", () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageLoadStateFrame, {
        eyebrow: "Admin",
        title: "Admin Overview",
        description: "Live operations state",
        error: "admin overview down"
      })
    );

    expect(markup).toContain("Admin Overview");
    expect(markup).toContain("Live operations state");
    expect(markup).toContain("Request failed");
    expect(markup).toContain("admin overview down");
  });
});
