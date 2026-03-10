import { describe, expect, it } from "vitest";

import { instantiatePrototypeRoute, prototypeCatalog } from "../../lib/prototypeCatalog";
import { resolvePrototypeImplementationTarget } from "./PrototypeRouteRenderer";

describe("prototype implementation audit", () => {
  it("ensures every prototype catalog route resolves to a concrete implementation", () => {
    const fallbackRoutes = prototypeCatalog
      .map((entry) => ({
        routePattern: entry.primaryRoute,
        routePath: instantiatePrototypeRoute(entry.primaryRoute),
        target: resolvePrototypeImplementationTarget(instantiatePrototypeRoute(entry.primaryRoute))
      }))
      .filter((item) => item.target === "fallback")
      .map((item) => `${item.routePattern} -> ${item.routePath}`);

    expect(
      fallbackRoutes,
      fallbackRoutes.length > 0
        ? `Found prototype routes mapped to fallback renderer:\n${fallbackRoutes.join("\n")}`
        : "All prototype routes are mapped to concrete implementations."
    ).toEqual([]);
  });
});
