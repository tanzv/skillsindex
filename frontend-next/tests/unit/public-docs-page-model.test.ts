import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/lib/marketplace/fallback";
import { buildPublicDocsPageModel } from "@/src/features/public/publicDocsPageModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  docsAppRouterBadge: "App Router",
  docsAppRouterDescription: "Route-first composition.",
  docsAppRouterTitle: "Routing Surface",
  docsBackendBadge: "Go API",
  docsBackendDescription: "Backend contracts and BFF boundaries.",
  docsBackendTitle: "Backend Integration",
  docsDescription: "System docs and implementation direction.",
  docsDesignSystemBadge: "Design System",
  docsDesignSystemDescription: "Token-first visual rules.",
  docsDesignSystemTitle: "Design Foundation",
  docsEyebrow: "Docs",
  docsQuickLinkAdmin: "Admin overview",
  docsQuickLinkMarketplace: "Marketplace home",
  docsQuickLinkWorkspace: "Workspace",
  docsQuickLinksTitle: "Quick Links",
  docsTitle: "Documentation",
  governanceTitle: "Governance",
  metricCategoryFamilies: "Category families",
  metricTopTagPivots: "Top tag pivots",
  resultsDiscoveryNotesDescription: "Discovery notes.",
  resultsDiscoveryNotesTitle: "Discovery Notes",
  shellHome: "Home",
  skillCountSuffix: "skills",
  stageAccess: "Access",
  stageLanding: "Landing",
  statCategories: "Categories",
  statTopTags: "Top Tags"
} as PublicMarketplaceMessages;

describe("public docs page model", () => {
  it("builds stable docs stage stats, links, and tags from marketplace data", () => {
    const marketplace = buildPublicMarketplaceFallback();

    const model = buildPublicDocsPageModel({
      marketplace,
      messages,
      resolvePath: (route) => `/public${route}`
    });

    expect(model.eyebrow).toBe("Docs");
    expect(model.title).toBe("Documentation");
    expect(model.description).toBe("System docs and implementation direction.");
    expect(model.stats).toEqual([
      {
        label: "Routing Surface",
        value: "App Router",
        detail: "Route-first composition."
      },
      {
        label: "Design Foundation",
        value: "Design System",
        detail: "Token-first visual rules."
      },
      {
        label: "Backend Integration",
        value: "Go API",
        detail: "Backend contracts and BFF boundaries."
      },
      {
        label: "Categories",
        value: String(marketplace.categories.length),
        detail: "Category families"
      }
    ]);
    expect(model.platformSection.badges).toEqual(["App Router", "Design System", "Go API"]);
    expect(model.snapshotSection.links).toHaveLength(Math.min(marketplace.categories.length, 4));
    expect(model.snapshotSection.links?.[0]).toEqual({
      key: marketplace.categories[0]?.slug,
      href: `/public/categories/${marketplace.categories[0]?.slug}`,
      label: marketplace.categories[0]?.name,
      meta: `${marketplace.categories[0]?.count} skills`
    });
    expect(model.quickLinksSection.links).toEqual([
      {
        key: "docs-marketplace",
        href: "/public/",
        label: "Marketplace home",
        meta: "Landing"
      },
      {
        key: "docs-workspace",
        href: "/workspace",
        label: "Workspace",
        meta: "Access"
      },
      {
        key: "docs-admin",
        href: "/admin/overview",
        label: "Admin overview",
        meta: "Governance"
      }
    ]);
    expect(model.tagsSection.title).toBe("Top Tags");
    expect(model.tagsSection.description).toBe("Top tag pivots");
    expect(model.tagsSection.tags).toEqual(
      marketplace.top_tags.slice(0, 6).map((tag) => tag.name)
    );
  });
});
