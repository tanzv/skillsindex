import { describe, expect, it } from "vitest";

import { resolveWorkspacePrototypeLayoutVariant } from "./WorkspacePrototypePageShell.helpers";

describe("resolveWorkspacePrototypeLayoutVariant", () => {
  it("defaults secondary sidebar shells to full-width", () => {
    expect(
      resolveWorkspacePrototypeLayoutVariant({
        shouldRenderSecondarySidebar: true
      })
    ).toBe("full-width");
  });

  it("keeps default layout for non-secondary shells", () => {
    expect(
      resolveWorkspacePrototypeLayoutVariant({
        shouldRenderSecondarySidebar: false
      })
    ).toBe("default");
  });

  it("respects explicit layout overrides", () => {
    expect(
      resolveWorkspacePrototypeLayoutVariant({
        layoutVariant: "default",
        shouldRenderSecondarySidebar: true
      })
    ).toBe("default");
  });
});
