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
      labels: {
        navCategories: "Categories",
        navRankings: "Rankings"
      }
    });

    expect(actions.map((action) => action.id)).toEqual(["category", "download-ranking"]);
    actions[0]?.onClick();
    actions[1]?.onClick();
    expect(onNavigate).toHaveBeenNthCalledWith(1, "/light/categories");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/light/rankings");
  });

  it("appends auth action and routes signed-out users to prefixed login", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/mobile/light/workspace");

    const actions = buildWorkspaceCenterTopbarUtilityActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: false,
      labels: {
        signIn: "Sign In",
        openDashboard: "Open Dashboard"
      }
    });

    expect(actions.map((action) => action.id)).toEqual(["global-search", "recent-jobs", "profile", "auth-action"]);
    actions[3]?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/mobile/light/login");
  });

  it("routes auth action to prefixed admin overview for signed-in users", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/light/workspace");

    const actions = buildWorkspaceCenterTopbarUtilityActions({
      onNavigate,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      hasSessionUser: true,
      labels: {
        signIn: "Sign In",
        openDashboard: "Open Dashboard"
      }
    });

    expect(actions[3]?.label).toBe("Open Dashboard");
    actions[1]?.onClick();
    actions[3]?.onClick();
    expect(onNavigate).toHaveBeenNthCalledWith(1, "/light/workspace");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/light/admin/overview");
  });
});
