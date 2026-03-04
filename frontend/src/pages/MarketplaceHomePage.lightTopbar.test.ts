import { describe, expect, it, vi } from "vitest";
import { buildLightTopbarPrimaryActions, buildLightTopbarUtilityActions } from "./MarketplaceHomePage.lightTopbar";

describe("MarketplaceHomePage light topbar actions", () => {
  it("includes category and download ranking actions with localized labels", () => {
    const onNavigate = vi.fn();
    const toPublicPath = (path: string) => `/light${path}`;

    const actions = buildLightTopbarPrimaryActions({
      onNavigate,
      toPublicPath,
      labels: {
        categoryNav: "Categories",
        downloadRankingNav: "Download Ranking"
      }
    });

    const categoryAction = actions.find((action) => action.id === "category");
    const rankingAction = actions.find((action) => action.id === "download-ranking");
    expect(categoryAction?.label).toBe("Categories");
    expect(rankingAction?.label).toBe("Download Ranking");

    categoryAction?.onClick();
    rankingAction?.onClick();
    expect(onNavigate).toHaveBeenNthCalledWith(1, "/light/categories");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/light/rankings");
  });

  it("supports custom active action and extension actions", () => {
    const onNavigate = vi.fn();
    const toPublicPath = (path: string) => `/light${path}`;

    const actions = buildLightTopbarPrimaryActions({
      onNavigate,
      toPublicPath,
      activeActionID: "category",
      labels: {
        categoryNav: "Categories",
        downloadRankingNav: "Download Ranking"
      },
      extraPrimaryActions: [
        {
          id: "insights",
          label: "Insights",
          badge: "NEW",
          tone: "highlight",
          onClick: () => onNavigate("/light/insights")
        }
      ]
    });

    const categoryAction = actions.find((action) => action.id === "category");
    const rankingAction = actions.find((action) => action.id === "download-ranking");
    const insightsAction = actions.find((action) => action.id === "insights");
    expect(categoryAction?.active).toBe(true);
    expect(rankingAction?.badge).toBe("TOP");
    expect(insightsAction?.badge).toBe("NEW");

    insightsAction?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/insights");
  });

  it("supports full preset for extended primary navigation", () => {
    const onNavigate = vi.fn();
    const toPublicPath = (path: string) => `/light${path}`;

    const actions = buildLightTopbarPrimaryActions({
      onNavigate,
      toPublicPath,
      primaryPreset: "full",
      activeActionID: "workspace",
      labels: {
        categoryNav: "Categories",
        downloadRankingNav: "Download Ranking"
      }
    });

    expect(actions.map((action) => action.id)).toEqual([
      "workspace",
      "category",
      "download-ranking",
      "execution",
      "sync",
      "security",
      "developer"
    ]);
    expect(actions.find((action) => action.id === "workspace")?.active).toBe(true);
  });

  it("appends auth action as the last utility button when configured", () => {
    const onNavigate = vi.fn();
    const onAuthAction = vi.fn();
    const toPublicPath = (path: string) => `/light${path}`;

    const actions = buildLightTopbarUtilityActions({
      onNavigate,
      toPublicPath,
      hasSessionUser: false,
      authActionLabel: "Sign In",
      onAuthAction
    });

    expect(actions.map((action) => action.id)).toEqual(["global-search", "recent-jobs", "profile", "auth-action"]);
    actions[3]?.onClick();
    expect(onAuthAction).toHaveBeenCalledTimes(1);
  });

  it("keeps utility actions unchanged when auth action is not provided", () => {
    const onNavigate = vi.fn();
    const toPublicPath = (path: string) => `/light${path}`;

    const actions = buildLightTopbarUtilityActions({
      onNavigate,
      toPublicPath,
      hasSessionUser: true
    });

    expect(actions.map((action) => action.id)).toEqual(["global-search", "recent-jobs", "profile"]);
  });
});
