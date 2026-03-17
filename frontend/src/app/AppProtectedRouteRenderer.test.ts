import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import type { ProtectedRoute } from "../appNavigationConfig";
import AppProtectedRouteRenderer from "./AppProtectedRouteRenderer";

const originalWindow = globalThis.window;

function setWindowPathname(pathname: string) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        pathname
      }
    }
  });
}

function renderRoute(route: ProtectedRoute): string {
  setWindowPathname(route);

  return renderToStaticMarkup(
    React.createElement(AppProtectedRouteRenderer, {
      route,
      locale: "en",
      themeMode: "dark",
      submitLoading: false,
      sessionUser: {
        id: 101,
        username: "alice",
        display_name: "Alice",
        role: "admin",
        status: "active"
      },
      text: {
        brandName: "SkillsIndex",
        brandTitle: "Control Matrix",
        home: "Home",
        homeSubtitle: "Prototype aligned public catalog",
        quickJump: "Quick Jump",
        bootstrapping: "Bootstrapping",
        loginKicker: "Login",
        loginTitle: "Sign in",
        loginLead: "Use your workspace account."
      },
      onNavigate: () => undefined,
      onLocaleChange: () => undefined,
      onThemeModeChange: () => undefined,
      onLogout: () => undefined
    })
  );
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow
  });
});

describe("AppProtectedRouteRenderer", () => {
  it("renders workspace routes inside the shared backend shell", () => {
    const html = renderRoute("/workspace");

    expect(html).toContain("backend-shell");
    expect(html).toContain("Workspace");
    expect(html).not.toContain("workspace-prototype-utility-frame");
  });

  it("renders skill operation routes inside the shared backend shell", () => {
    const html = renderRoute("/admin/ingestion/repository");

    expect(html).toContain("backend-shell");
    expect(html).toContain("Repository Intake");
    expect(html).not.toContain("workspace-prototype-utility-frame");
  });

  it("renders organization management routes inside the shared backend shell", () => {
    const html = renderRoute("/admin/accounts");

    expect(html).toContain("backend-shell");
    expect(html).toContain("Quick Jump");
    expect(html).toContain("Account Management");
    expect(html).toContain("Role Management");
    expect(html).toContain("Organizations");
    expect(html).toContain("Access");
    expect(html).not.toContain("workspace-prototype-utility-frame");
  });

  it("renders nested users routes inside the shared backend shell", () => {
    const html = renderRoute("/admin/accounts/new");

    expect(html).toContain("backend-shell");
    expect(html).toContain("Quick Jump");
    expect(html).toContain("Account Management");
    expect(html).toContain("Role Management");
    expect(html).toContain("Organizations");
    expect(html).toContain("Access");
    expect(html).not.toContain("workspace-prototype-utility-frame");
  });

  it("renders organization workspace routes inside the shared backend shell", () => {
    const html = renderRoute("/admin/organizations");

    expect(html).toContain("backend-shell");
    expect(html).toContain("Organizations");
    expect(html).not.toContain("workspace-prototype-utility-frame");
  });
});
