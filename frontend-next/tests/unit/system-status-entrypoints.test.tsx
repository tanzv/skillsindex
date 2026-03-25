import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn()
}));

import { cookies } from "next/headers";

import GlobalError from "@/app/global-error";
import NotFoundPage from "@/app/not-found";

describe("system status entrypoints", () => {
  it("renders the root loading entrypoint as a lightweight shell skeleton", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get() {
        return undefined;
      }
    } as Awaited<ReturnType<typeof cookies>>);

    const { default: RootLoadingPage } = await import("@/app/loading");
    const markup = renderToStaticMarkup(await RootLoadingPage());

    expect(markup).toContain('data-testid="root-loading-page"');
    expect(markup).toContain("Loading route content.");
    expect(markup).not.toContain("Loading Next Surface");
    expect(markup).not.toContain("Transition State");
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
