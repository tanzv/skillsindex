import { describe, expect, it } from "vitest";
import {
  createMarketplaceTopbarRightRegistry,
  type MarketplaceTopbarRightRegistration
} from "./MarketplaceTopbar.rightRegistry";

function createRegistration(key: string, slot: "light" | "dark" | "both", order: number): MarketplaceTopbarRightRegistration {
  return {
    key,
    slot,
    order,
    render: () => key
  };
}

describe("MarketplaceTopbar right registry", () => {
  it("returns registrations sorted by order and key", () => {
    const registry = createMarketplaceTopbarRightRegistry([
      createRegistration("third", "dark", 30),
      createRegistration("first", "dark", 10),
      createRegistration("second-b", "dark", 20),
      createRegistration("second-a", "dark", 20)
    ]);

    expect(registry.resolve("dark").map((item) => item.key)).toEqual(["first", "second-a", "second-b", "third"]);
  });

  it("filters registrations by slot", () => {
    const registry = createMarketplaceTopbarRightRegistry([
      createRegistration("light-only", "light", 10),
      createRegistration("dark-only", "dark", 20),
      createRegistration("both", "both", 30)
    ]);

    expect(registry.resolve("light").map((item) => item.key)).toEqual(["light-only", "both"]);
    expect(registry.resolve("dark").map((item) => item.key)).toEqual(["dark-only", "both"]);
  });

  it("allows later registrations to override existing keys", () => {
    const registry = createMarketplaceTopbarRightRegistry([
      createRegistration("override-me", "dark", 10)
    ]);

    registry.register(createRegistration("override-me", "dark", 99));
    const resolved = registry.resolve("dark");
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.order).toBe(99);
  });
});
