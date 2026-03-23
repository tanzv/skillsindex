import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import GlobalError from "@/app/global-error";
import RootLoadingPage from "@/app/loading";
import NotFoundPage from "@/app/not-found";

describe("system status entrypoints", () => {
  it("renders the root loading entrypoint with a dedicated transient test id", () => {
    const markup = renderToStaticMarkup(createElement(RootLoadingPage));

    expect(markup).toContain('data-testid="system-status-loading-page"');
    expect(markup).toContain("Loading Next Surface");
    expect(markup).toContain("In Progress");
  });

  it("renders the root not-found entrypoint with the expected recovery links", () => {
    const markup = renderToStaticMarkup(createElement(NotFoundPage));

    expect(markup).toContain('data-testid="system-status-page"');
    expect(markup).toContain('data-testid="system-status-code"');
    expect(markup).toContain("Page Not Found");
    expect(markup).toContain("Back to Marketplace");
    expect(markup).toContain("Open Search");
  });

  it("renders the global error boundary entrypoint with digest details", () => {
    const markup = renderToStaticMarkup(
      createElement(GlobalError, {
        error: Object.assign(new Error("runtime fault"), { digest: "digest-500" }),
        reset: () => undefined
      })
    );

    expect(markup).toContain("<html");
    expect(markup).toContain("Unexpected Application Error");
    expect(markup).toContain("Error digest: digest-500");
    expect(markup).toContain("Try Again");
    expect(markup).toContain("Back to Marketplace");
  });
});
