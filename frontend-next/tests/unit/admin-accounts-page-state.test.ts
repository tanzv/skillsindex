import { describe, expect, it } from "vitest";

import {
  buildAdminAccountsSettingsDraft,
  syncAccountEditorFromSelectedAccount,
  syncRoleEditorFromSelectedAccount
} from "@/src/features/adminAccounts/pageState";

const selectedAccount = {
  id: 7,
  username: "operator",
  role: "admin",
  status: "disabled",
  createdAt: "2026-03-02T00:00:00Z",
  updatedAt: "2026-03-04T00:00:00Z",
  forceLogoutAt: ""
};

describe("admin accounts page state", () => {
  it("builds a detached settings draft from normalized governance payloads", () => {
    const categoryCatalog = {
      items: [
        {
          slug: "design",
          name: "Design",
          description: "Design category",
          enabled: true,
          sortOrder: 10,
          subcategories: [
            {
              slug: "motion",
              name: "Motion",
              enabled: true,
              sortOrder: 10
            }
          ]
        }
      ]
    };
    const presentationTaxonomy = {
      items: [
        {
          slug: "creative",
          name: "Creative",
          description: "Creative category",
          enabled: true,
          sortOrder: 10,
          subcategories: [
            {
              slug: "visual",
              name: "Visual",
              enabled: true,
              sortOrder: 10,
              legacyCategorySlugs: ["art"],
              legacySubcategorySlugs: ["illustration"],
              keywords: ["visual"]
            }
          ]
        }
      ]
    };
    const draft = buildAdminAccountsSettingsDraft({
      registration: {
        allowRegistration: true,
        marketplacePublicAccess: false
      },
      marketplaceRanking: {
        defaultSort: "quality",
        rankingLimit: 24,
        highlightLimit: 4,
        categoryLeaderLimit: 6
      },
      categoryCatalog,
      presentationTaxonomy,
      authProviders: {
        authProviders: ["password", "github"],
        availableAuthProviders: ["password", "github", "oidc"]
      }
    });

    expect(draft).toEqual({
      allowRegistration: true,
      marketplacePublicAccess: false,
      rankingDefaultSort: "quality",
      rankingLimit: 24,
      highlightLimit: 4,
      categoryLeaderLimit: 6,
      categoryCatalog: categoryCatalog.items,
      presentationTaxonomy: presentationTaxonomy.items,
      enabledProviders: ["password", "github"]
    });
    expect(draft.categoryCatalog).not.toBe(categoryCatalog.items);
    expect(draft.categoryCatalog[0]).not.toBe(categoryCatalog.items[0]);
    expect(draft.categoryCatalog[0]?.subcategories).not.toBe(categoryCatalog.items[0]?.subcategories);
    expect(draft.presentationTaxonomy).not.toBe(presentationTaxonomy.items);
    expect(draft.presentationTaxonomy[0]).not.toBe(presentationTaxonomy.items[0]);
    expect(draft.presentationTaxonomy[0]?.subcategories[0]?.keywords).not.toBe(
      presentationTaxonomy.items[0]?.subcategories[0]?.keywords
    );
    expect(draft.enabledProviders).not.toBe(categoryCatalog.items as never);
  });

  it("syncs the account editor to the selected account only when identity changes", () => {
    const currentEditor = {
      userId: "3",
      status: "active",
      newPassword: "retain-me"
    };

    expect(syncAccountEditorFromSelectedAccount(currentEditor, null)).toBe(currentEditor);

    const nextEditor = syncAccountEditorFromSelectedAccount(currentEditor, selectedAccount);
    expect(nextEditor).toEqual({
      userId: "7",
      status: "disabled",
      newPassword: "retain-me"
    });
    expect(nextEditor).not.toBe(currentEditor);

    expect(syncAccountEditorFromSelectedAccount(nextEditor, selectedAccount)).toBe(nextEditor);
  });

  it("syncs the role editor to the selected account only when identity changes", () => {
    const currentEditor = {
      userId: "3",
      role: "member"
    };

    expect(syncRoleEditorFromSelectedAccount(currentEditor, null)).toBe(currentEditor);

    const nextEditor = syncRoleEditorFromSelectedAccount(currentEditor, selectedAccount);
    expect(nextEditor).toEqual({
      userId: "7",
      role: "admin"
    });
    expect(nextEditor).not.toBe(currentEditor);

    expect(syncRoleEditorFromSelectedAccount(nextEditor, selectedAccount)).toBe(nextEditor);
  });
});
