import { describe, expect, it } from "vitest";

import { createGlobalNavigationRegistry } from "./globalNavigationRegistry";

describe("globalNavigationRegistry", () => {
  it("registers and resolves items by slot in order", () => {
    const registry = createGlobalNavigationRegistry<
      "topbar" | "sidebar",
      { id: string; label: string }
    >([
      {
        key: "one",
        slot: "topbar",
        order: 20,
        item: { id: "one", label: "One" }
      },
      {
        key: "two",
        slot: "topbar",
        order: 10,
        item: { id: "two", label: "Two" }
      }
    ]);

    registry.register({
      key: "sidebar-entry",
      slot: "sidebar",
      order: 30,
      item: { id: "three", label: "Three" }
    });

    expect(registry.resolve("topbar")).toEqual([
      { id: "two", label: "Two" },
      { id: "one", label: "One" }
    ]);
    expect(registry.resolve("sidebar")).toEqual([{ id: "three", label: "Three" }]);
  });

  it("overrides duplicate key and supports unregister", () => {
    const registry = createGlobalNavigationRegistry<"topbar", { id: string }>();

    registry.register({
      key: "duplicate",
      slot: "topbar",
      order: 10,
      item: { id: "old" }
    });
    registry.register({
      key: "duplicate",
      slot: "topbar",
      order: 5,
      item: { id: "new" }
    });

    expect(registry.resolve("topbar")).toEqual([{ id: "new" }]);
    registry.unregister("duplicate");
    expect(registry.resolve("topbar")).toEqual([]);
  });
});
