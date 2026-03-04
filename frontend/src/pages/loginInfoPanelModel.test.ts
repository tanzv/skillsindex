import { describe, expect, it } from "vitest";
import { LoginInfoPanelConfig } from "./loginInfoPanelConfig";
import { buildLoginInfoPanelViewModel } from "./loginInfoPanelModel";

function buildBaseConfig(): LoginInfoPanelConfig {
  return {
    kicker: "Enterprise Intranet",
    title: "Internal Skill Access",
    lead: "Secure access gateway.",
    keyPoints: []
  };
}

describe("buildLoginInfoPanelViewModel", () => {
  it("prioritizes title when resolving headline", () => {
    const viewModel = buildLoginInfoPanelViewModel(buildBaseConfig());
    expect(viewModel.headline).toBe("Internal Skill Access");
  });

  it("falls back to kicker when title is empty", () => {
    const viewModel = buildLoginInfoPanelViewModel({
      ...buildBaseConfig(),
      title: " ",
      kicker: "Identity Control"
    });
    expect(viewModel.headline).toBe("Identity Control");
  });

  it("uses lead as description when available", () => {
    const viewModel = buildLoginInfoPanelViewModel(buildBaseConfig());
    expect(viewModel.description).toBe("Secure access gateway.");
  });

  it("maps key points into checkpoint cards", () => {
    const viewModel = buildLoginInfoPanelViewModel({
      ...buildBaseConfig(),
      keyPoints: ["First policy", "Second policy", "Third policy", "Ignored policy"]
    });

    expect(viewModel.points).toHaveLength(3);
    expect(viewModel.points[0]).toMatchObject({
      body: "First policy"
    });
    expect(viewModel.points[2]).toMatchObject({
      body: "Third policy"
    });
  });

  it("returns no cards when key points are not provided", () => {
    const viewModel = buildLoginInfoPanelViewModel(buildBaseConfig());
    expect(viewModel.points).toHaveLength(0);
  });

  it("keeps description empty when lead is empty", () => {
    const viewModel = buildLoginInfoPanelViewModel({
      ...buildBaseConfig(),
      title: "Internal Skill Access",
      lead: " ",
      kicker: "Enterprise Intranet"
    });
    expect(viewModel.description).toBe("");
  });
});
