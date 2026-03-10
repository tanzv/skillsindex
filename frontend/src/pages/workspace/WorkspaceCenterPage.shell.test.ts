import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkspaceCenterPage from "./WorkspaceCenterPage";

const originalWindow = globalThis.window;

function createWindowMock(width: number, height: number): Window & typeof globalThis {
  return {
    ...globalThis,
    innerWidth: width,
    innerHeight: height,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  } as unknown as Window & typeof globalThis;
}

describe("WorkspaceCenterPage shell integration", () => {
  beforeEach(() => {
    globalThis.window = createWindowMock(1440, 900);
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("uses the shared workspace shell for section routes with sidebar navigation", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceCenterPage, {
        locale: "en",
        currentPath: "/workspace/activity",
        onNavigate: () => undefined,
        sessionUser: null
      })
    );

    expect(html).toContain("workspace-prototype-utility-frame");
    expect(html).toContain("workspace-sidebar-collapse-toggle");
    expect(html).toContain("workspace-shell-content-scroll");
  });

  it("keeps overview route inside the shared shell without rendering a left sidebar", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceCenterPage, {
        locale: "en",
        currentPath: "/workspace",
        onNavigate: () => undefined,
        sessionUser: null
      })
    );

    expect(html).toContain("workspace-prototype-utility-frame");
    expect(html).not.toContain("workspace-sidebar-collapse-toggle");
  });
});
