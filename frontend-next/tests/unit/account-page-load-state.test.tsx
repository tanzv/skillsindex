import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountPageLoadStateFrame, resolveAccountPageLoadState } from "@/src/features/accountCenter/accountPageLoadState";

describe("account page load state", () => {
  it("resolves loading while account data is being requested", () => {
    expect(resolveAccountPageLoadState({ loading: true, error: "", hasData: false })).toBe("loading");
  });

  it("resolves ready when account data is available", () => {
    expect(resolveAccountPageLoadState({ loading: false, error: "", hasData: true })).toBe("ready");
  });

  it("resolves error when account data fails before the first successful load", () => {
    expect(resolveAccountPageLoadState({ loading: false, error: "profile service unavailable", hasData: false })).toBe("error");
  });

  it("renders the page header with the load error", () => {
    const markup = renderToStaticMarkup(
      createElement(AccountPageLoadStateFrame, {
        eyebrow: "Account",
        title: "Account Center",
        description: "Manage your profile and sessions.",
        error: "profile service unavailable"
      })
    );

    expect(markup).toContain("Account Center");
    expect(markup).toContain("Manage your profile and sessions.");
    expect(markup).toContain("Request failed");
    expect(markup).toContain("profile service unavailable");
  });
});
