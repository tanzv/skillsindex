import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createGlobalUserControlService } from "../lib/globalUserControlService";
import WorkspaceTopbar from "./WorkspaceTopbar";

describe("WorkspaceTopbar", () => {
  it("renders user center trigger in right utility area instead of left accessory", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(WorkspaceTopbar, {
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
    expect(html).toMatch(/marketplace-topbar-light-utility[\s\S]*workspace-user-center-trigger/);
  });

  it("collapses primary navigation when action count exceeds visible threshold", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(WorkspaceTopbar, {
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
    expect(html).toContain("workspace-topbar-toggle-label");
    expect(html).toContain(">More<");
    expect(html).toContain("workspace-topbar-toggle-badge");
    expect(html).toContain("workspace-topbar-toggle-badge-count");
    expect(html).toContain(">1<");
    expect(html).toContain("workspace-topbar-primary-inline-toggle");
    expect(html).toContain("workspace-topbar-primary-group-label");
    expect(html).toContain(">Quick<");
    expect(html).toContain("workspace-topbar-interaction-scope");
    expect(html).toContain("workspace-topbar-overflow-wrapper is-collapsed");
    expect(html).toContain("aria-controls=\"workspace-topbar-overflow-panel\"");
    expect(html).toContain("aria-label=\"Expand primary navigation panel\"");
    expect(html).toContain("aria-hidden=\"true\"");
  });

  it("renders hidden actions in a secondary panel when navigation is expanded", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(WorkspaceTopbar, {
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
    expect(html).toContain("id=\"workspace-topbar-overflow-panel\"");
    expect(html).toContain("workspace-topbar-overflow-group");
    expect(html).toContain("workspace-topbar-overflow-title");
    expect(html).toContain("Six");
    expect(html).toContain("workspace-topbar-toggle-label");
    expect(html).toContain(">Hide<");
    expect(html).toContain("aria-label=\"Collapse primary navigation panel\"");
  });

  it("keeps marketplace actions in overflow while prioritizing workspace controls in primary area", () => {
    const userControlService = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const html = renderToStaticMarkup(
      React.createElement(WorkspaceTopbar, {
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
          }
        ],
        utilityActions: [],
        rightRegistrations: []
      })
    );

    expect(html).toContain("workspace-topbar-toggle-icon-button");
    expect(html).toContain(">2<");
    expect(html).toContain("Marketplace Navigation");
    expect(html).toContain("aria-hidden=\"true\"");
  });
});
