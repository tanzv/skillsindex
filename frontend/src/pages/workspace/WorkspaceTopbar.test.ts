import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { createGlobalUserControlService } from "../../lib/globalUserControlService";
import AppGlobalTopbar from "../../components/AppGlobalTopbar";

const originalWindow = globalThis.window;


afterEach(() => {
  globalThis.window = originalWindow;
});

describe("AppGlobalTopbar", () => {
  it("renders user center trigger in right utility area instead of left accessory", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(AppGlobalTopbar, {
        locale: "en",
        isLightTheme: true,
        brandTitle: "SkillsIndex",
        brandSubtitle: "User Portal",
        sessionUser: {
          id: 100,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        userControlService,
        onBrandClick: () => undefined,
        primaryActions: [],
        utilityActions: [],
        rightRegistrations: []
      })
    );

    expect(html).not.toContain("marketplace-topbar-left-accessory");
    expect(html).not.toContain("marketplace-topbar-light-utility");
    expect(html).toMatch(/workspace-shell-topbar-light-utility[\s\S]*workspace-user-center-trigger/);
  });

  it("collapses primary navigation when action count exceeds visible threshold", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(AppGlobalTopbar, {
        locale: "en",
        isLightTheme: true,
        brandTitle: "SkillsIndex",
        brandSubtitle: "User Portal",
        sessionUser: null,
        userControlService,
        onBrandClick: () => undefined,
        primaryActions: [
          { id: "one", label: "One", onClick: () => undefined },
          { id: "two", label: "Two", onClick: () => undefined },
          { id: "three", label: "Three", onClick: () => undefined },
          { id: "four", label: "Four", onClick: () => undefined },
          { id: "five", label: "Five", onClick: () => undefined },
          { id: "six", label: "Six", onClick: () => undefined }
        ],
        utilityActions: [],
        rightRegistrations: []
      })
    );

    expect(html).toContain("One");
    expect(html).toContain("Five");
    expect(html).toContain("workspace-topbar-toggle-icon-button");
    expect(html).toContain("workspace-topbar-toggle-button-content");
    expect(html).toContain("workspace-topbar-toggle-panel-icon");
    expect(html).toContain("workspace-topbar-toggle-badge");
    expect(html).toContain("workspace-topbar-toggle-badge-count");
    expect(html).toContain(">1<");
    expect(html).toMatch(/workspace-topbar-primary-groups-shell[\s\S]*workspace-topbar-primary-inline-toggle/);
    expect(html).toContain("workspace-topbar-primary-group-label");
    expect(html).toContain(">Global<");
    expect(html).toContain("workspace-topbar-interaction-scope");
    expect(html).toContain("workspace-shell-topbar");
    expect(html).not.toContain("marketplace-topbar-below-content");
    expect(html).not.toContain("marketplace-topbar-nav-button");
    expect(html).toContain("workspace-topbar-overflow-wrapper is-collapsed");
    expect(html).toContain('aria-controls="workspace-topbar-overflow-panel"');
    expect(html).toContain('aria-label="Expand app navigation panel"');
    expect(html).toContain('title="More"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders hidden actions in a secondary panel when navigation is expanded", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(AppGlobalTopbar, {
        locale: "en",
        isLightTheme: true,
        brandTitle: "SkillsIndex",
        brandSubtitle: "User Portal",
        sessionUser: null,
        userControlService,
        onBrandClick: () => undefined,
        primaryActions: [
          { id: "one", label: "One", onClick: () => undefined },
          { id: "two", label: "Two", onClick: () => undefined },
          { id: "three", label: "Three", onClick: () => undefined },
          { id: "four", label: "Four", onClick: () => undefined },
          { id: "five", label: "Five", onClick: () => undefined },
          { id: "six", label: "Six", onClick: () => undefined }
        ],
        utilityActions: [],
        rightRegistrations: [],
        defaultPrimaryExpanded: true
      })
    );

    expect(html).toContain("workspace-topbar-overflow-wrapper is-expanded");
    expect(html).toContain('id="workspace-topbar-overflow-panel"');
    expect(html).toContain("workspace-shell-topbar-overflow-panel");
    expect(html).toContain("workspace-topbar-overflow-group");
    expect(html).toContain("workspace-topbar-overflow-title");
    expect(html).toContain("App Menu");
    expect(html).not.toContain("Use this global menu");
    expect(html).toContain("Six");
    expect(html).toContain("workspace-topbar-toggle-panel-icon");
    expect(html).toContain('title="Hide"');
    expect(html).toContain('aria-label="Collapse app navigation panel"');
  });

  it("groups overflow actions by workspace menu group token", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(AppGlobalTopbar, {
        locale: "en",
        isLightTheme: true,
        brandTitle: "SkillsIndex",
        brandSubtitle: "User Portal",
        sessionUser: null,
        userControlService,
        onBrandClick: () => undefined,
        primaryActions: [
          { id: "section-overview", label: "Overview", className: "is-menu-entry is-menu-group-sections", onClick: () => undefined },
          { id: "section-activity", label: "Activity", className: "is-menu-entry is-menu-group-sections", onClick: () => undefined },
          { id: "section-queue", label: "Queue", className: "is-menu-entry is-menu-group-sections", onClick: () => undefined },
          { id: "section-policy", label: "Policy", className: "is-menu-entry is-menu-group-sections", onClick: () => undefined },
          { id: "open-dashboard", label: "Open Dashboard", className: "is-open-dashboard-action is-backend-entry-action", onClick: () => undefined },
          { id: "system-login-configuration", label: "Login Configuration", className: "is-menu-entry is-menu-group-system-settings", onClick: () => undefined },
          { id: "system-governance", label: "Governance Center", className: "is-menu-entry is-menu-group-system-settings", onClick: () => undefined },
          { id: "org-role", label: "Role Management", className: "is-menu-entry is-menu-group-user-management", onClick: () => undefined }
        ],
        utilityActions: [],
        rightRegistrations: [],
        defaultPrimaryExpanded: true
      })
    );

    expect(html).toContain("workspace-topbar-overflow-wrapper is-expanded");
    expect(html).toContain("System Settings");
    expect(html).toContain("User Management");
    expect(html).toContain("workspace-topbar-overflow-group-header");
    expect(html).toContain("workspace-topbar-overflow-group-count");
    expect(html).toContain("Login Configuration");
    expect(html).toContain("Role Management");
  });

  it("keeps marketplace actions in overflow while prioritizing workspace controls in primary area", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(AppGlobalTopbar, {
        locale: "en",
        isLightTheme: true,
        brandTitle: "SkillsIndex",
        brandSubtitle: "User Portal",
        sessionUser: {
          id: 100,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        userControlService,
        onBrandClick: () => undefined,
        primaryActions: [
          {
            id: "category",
            label: "Categories",
            className: "is-category-action is-marketplace-entry-action",
            onClick: () => undefined
          },
          {
            id: "ranking",
            label: "Rankings",
            className: "is-download-ranking-action is-marketplace-entry-action",
            onClick: () => undefined
          },
          {
            id: "open-dashboard",
            label: "Open Dashboard",
            className: "is-open-dashboard-action is-backend-entry-action",
            onClick: () => undefined
          },
          {
            id: "workspace-overview",
            label: "Overview",
            className: "is-menu-entry",
            onClick: () => undefined
          },
          {
            id: "workspace-queue",
            label: "Queue",
            className: "is-menu-entry",
            onClick: () => undefined
          },
          {
            id: "workspace-policy",
            label: "Policy",
            className: "is-menu-entry",
            onClick: () => undefined
          },
          {
            id: "workspace-runbook",
            label: "Runbook",
            className: "is-menu-entry",
            onClick: () => undefined
          }
        ],
        utilityActions: [],
        rightRegistrations: []
      })
    );

    expect(html).toContain("workspace-topbar-toggle-icon-button");
    expect(html).toContain(">2<");
    expect(html).toContain("Market");
    expect(html).toContain("workspace-shell-topbar-nav-button");
    expect(html).not.toContain("marketplace-topbar-nav-button");
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders localized toggle and overflow labels for zh locale", () => {
    const userControlService = createGlobalUserControlService({
      locale: "zh",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(AppGlobalTopbar, {
        locale: "zh",
        isLightTheme: true,
        brandTitle: "SkillsIndex",
        brandSubtitle: "\u7528\u6237\u95e8\u6237",
        sessionUser: null,
        userControlService,
        onBrandClick: () => undefined,
        primaryActions: [
          { id: "one", label: "One", onClick: () => undefined },
          { id: "two", label: "Two", onClick: () => undefined },
          { id: "three", label: "Three", onClick: () => undefined },
          { id: "four", label: "Four", onClick: () => undefined },
          { id: "five", label: "Five", onClick: () => undefined },
          { id: "six", label: "Six", onClick: () => undefined },
          { id: "category", label: "Categories", className: "is-marketplace-entry-action", onClick: () => undefined }
        ],
        utilityActions: [],
        rightRegistrations: [],
        defaultPrimaryExpanded: true
      })
    );

    expect(html).toContain('\u5e02\u573a\u5165\u53e3');
    expect(html).toContain('\u8bbf\u5ba2\u7528\u6237');
    expect(html).toContain('\u5e94\u7528\u83dc\u5355');
    expect(html).toContain("workspace-shell-topbar-overflow-panel");
    expect(html).toContain('aria-label="\u6536\u8d77\u5e94\u7528\u5bfc\u822a\u9762\u677f"');
    expect(html).toContain('aria-label="\u5df2\u5c55\u5f00\u7684\u5e94\u7528\u5bfc\u822a\u9762\u677f"');
    expect(html).toContain('title="\u6536\u8d77"');
  });
});
