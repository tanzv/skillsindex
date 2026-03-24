import { describe, expect, it, vi } from "vitest";

import { loadAdminAccessSettingsPayloads, saveAdminAccessSettings } from "@/src/lib/api/adminAccessSettings";

describe("admin access settings api", () => {
  it("loads accounts, registration, category catalog, and auth providers through one shared boundary", async () => {
    const fetchJSON = vi.fn<
      <T>(path: string, options?: unknown) => Promise<T>
    >(async <T>(path: string) => {
      const payloadByPath: Record<string, unknown> = {
        "/api/bff/admin/accounts": { total: 3 },
        "/api/bff/admin/settings/registration": { allow_registration: true },
        "/api/bff/admin/settings/marketplace-ranking": { default_sort: "quality", ranking_limit: 18 },
        "/api/bff/admin/settings/category-catalog": {
          items: [
            {
              slug: "team-ops",
              name: "Team Operations",
              description: "Operational workflows for delivery teams.",
              enabled: true,
              sort_order: 10,
              subcategories: [{ slug: "release-management", name: "Release Management", enabled: true, sort_order: 20 }]
            }
          ]
        },
        "/api/bff/admin/settings/presentation-taxonomy": {
          items: [
            {
              slug: "custom-operations",
              name: "Custom Operations",
              description: "Custom grouped operations category.",
              enabled: true,
              sort_order: 10,
              subcategories: [
                {
                  slug: "release-command",
                  name: "Release Command",
                  enabled: true,
                  sort_order: 10,
                  legacy_category_slugs: ["devops"],
                  legacy_subcategory_slugs: ["monitoring"],
                  keywords: ["ops", "governance"]
                }
              ]
            }
          ]
        },
        "/api/bff/admin/settings/auth-providers": { auth_providers: ["password"] }
      };

      return payloadByPath[path] as T;
    });

    await expect(loadAdminAccessSettingsPayloads(fetchJSON)).resolves.toEqual({
      accounts: { total: 3 },
      registration: { allow_registration: true },
      marketplaceRanking: { default_sort: "quality", ranking_limit: 18 },
      categoryCatalog: {
        items: [
          {
            slug: "team-ops",
            name: "Team Operations",
            description: "Operational workflows for delivery teams.",
            enabled: true,
            sort_order: 10,
            subcategories: [{ slug: "release-management", name: "Release Management", enabled: true, sort_order: 20 }]
          }
        ]
      },
      presentationTaxonomy: {
        items: [
          {
            slug: "custom-operations",
            name: "Custom Operations",
            description: "Custom grouped operations category.",
            enabled: true,
            sort_order: 10,
            subcategories: [
              {
                slug: "release-command",
                name: "Release Command",
                enabled: true,
                sort_order: 10,
                legacy_category_slugs: ["devops"],
                legacy_subcategory_slugs: ["monitoring"],
                keywords: ["ops", "governance"]
              }
            ]
          }
        ]
      },
      authProviders: { auth_providers: ["password"] }
    });

    expect(fetchJSON).toHaveBeenCalledTimes(6);
    expect(fetchJSON).toHaveBeenNthCalledWith(1, "/api/bff/admin/accounts");
    expect(fetchJSON).toHaveBeenNthCalledWith(2, "/api/bff/admin/settings/registration");
    expect(fetchJSON).toHaveBeenNthCalledWith(3, "/api/bff/admin/settings/marketplace-ranking");
    expect(fetchJSON).toHaveBeenNthCalledWith(4, "/api/bff/admin/settings/category-catalog");
    expect(fetchJSON).toHaveBeenNthCalledWith(5, "/api/bff/admin/settings/presentation-taxonomy");
    expect(fetchJSON).toHaveBeenNthCalledWith(6, "/api/bff/admin/settings/auth-providers");
  });

  it("saves registration, category catalog, and provider settings through one shared boundary", async () => {
    const fetchJSON = vi.fn<
      <T>(path: string, options?: unknown) => Promise<T>
    >(async <T>() => ({}) as T);

    await saveAdminAccessSettings(
      {
        allowRegistration: true,
        marketplacePublicAccess: false,
        rankingDefaultSort: "quality",
        rankingLimit: 18,
        highlightLimit: 4,
        categoryLeaderLimit: 2,
        categoryCatalog: [
          {
            slug: "team-ops",
            name: "Team Operations",
            description: "Operational workflows for delivery teams.",
            enabled: true,
            sortOrder: 10,
            subcategories: [{ slug: "release-management", name: "Release Management", enabled: true, sortOrder: 20 }]
          }
        ],
        presentationTaxonomy: [
          {
            slug: "custom-operations",
            name: "Custom Operations",
            description: "Custom grouped operations category.",
            enabled: true,
            sortOrder: 10,
            subcategories: [
              {
                slug: "release-command",
                name: "Release Command",
                enabled: true,
                sortOrder: 10,
                legacyCategorySlugs: ["devops"],
                legacySubcategorySlugs: ["monitoring"],
                keywords: ["ops", "governance"]
              }
            ]
          }
        ],
        enabledProviders: ["password", "oidc"]
      },
      fetchJSON
    );

    expect(fetchJSON).toHaveBeenCalledTimes(5);
    expect(fetchJSON).toHaveBeenNthCalledWith(1, "/api/bff/admin/settings/registration", {
      method: "POST",
      body: {
        allow_registration: true,
        marketplace_public_access: false
      }
    });
    expect(fetchJSON).toHaveBeenNthCalledWith(2, "/api/bff/admin/settings/marketplace-ranking", {
      method: "POST",
      body: {
        default_sort: "quality",
        ranking_limit: 18,
        highlight_limit: 4,
        category_leader_limit: 2
      }
    });
    expect(fetchJSON).toHaveBeenNthCalledWith(3, "/api/bff/admin/settings/category-catalog", {
      method: "POST",
      body: {
        items: [
          {
            slug: "team-ops",
            name: "Team Operations",
            description: "Operational workflows for delivery teams.",
            enabled: true,
            sort_order: 10,
            subcategories: [{ slug: "release-management", name: "Release Management", enabled: true, sort_order: 20 }]
          }
        ]
      }
    });
    expect(fetchJSON).toHaveBeenNthCalledWith(4, "/api/bff/admin/settings/presentation-taxonomy", {
      method: "POST",
      body: {
        items: [
          {
            slug: "custom-operations",
            name: "Custom Operations",
            description: "Custom grouped operations category.",
            enabled: true,
            sort_order: 10,
            subcategories: [
              {
                slug: "release-command",
                name: "Release Command",
                enabled: true,
                sort_order: 10,
                legacy_category_slugs: ["devops"],
                legacy_subcategory_slugs: ["monitoring"],
                keywords: ["ops", "governance"]
              }
            ]
          }
        ]
      }
    });
    expect(fetchJSON).toHaveBeenNthCalledWith(5, "/api/bff/admin/settings/auth-providers", {
      method: "POST",
      body: {
        auth_providers: ["password", "oidc"]
      }
    });
  });
});
