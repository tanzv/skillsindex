import { describe, expect, it } from "vitest";

import {
  isPublicTopbarNavSectionActive,
  listPublicNarrativeRouteDescriptors,
  listPublicTopbarNavRegistrations,
  resolvePublicNarrativeRouteDescriptor,
  resolvePublicNarrativeRouteDescriptorById,
  resolvePublicRouteStage,
  resolvePublicShellRouteKind,
  resolvePublicTopbarRoutePresetDescriptor,
  resolvePublicTopbarNavSection
} from "@/src/lib/navigation/publicNavigationRegistry";

describe("public navigation registry", () => {
  it("keeps public topbar navigation sections explicit and stable", () => {
    expect(listPublicTopbarNavRegistrations()).toEqual([
      {
        id: "categories",
        href: "/categories",
        matchPrefixes: ["/categories"]
      },
      {
        id: "rankings",
        href: "/rankings",
        matchPrefixes: ["/rankings", "/compare"]
      },
      {
        id: "docs",
        href: "/docs",
        matchPrefixes: ["/about", "/docs", "/governance", "/rollout", "/timeline", "/states"]
      }
    ]);

    expect(listPublicNarrativeRouteDescriptors()).toEqual([
      {
        id: "about",
        corePath: "/about",
        navSection: "docs",
        shellRouteKind: "narrative"
      },
      {
        id: "docs",
        corePath: "/docs",
        navSection: "docs",
        shellRouteKind: "narrative"
      },
      {
        id: "governance",
        corePath: "/governance",
        navSection: "docs",
        shellRouteKind: "narrative"
      },
      {
        id: "rollout",
        corePath: "/rollout",
        navSection: "docs",
        shellRouteKind: "narrative"
      },
      {
        id: "timeline",
        corePath: "/timeline",
        navSection: "docs",
        shellRouteKind: "narrative"
      },
      {
        id: "states",
        corePath: "/states",
        navSection: "docs",
        shellRouteKind: "default"
      }
    ]);
  });

  it("resolves nav sections, stages, and shell kinds from one shared route classifier", () => {
    expect(resolvePublicTopbarNavSection("/categories/operations")).toBe("categories");
    expect(resolvePublicTopbarNavSection("/compare")).toBe("rankings");
    expect(resolvePublicTopbarNavSection("/governance")).toBe("docs");
    expect(resolvePublicTopbarNavSection("/results")).toBeNull();
    expect(resolvePublicNarrativeRouteDescriptorById("timeline")).toEqual({
      id: "timeline",
      corePath: "/timeline",
      navSection: "docs",
      shellRouteKind: "narrative"
    });
    expect(resolvePublicNarrativeRouteDescriptor("/states/error")).toEqual({
      id: "states",
      corePath: "/states",
      navSection: "docs",
      shellRouteKind: "default"
    });

    expect(isPublicTopbarNavSectionActive("/timeline", "docs")).toBe(true);
    expect(isPublicTopbarNavSectionActive("/rankings", "categories")).toBe(false);

    expect(resolvePublicRouteStage("/")).toBe("landing");
    expect(resolvePublicRouteStage("/categories/operations")).toBe("categories");
    expect(resolvePublicRouteStage("/compare")).toBe("rankings");
    expect(resolvePublicRouteStage("/skills/42")).toBe("skill-detail");
    expect(resolvePublicRouteStage("/search")).toBe("results");
    expect(resolvePublicRouteStage("/login")).toBe("access");
    expect(resolvePublicRouteStage("/governance")).toBe("marketplace");

    expect(resolvePublicShellRouteKind("/")).toBe("landing");
    expect(resolvePublicShellRouteKind("/results")).toBe("section");
    expect(resolvePublicShellRouteKind("/categories/engineering")).toBe("section");
    expect(resolvePublicShellRouteKind("/skills/14")).toBe("skill-detail");
    expect(resolvePublicShellRouteKind("/docs")).toBe("narrative");
    expect(resolvePublicShellRouteKind("/login")).toBe("default");

    expect(resolvePublicTopbarRoutePresetDescriptor("/")).toEqual({
      variant: "landing"
    });
    expect(resolvePublicTopbarRoutePresetDescriptor("/categories")).toEqual({
      variant: "market",
      stageId: "categories",
      breadcrumbKind: "categories-index"
    });
    expect(resolvePublicTopbarRoutePresetDescriptor("/categories/operations")).toEqual({
      variant: "market",
      stageId: "categories",
      breadcrumbKind: "category-detail"
    });
    expect(resolvePublicTopbarRoutePresetDescriptor("/compare")).toEqual({
      variant: "market",
      stageId: "rankings",
      breadcrumbKind: "rankings"
    });
    expect(resolvePublicTopbarRoutePresetDescriptor("/skills/42")).toEqual({
      variant: "skill-detail",
      stageId: "skill-detail",
      breadcrumbKind: "skill-detail"
    });
    expect(resolvePublicTopbarRoutePresetDescriptor("/search")).toEqual({
      variant: "market",
      stageId: "results",
      breadcrumbKind: "results"
    });
    expect(resolvePublicTopbarRoutePresetDescriptor("/docs")).toBeNull();
  });
});
