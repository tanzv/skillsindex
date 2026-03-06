import { describe, expect, it } from "vitest";
import {
  resolveAvatarInitials,
  resolveVisibleNavigationItems,
  type ExpandableNavItem
} from "./ExpandableNavBar.helpers";

function createItems(count: number): ExpandableNavItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index + 1}`,
    label: `Item ${index + 1}`
  }));
}

describe("ExpandableNavBar.helpers", () => {
  it("returns a single-row subset in collapsed mode when items exceed visible count", () => {
    const state = resolveVisibleNavigationItems(createItems(7), false, 4);
    expect(state.visibleItems).toHaveLength(4);
    expect(state.hiddenItems).toHaveLength(3);
    expect(state.showToggle).toBe(true);
  });

  it("returns all items in expanded mode and keeps toggle available", () => {
    const state = resolveVisibleNavigationItems(createItems(7), true, 4);
    expect(state.visibleItems).toHaveLength(7);
    expect(state.hiddenItems).toHaveLength(0);
    expect(state.showToggle).toBe(true);
  });

  it("hides toggle when no overflow exists", () => {
    const state = resolveVisibleNavigationItems(createItems(3), false, 4);
    expect(state.visibleItems).toHaveLength(3);
    expect(state.hiddenItems).toHaveLength(0);
    expect(state.showToggle).toBe(false);
  });

  it("normalizes invalid visible count to keep at least one visible item", () => {
    const state = resolveVisibleNavigationItems(createItems(3), false, 0);
    expect(state.visibleItems).toHaveLength(1);
    expect(state.hiddenItems).toHaveLength(2);
    expect(state.showToggle).toBe(true);
  });

  it("builds uppercase avatar initials from display name", () => {
    expect(resolveAvatarInitials("Alice Green")).toBe("AG");
    expect(resolveAvatarInitials("bob")).toBe("BO");
    expect(resolveAvatarInitials("  ")).toBe("U");
    expect(resolveAvatarInitials("李雷", "NA")).toBe("NA");
  });
});
