import { readFileSync } from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SystemStatusLinkAction, SystemStatusPage } from "@/src/components/shared/SystemStatusPage";

describe("system status page", () => {
  it("keeps status-page styling in the app shell instead of a component-level module chunk", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "src/components/shared/SystemStatusPage.tsx"),
      "utf8"
    );

    expect(source).not.toContain('import styles from "./SystemStatusPage.module.scss"');
    expect(source).toContain('"system-status-page"');
  });

  it("renders the shared system status shell with code and actions", () => {
    const markup = renderToStaticMarkup(
      <SystemStatusPage
        eyebrow="System Status"
        statusCode="404"
        title="Page Not Found"
        description="The requested route is missing."
        tone="warning"
        actions={(
          <SystemStatusLinkAction href="/" variant="primary">
            Back to Marketplace
          </SystemStatusLinkAction>
        )}
      />
    );

    expect(markup).toContain('data-testid="system-status-page"');
    expect(markup).toContain('data-testid="system-status-code"');
    expect(markup).toContain("Page Not Found");
    expect(markup).toContain("Back to Marketplace");
  });

  it("supports overriding the default test id for transient shells", () => {
    const markup = renderToStaticMarkup(
      <SystemStatusPage
        eyebrow="Transition State"
        title="Loading Next Surface"
        description="The shell is assembling route data."
        tone="loading"
        testId="system-status-loading-page"
      />
    );

    expect(markup).toContain('data-testid="system-status-loading-page"');
    expect(markup).not.toContain('data-testid="system-status-page"');
  });
});
