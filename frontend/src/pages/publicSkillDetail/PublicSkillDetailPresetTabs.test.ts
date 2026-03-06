import { describe, expect, it } from "vitest";
import { resolveNextPresetTabKeyByKeyboard, skillDetailPresetTabs } from "./PublicSkillDetailPresetTabs";

describe("PublicSkillDetailPresetTabs", () => {
  it("exposes stable preset tab ordering", () => {
    expect(skillDetailPresetTabs.map((item) => item.key)).toEqual(["skill", "readme", "changelog"]);
  });

  it("resolves next tab keys for arrow, home and end navigation", () => {
    expect(resolveNextPresetTabKeyByKeyboard(0, "ArrowRight")).toBe("readme");
    expect(resolveNextPresetTabKeyByKeyboard(2, "ArrowRight")).toBe("skill");
    expect(resolveNextPresetTabKeyByKeyboard(0, "ArrowLeft")).toBe("changelog");
    expect(resolveNextPresetTabKeyByKeyboard(2, "Home")).toBe("skill");
    expect(resolveNextPresetTabKeyByKeyboard(0, "End")).toBe("changelog");
  });

  it("returns null for unsupported keyboard keys", () => {
    expect(resolveNextPresetTabKeyByKeyboard(1, "Enter")).toBeNull();
  });
});
