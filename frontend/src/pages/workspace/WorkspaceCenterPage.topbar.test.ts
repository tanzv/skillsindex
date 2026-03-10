import { describe, expect, it, vi } from "vitest";

import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import {
  buildWorkspaceCenterTopbarPrimaryActions,
  buildWorkspaceCenterTopbarUtilityActions
} from "./WorkspaceCenterPage.topbar";

function createPrimaryLabels() {
  return {
    categories: "Categories",
    rankings: "Rankings",
    top: "TOP",
    openMarketplace: "Open Marketplace",
    openDashboard: "Open Dashboard",
    signIn: "Sign In"
  };
}

describe("WorkspaceCenterPage.topbar", () => {
  it("builds workspace-focused primary actions and preserves prefixed routes", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");
    const sectionAction = {
      id: "section-overview",
      label: "Overview",
      className: "is-menu-entry is-menu-group-sections",
      onClick: () => onNavigate(navigator.toPublic("/workspace"))
    };
    const hubAction = {
      id: "system-governance",
      label: "Governance",
      className: "is-menu-entry is-menu-group-system-settings",
      onClick: () => onNavigate(navigator.toPublic("/governance"))
    };

    const actions = buildWorkspaceCenterTopbarPrimaryActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: true,
      labels: createPrimaryLabels(),
      extraPrimaryActions: [sectionAction, hubAction]
    });

    expect(actions.map((action) => action.id)).toEqual([
      "category",
      "ranking",
      "top",
      "open-marketplace",
      "open-dashboard",
      "section-overview",
      "system-governance"
    ]);
    expect(actions[0]?.className).toContain("is-marketplace-entry-action");
    expect(actions[4]?.className).toContain("is-backend-entry-action");

    actions[0]?.onClick();
    actions[1]?.onClick();
    actions[2]?.onClick();
    actions[3]?.onClick();
    actions[4]?.onClick();
    actions[5]?.onClick();
    actions[6]?.onClick();

    expect(onNavigate).toHaveBeenNthCalledWith(1, "/light/categories");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/light/rankings");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "/light/rankings?scope=top");
    expect(onNavigate).toHaveBeenNthCalledWith(4, "/light/");
    expect(onNavigate).toHaveBeenNthCalledWith(5, "/light/admin/overview");
    expect(onNavigate).toHaveBeenNthCalledWith(6, "/light/workspace");
    expect(onNavigate).toHaveBeenNthCalledWith(7, "/light/governance");
  });

  it("uses sign-in route for dashboard action when session is missing", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");

    const actions = buildWorkspaceCenterTopbarPrimaryActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: false,
      labels: createPrimaryLabels()
    });

    const openDashboardAction = actions.find((action) => action.id === "open-dashboard");
    expect(openDashboardAction?.label).toBe("Sign In");
    openDashboardAction?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/login");
  });

  it("keeps built-in primary action when an extra action duplicates its id", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");

    const actions = buildWorkspaceCenterTopbarPrimaryActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: true,
      labels: createPrimaryLabels(),
      extraPrimaryActions: [
        {
          id: "open-dashboard",
          label: "Custom Dashboard",
          onClick: () => onNavigate("/custom-dashboard")
        }
      ]
    });

    expect(actions.map((action) => action.id)).toEqual([
      "category",
      "ranking",
      "top",
      "open-marketplace",
      "open-dashboard"
    ]);
    expect(actions[4]?.label).toBe("Open Dashboard");
    actions[4]?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/admin/overview");
  });

  it("keeps workspace utility actions focused on search and queue entry points", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/mobile/light/workspace");

    const actions = buildWorkspaceCenterTopbarUtilityActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      hasSessionUser: false,
      labels: {
        globalSearch: "Search",
        recentJobs: "Recent Jobs"
      }
    });

    expect(actions.map((action) => action.id)).toEqual(["global-search", "recent-jobs"]);
    expect(actions[0]?.className).toContain("is-search-trigger");
    actions[0]?.onClick();
    actions[1]?.onClick();
    expect(onNavigate).toHaveBeenNthCalledWith(1, "/mobile/light/results");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/mobile/light/workspace");
  });

  it("keeps utility action set stable for signed-in users", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");

    const actions = buildWorkspaceCenterTopbarUtilityActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      hasSessionUser: true
    });

    expect(actions.map((action) => action.id)).toEqual(["global-search", "recent-jobs"]);
    actions[1]?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/workspace");
  });
});
