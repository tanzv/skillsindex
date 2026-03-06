import { describe, expect, it, vi } from "vitest";
import {
  buildLightTopbarPrimaryActions,
  buildLightTopbarUtilityActions,
  buildMarketplaceTopbarActionBundle,
  buildMarketplaceTopbarPrimaryActions,
  resolveMarketplaceTopbarPrimaryLabels
} from "./MarketplaceHomePage.lightTopbar";

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

  it("builds primary actions from shared marketplace labels", () => {
    const onNavigate = vi.fn();
    const toPublicPath = (path: string) => `/light${path}`;
    const labels = resolveMarketplaceTopbarPrimaryLabels("en");

    const actions = buildMarketplaceTopbarPrimaryActions({
      onNavigate,
      toPublicPath,
      locale: "en",
      activeActionID: "category"
    });

    expect(actions.map((action) => action.id)).toEqual(["category", "download-ranking"]);
    expect(actions[0]?.label).toBe(labels.categoryNav);
    expect(actions[1]?.label).toBe(labels.downloadRankingNav);
    expect(actions[0]?.active).toBe(true);

    actions[1]?.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/rankings");
  });

  it("builds bundled primary and utility actions from shared inputs", () => {
    const onNavigate = vi.fn();
    const onAuthAction = vi.fn();
    const bundle = buildMarketplaceTopbarActionBundle({
      onNavigate,
      toPublicPath: (path: string) => `/light${path}`,
      locale: "en",
      hasSessionUser: false,
      activeActionID: "category",
      authActionLabel: "Sign In",
      onAuthAction
    });

    expect(bundle.primaryActions.map((action) => action.id)).toEqual(["category", "download-ranking"]);
    expect(bundle.utilityActions.map((action) => action.id)).toEqual(["global-search", "recent-jobs", "profile", "auth-action"]);
    expect(bundle.primaryActions[0]?.active).toBe(true);

    bundle.utilityActions[3]?.onClick();
    expect(onAuthAction).toHaveBeenCalledTimes(1);
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
    expect(actions[0]?.className).toContain("is-search-trigger");
  });
});
