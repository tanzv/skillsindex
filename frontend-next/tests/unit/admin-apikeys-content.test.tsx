import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedI18nProvider } from "@/src/lib/i18n/ProtectedI18nProvider";
import type { ProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages";
import { AdminAPIKeysContent } from "@/src/features/adminApiKeys/AdminAPIKeysContent";
import { buildAdminAPIKeyOverview, type AdminAPIKeysPayload } from "@/src/features/adminApiKeys/model";

const payload: AdminAPIKeysPayload = {
  total: 1,
  items: [
    {
      id: 7,
      userId: 42,
      createdBy: 1,
      ownerUsername: "owner-a",
      name: "Primary Key",
      purpose: "Automation",
      prefix: "sk_live",
      scopes: ["skills:read", "skills:write"],
      status: "active",
      revokedAt: "",
      expiresAt: "",
      lastRotatedAt: "",
      lastUsedAt: "2026-03-22T08:00:00Z",
      createdAt: "2026-03-20T08:00:00Z",
      updatedAt: "2026-03-21T08:00:00Z"
    }
  ]
};

const messages = {
  adminCommon: {
    adminEyebrow: "Admin",
    refresh: "Refresh",
    refreshing: "Refreshing",
    clear: "Clear"
  },
  adminApiKeys: {
    pageTitle: "API Keys",
    pageDescription: "Manage API keys.",
    loadError: "Load error",
    createSuccess: "Created",
    createError: "Create error",
    revokeSuccess: "Revoked {keyId}",
    revokeError: "Revoke error",
    rotateSuccess: "Rotated {keyId}",
    rotateError: "Rotate error",
    updateScopesSuccess: "Updated {keyId}",
    updateScopesError: "Update error",
    plaintextSecretTemplate: "Plaintext secret: {plaintextSecret}",
    metricTotalKeys: "Total Keys",
    metricActiveKeys: "Active Keys",
    metricRevokedKeys: "Revoked Keys",
    metricExpiredKeys: "Expired Keys",
    inventoryTitle: "Key Inventory",
    inventoryDescription: "Inspect current keys.",
    filterOwnerAriaLabel: "Filter by owner",
    filterOwnerPlaceholder: "Filter by owner",
    filterStatusAriaLabel: "Filter by status",
    filterStatusOptionAll: "all",
    filterStatusOptionActive: "active",
    filterStatusOptionRevoked: "revoked",
    filterStatusOptionExpired: "expired",
    statusLabelActive: "Active",
    statusLabelRevoked: "Revoked",
    statusLabelExpired: "Expired",
    statusLabelUnknown: "Unknown",
    noPurpose: "No purpose",
    rotateAction: "Rotate",
    rotatingAction: "Rotating...",
    revokeAction: "Revoke",
    revokingAction: "Revoking...",
    openDetailAction: "Open Details",
    closePanelAction: "Close Panel",
    scopeInputAriaLabel: "API key scopes",
    scopeInputPlaceholder: "Update scopes",
    applyScopesAction: "Apply Scopes",
    savingScopesAction: "Saving...",
    inventoryEmpty: "No keys",
    createTitle: "Create Key",
    createDescription: "Issue a new key.",
    createNameAriaLabel: "Create key name",
    createNamePlaceholder: "Create key name",
    createPurposeAriaLabel: "Create key purpose",
    createPurposePlaceholder: "Create key purpose",
    createOwnerUserIdAriaLabel: "Create key owner user ID",
    createOwnerUserIdPlaceholder: "Owner user ID",
    createExpiresInDaysAriaLabel: "Create key expires in days",
    createExpiresInDaysPlaceholder: "Expires in days",
    createScopesAriaLabel: "Create key scopes",
    createScopesPlaceholder: "Scopes separated by commas",
    createAction: "Create Key",
    creatingAction: "Creating...",
    ownerSummaryTitle: "Owner Summary",
    ownerSummaryDescription: "Summary",
    ownerUnknown: "Unknown Owner",
    unnamedKey: "Unnamed Key",
    valueNotAvailable: "n/a",
    detailOwnerLabel: "Owner",
    detailScopeCountLabel: "Scope Count",
    detailUserIdLabel: "User ID",
    detailCreatedByLabel: "Created By",
    metaPrefixTemplate: "prefix {value}",
    metaCreatedTemplate: "created {value}",
    metaUpdatedTemplate: "updated {value}",
    metaLastUsedTemplate: "last used {value}"
  }
} as unknown as ProtectedPageMessages;

describe("AdminAPIKeysContent", () => {
  it("renders the inline detail pane for the selected key", () => {
    const overview = buildAdminAPIKeyOverview(payload, {
      metricTotalKeys: "Total Keys",
      metricActiveKeys: "Active Keys",
      metricRevokedKeys: "Revoked Keys",
      metricExpiredKeys: "Expired Keys",
      ownerUnknown: "Unknown Owner"
    });

    const markup = renderToStaticMarkup(
      createElement(
        ProtectedI18nProvider,
        {
          locale: "en",
          messages
        },
        createElement(AdminAPIKeysContent, {
          loading: false,
          busyAction: "",
          error: "",
          message: "",
          plaintextSecret: "",
          payload,
          overview,
          filters: { owner: "", status: "all" },
          createDraft: {
            name: "",
            purpose: "",
            expiresInDays: "90",
            ownerUserId: "",
            scopes: ""
          },
          scopeDrafts: {
            7: "skills:read, skills:write"
          },
          activePane: "detail",
          selectedItem: payload.items[0],
          onRefresh: () => {},
          onFiltersChange: () => {},
          onResetFilters: () => {},
          onCreateDraftChange: () => {},
          onScopeDraftChange: () => {},
          onOpenCreateDrawer: () => {},
          onOpenDetail: () => {},
          onClosePane: () => {},
          onCreateKey: () => {},
          onRotateKey: () => {},
          onRevokeKey: () => {},
          onUpdateScopes: () => {}
        })
      )
    );

    expect(markup).toContain("Open Details");
    expect(markup).toContain('data-testid="admin-apikeys-detail-pane"');
    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain("Primary Key");
    expect(markup).toContain("Apply Scopes");
    expect(markup).toContain("Rotate");
    expect(markup).toContain("Revoke");
    expect(markup).toContain("Close Panel");
  });
});
