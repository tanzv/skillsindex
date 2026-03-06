import { describe, expect, it, vi } from "vitest";

import { createPublicPageNavigator } from "./publicPageNavigation";
import {
  buildWorkspaceCenterTopbarPrimaryActions,
  buildWorkspaceCenterTopbarUtilityActions
} from "./WorkspaceCenterPage.topbar";

describe("WorkspaceCenterPage.topbar", () => {
  it("reuses compact primary actions and preserves prefixed routes", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");

    const actions = buildWorkspaceCenterTopbarPrimaryActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: true,
      labels: {
        navCategories: "Categories",
        navRankings: "Rankings",
        navTop: "TOP",
        openMarketplace: "Open Marketplace",
        openDashboard: "Open Dashboard",
        signIn: "Sign In"
      }
    });

    expect(actions.map((action) => action.id)).toEqual([
      "category",
      "ranking",
      "top",
      "open-marketplace",
      "open-dashboard"
    ]);
    expect(actions[0]?.className).toContain("is-marketplace-entry-action");
    expect(actions[4]?.className).toContain("is-backend-entry-action");
    actions[0]?.onClick();
    actions[1]?.onClick();
    actions[2]?.onClick();
    actions[3]?.onClick();
    actions[4]?.onClick();
    expect(onNavigate).toHaveBeenNthCalledWith(1, "/light/categories");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/light/rankings");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "/light/rankings?scope=top");
    expect(onNavigate).toHaveBeenNthCalledWith(4, "/light/");
    expect(onNavigate).toHaveBeenNthCalledWith(5, "/light/admin/overview");
  });

  it("uses sign-in route for dashboard action when session is missing", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");

    const actions = buildWorkspaceCenterTopbarPrimaryActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: false,
      labels: {
        navCategories: "Categories",
        navRankings: "Rankings",
        navTop: "TOP",
        openMarketplace: "Open Marketplace",
        openDashboard: "Open Dashboard",
        signIn: "Sign In"
      }
    });

    const openDashboardAction = actions.find((action) => action.id === "open-dashboard");
    expect(openDashboardAction?.label).toBe("Sign In");
    openDashboardAction?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/login");
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
